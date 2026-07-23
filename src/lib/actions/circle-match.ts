"use server";

import { DEMO_PROFILE_ID } from "@/lib/constants";
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
  if (!input.supportTypes.length) {
    return "Select at least one kind of support.";
  }
  if (!input.careerStage) {
    return "Select your career stage.";
  }
  if (!input.goals.length) {
    return "Select at least one topic or goal.";
  }
  if (!input.format) {
    return "Select a meeting format preference.";
  }
  if (!input.frequency) {
    return "Select a preferred meeting frequency.";
  }
  if (!input.location.trim()) {
    return "Enter your location.";
  }
  return null;
}

export async function saveMemberPreferences(
  input: MatchFormInput,
): Promise<ActionResult<{ profile: Profile; mode: "supabase" | "memory" }>> {
  const validationError = validatePreferences(input);
  if (validationError) {
    return { ok: false, error: validationError };
  }

  try {
    const store = getDataStore();
    const preferences = preferencesFromInput(input);
    const profile = await store.savePreferences(DEMO_PROFILE_ID, preferences);
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
  minScore?: number;
}): Promise<
  ActionResult<{
    matches: CircleMatch[];
    preferences: MemberPreferences | null;
    mode: "supabase" | "memory";
  }>
> {
  try {
    const store = getDataStore();
    const profile = await store.getDemoProfile();
    if (!profile.preferences) {
      return {
        ok: true,
        data: { matches: [], preferences: null, mode: store.mode },
      };
    }

    const input = inputFromPreferences(profile.preferences);
    if (!input) {
      return {
        ok: true,
        data: {
          matches: [],
          preferences: profile.preferences,
          mode: store.mode,
        },
      };
    }

    const circles = await store.listCircles();
    let matches = rankCircleMatches(input, circles);

    if (filters?.format && filters.format !== "all") {
      matches = matches.filter(
        (match) =>
          match.circle.format === filters.format ||
          (filters.format === "hybrid" && match.circle.format === "hybrid"),
      );
    }

    if (typeof filters?.minScore === "number") {
      matches = matches.filter((match) => match.score >= filters.minScore!);
    }

    return {
      ok: true,
      data: {
        matches: matches.slice(0, 3),
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

export async function getAllRankedMatches(): Promise<
  ActionResult<{
    matches: CircleMatch[];
    preferences: MemberPreferences | null;
    mode: "supabase" | "memory";
  }>
> {
  try {
    const store = getDataStore();
    const profile = await store.getDemoProfile();
    if (!profile.preferences) {
      return {
        ok: true,
        data: { matches: [], preferences: null, mode: store.mode },
      };
    }

    const input = inputFromPreferences(profile.preferences);
    if (!input) {
      return {
        ok: true,
        data: {
          matches: [],
          preferences: profile.preferences,
          mode: store.mode,
        },
      };
    }

    const circles = await store.listCircles();
    const matches = rankCircleMatches(input, circles);

    return {
      ok: true,
      data: { matches, preferences: profile.preferences, mode: store.mode },
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
  if (!input.circleId) {
    return { ok: false, error: "Circle is required." };
  }

  try {
    const store = getDataStore();
    const existing = await store.getJoinRequest(DEMO_PROFILE_ID, input.circleId);
    if (existing) {
      return {
        ok: false,
        error: "You already have a request for this Circle.",
        code: "DUPLICATE_REQUEST",
      };
    }

    const request = await store.createJoinRequest({
      profileId: DEMO_PROFILE_ID,
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
    const store = getDataStore();
    const request = await store.getJoinRequest(DEMO_PROFILE_ID, circleId);
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
    const store = getDataStore();
    const circle = await store.getCircleBySlug(slug);
    if (!circle) {
      return { ok: false as const, error: "Circle not found." };
    }

    const request = await store.getJoinRequest(DEMO_PROFILE_ID, circle.id);
    return {
      ok: true as const,
      data: { circle, request, mode: store.mode },
    };
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof Error ? error.message : "Unable to load this Circle.",
    };
  }
}
