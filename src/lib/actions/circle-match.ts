"use server";

import { requireAuthenticatedMember } from "@/lib/auth";
import { MAX_GOALS, MAX_NOTE_LENGTH } from "@/lib/constants";
import { rankCircleMatches } from "@/lib/matching";
import { getDataStore } from "@/lib/data/store";
import {
  inputFromPreferences,
  preferencesFromInput,
} from "@/lib/data/types";
import type {
  CircleMatch,
  JoinRequest,
  MatchFormInput,
  MemberPreferences,
  Profile,
} from "@/lib/types";

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
  const validationError = validatePreferences(input);
  if (validationError) return { ok: false, error: validationError };

  try {
    const memberId = await requireAuthenticatedMember();
    const store = getDataStore();
    const preferences = preferencesFromInput(input);
    const profile = await store.savePreferences(memberId, preferences);
    return { ok: true, data: { profile, mode: store.mode } };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to save preferences. Please try again.",
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
  try {
    await requireAuthenticatedMember();
    const store = getDataStore();
    const profile = await store.getDemoProfile();
    return {
      ok: true,
      data: {
        preferences: profile.preferences,
        profile,
        mode: store.mode,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load your preferences.",
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
  try {
    await requireAuthenticatedMember();
    const store = getDataStore();
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

    const circles = await store.listCircles();
    let ranked = rankCircleMatches(input, circles);

    if (filters?.format && filters.format !== "all") {
      ranked = ranked.filter((match) => {
        if (filters.format === "virtual") {
          return (
            match.circle.format === "virtual" ||
            match.circle.format === "hybrid"
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
      ranked = ranked.filter((match) => match.circle.meetsWeeknights);
    }

    return {
      ok: true,
      data: {
        matches: ranked.slice(0, 3),
        allMatches: ranked,
        preferences: profile.preferences,
        mode: store.mode,
      },
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load Circle matches.",
    };
  }
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
    const store = getDataStore();
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
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : undefined;

    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to submit your join request.",
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
    const store = getDataStore();
    const request = await store.getJoinRequest(memberId, circleId);
    return { ok: true, data: { request, mode: store.mode } };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Unable to load join request status.",
    };
  }
}

export async function getCircleBySlugAction(slug: string) {
  try {
    const memberId = await requireAuthenticatedMember();
    const store = getDataStore();
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
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to load this Circle.",
    };
  }
}
