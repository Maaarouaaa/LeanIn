"use server";

import { requireAuthenticatedMember } from "@/lib/auth";
import { MAX_GOALS, MAX_NOTE_LENGTH } from "@/lib/constants";
import { rankCircleMatches } from "@/lib/matching";
import { getDataStore } from "@/lib/data/store";
import {
  inputFromPreferences,
  preferencesFromInput,
} from "@/lib/data/types";
import { logSupabaseError } from "@/lib/supabase/server";
import {
  SUPABASE_QUERY_TIMEOUT_MS,
  TimeoutError,
  withTimeout,
} from "@/lib/with-timeout";
import type {
  CircleMatch,
  JoinRequest,
  MatchFormInput,
  MemberPreferences,
  Profile,
} from "@/lib/types";

function logActionError(context: string, error: unknown) {
  logSupabaseError(context, error);
}

function logStage(stage: string, phase: "start" | "end", extra?: Record<string, unknown>) {
  console.info(`[circle-match] stage:${stage} ${phase}`, extra ?? {});
}

function toUserFacingError(error: unknown, fallback: string): string {
  if (error instanceof TimeoutError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

function validatePreferences(input: MatchFormInput): string | null {
  if (!input.goals.length) return "Select at least one support goal.";
  if (input.goals.length > MAX_GOALS) return "Choose up to three goals.";
  if (!input.careerStage) return "Select your career stage.";
  if (!input.format) return "Select a preferred meeting format.";
  if (!input.frequency) return "Select a preferred meeting frequency.";
  if (!input.location.trim()) return "Enter your location.";
  return null;
}

export async function saveMemberPreferences(
  input: MatchFormInput,
): Promise<ActionResult<{ profile: Profile; mode: "supabase" | "memory" }>> {
  const actionStarted = Date.now();
  logStage("saveMemberPreferences", "start", {
    goalCount: input.goals?.length ?? 0,
    hasCareerStage: Boolean(input.careerStage),
    hasFormat: Boolean(input.format),
    hasFrequency: Boolean(input.frequency),
    hasLocation: Boolean(input.location?.trim()),
  });

  const validationError = validatePreferences(input);
  if (validationError) {
    logStage("saveMemberPreferences", "end", {
      ok: false,
      reason: "validation",
      ms: Date.now() - actionStarted,
    });
    return { ok: false, error: validationError };
  }

  // Keep redirect()/navigation on the client. Next.js implements redirect via throw.
  try {
    logStage("saveMemberPreferences.auth", "start");
    const memberId = await requireAuthenticatedMember();
    logStage("saveMemberPreferences.auth", "end", {
      ok: true,
      memberIdPresent: Boolean(memberId),
    });

    logStage("saveMemberPreferences.getDataStore", "start");
    const store = await getDataStore();
    logStage("saveMemberPreferences.getDataStore", "end", {
      ok: true,
      mode: store.mode,
    });

    const preferences = preferencesFromInput(input);

    logStage("saveMemberPreferences.savePreferences", "start", {
      mode: store.mode,
    });
    const profile = await store.savePreferences(memberId, preferences);
    logStage("saveMemberPreferences.savePreferences", "end", {
      ok: true,
      mode: store.mode,
      profileIdPresent: Boolean(profile?.id),
    });

    logStage("saveMemberPreferences", "end", {
      ok: true,
      mode: store.mode,
      ms: Date.now() - actionStarted,
    });
    return { ok: true, data: { profile, mode: store.mode } };
  } catch (error) {
    logActionError("saveMemberPreferences failed", error);
    logStage("saveMemberPreferences", "end", {
      ok: false,
      reason: error instanceof TimeoutError ? "timeout" : "exception",
      ms: Date.now() - actionStarted,
    });
    return {
      ok: false,
      error: toUserFacingError(
        error,
        "Unable to save preferences. Please try again.",
      ),
    };
  }
}

export async function getMemberPreferences(): Promise<
  ActionResult<{
    preferences: MemberPreferences | null;
    profile: Profile;
    mode: "supabase" | "memory";
  }>
> {
  logStage("getMemberPreferences", "start");
  try {
    await requireAuthenticatedMember();
    const store = await getDataStore();
    const profile = await store.getDemoProfile();
    logStage("getMemberPreferences", "end", {
      ok: true,
      mode: store.mode,
      hasPreferences: Boolean(profile.preferences),
    });
    return {
      ok: true,
      data: {
        preferences: profile.preferences,
        profile,
        mode: store.mode,
      },
    };
  } catch (error) {
    logActionError("getMemberPreferences failed", error);
    logStage("getMemberPreferences", "end", { ok: false });
    return {
      ok: false,
      error: toUserFacingError(error, "Unable to load your preferences."),
    };
  }
}

export async function getRankedMatches(filters?: {
  format?: string;
  weeknights?: boolean;
}): Promise<
  ActionResult<{
    matches: CircleMatch[];
    allMatches: CircleMatch[];
    preferences: MemberPreferences | null;
    mode: "supabase" | "memory";
  }>
> {
  const started = Date.now();
  logStage("getRankedMatches", "start");

  try {
    const result = await withTimeout(
      computeRankedMatches(filters),
      SUPABASE_QUERY_TIMEOUT_MS,
      "Loading matches timed out. Please try again.",
    );
    logStage("getRankedMatches", "end", {
      ok: result.ok,
      ms: Date.now() - started,
      matchCount: result.ok ? result.data.matches.length : 0,
    });
    return result;
  } catch (error) {
    logActionError("getRankedMatches failed", error);
    logStage("getRankedMatches", "end", {
      ok: false,
      reason: error instanceof TimeoutError ? "timeout" : "exception",
      ms: Date.now() - started,
    });
    return {
      ok: false,
      error: toUserFacingError(error, "Unable to load Circle matches."),
    };
  }
}

/**
 * Rank every retrieved Circle by preference score, then return the top three.
 * Optional UI filters may narrow the list but never retry/fill back up to three.
 */
async function computeRankedMatches(filters?: {
  format?: string;
  weeknights?: boolean;
}): Promise<
  ActionResult<{
    matches: CircleMatch[];
    allMatches: CircleMatch[];
    preferences: MemberPreferences | null;
    mode: "supabase" | "memory";
  }>
> {
  await requireAuthenticatedMember();
  const store = await getDataStore();
  const profile = await store.getDemoProfile();

  if (!profile.preferences) {
    return {
      ok: true,
      data: {
        matches: [],
        allMatches: [],
        preferences: null,
        mode: store.mode,
      },
    };
  }

  const input = inputFromPreferences(profile.preferences);
  if (!input) {
    return {
      ok: true,
      data: {
        matches: [],
        allMatches: [],
        preferences: profile.preferences,
        mode: store.mode,
      },
    };
  }

  logStage("getRankedMatches.listCircles", "start");
  const circles = await store.listCircles();
  const circleList = Array.isArray(circles) ? circles : [];
  logStage("getRankedMatches.listCircles", "end", {
    ok: true,
    circleCount: circleList.length,
  });

  // Preferences affect scores only — every Circle is scored and sorted once.
  const ranked = rankCircleMatches(input, circleList);

  // Optional display filters: narrow only, never loop to refill length === 3.
  let displayRanked = ranked;
  if (filters?.format && filters.format !== "all") {
    displayRanked = displayRanked.filter((match) => {
      if (filters.format === "virtual") {
        return (
          match.circle.format === "virtual" || match.circle.format === "hybrid"
        );
      }
      if (filters.format === "in-person") {
        return (
          match.circle.format === "in-person" ||
          match.circle.format === "hybrid"
        );
      }
      return true;
    });
  }
  if (filters?.weeknights) {
    displayRanked = displayRanked.filter((match) => match.circle.meetsWeeknights);
  }

  const matches = displayRanked.slice(0, 3);
  console.info("[circle-match] stage:getRankedMatches.results", {
    scoredCount: ranked.length,
    afterFilters: displayRanked.length,
    returned: matches.length,
  });

  return {
    ok: true,
    data: {
      matches,
      allMatches: displayRanked,
      preferences: profile.preferences,
      mode: store.mode,
    },
  };
}

export async function createJoinRequestAction(input: {
  circleId: string;
  note?: string;
}): Promise<ActionResult<{ request: JoinRequest; mode: "supabase" | "memory" }>> {
  if (!input.circleId) return { ok: false, error: "Circle is required." };
  if ((input.note?.length ?? 0) > MAX_NOTE_LENGTH) {
    return {
      ok: false,
      error: `Notes must be ${MAX_NOTE_LENGTH} characters or fewer.`,
    };
  }

  try {
    const memberId = await requireAuthenticatedMember();
    const store = await getDataStore();
    const existing = await store.getJoinRequest(memberId, input.circleId);
    if (existing && existing.status === "pending") {
      return {
        ok: false,
        error: "You already have a request for this Circle.",
        code: "DUPLICATE_REQUEST",
      };
    }

    const request = await store.createJoinRequest({
      profileId: memberId,
      circleId: input.circleId,
      note: input.note,
    });

    return { ok: true, data: { request, mode: store.mode } };
  } catch (error) {
    logActionError("createJoinRequestAction failed", error);
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : undefined;

    return {
      ok: false,
      error: toUserFacingError(error, "Unable to submit your join request."),
      code,
    };
  }
}

export async function getJoinRequestStatus(
  circleId: string,
): Promise<
  ActionResult<{ request: JoinRequest | null; mode: "supabase" | "memory" }>
> {
  try {
    const memberId = await requireAuthenticatedMember();
    const store = await getDataStore();
    const request = await store.getJoinRequest(memberId, circleId);
    return { ok: true, data: { request, mode: store.mode } };
  } catch (error) {
    logActionError("getJoinRequestStatus failed", error);
    return {
      ok: false,
      error: toUserFacingError(error, "Unable to load join request status."),
    };
  }
}

export async function getCircleBySlugAction(slug: string) {
  try {
    const memberId = await requireAuthenticatedMember();
    const store = await getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return { ok: false as const, error: "Circle not found." };
    }

    const request = await store.getJoinRequest(memberId, circle.id);
    const profile = await store.getDemoProfile();
    let match: CircleMatch | null = null;
    if (profile.preferences) {
      const input = inputFromPreferences(profile.preferences);
      if (input) {
        match = rankCircleMatches(input, [circle])[0] ?? null;
      }
    }

    return {
      ok: true as const,
      data: { circle, request, match, mode: store.mode },
    };
  } catch (error) {
    logActionError("getCircleBySlugAction failed", error);
    return {
      ok: false as const,
      error: toUserFacingError(error, "Unable to load this Circle."),
    };
  }
}
