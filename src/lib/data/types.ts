import type {
  Circle,
  JoinRequest,
  MatchFormInput,
  MemberPreferences,
  Profile,
} from "@/lib/types";

export interface DataStore {
  readonly mode: "supabase" | "memory";
  getDemoProfile(): Promise<Profile>;
  savePreferences(
    profileId: string,
    preferences: MemberPreferences,
  ): Promise<Profile>;
  listCircles(): Promise<Circle[]>;
  getCircleBySlug(slug: string): Promise<Circle | null>;
  getCircleById(id: string): Promise<Circle | null>;
  createJoinRequest(input: {
    profileId: string;
    circleId: string;
    note?: string | null;
  }): Promise<JoinRequest>;
  getJoinRequest(
    profileId: string,
    circleId: string,
  ): Promise<JoinRequest | null>;
  listJoinRequestsForProfile(profileId: string): Promise<JoinRequest[]>;
}

export function preferencesFromInput(input: MatchFormInput): MemberPreferences {
  return {
    goals: input.goals,
    careerStage: input.careerStage,
    format: input.format,
    frequency: input.frequency,
    location: input.location.trim(),
    availability: input.availability ?? "",
    includeVirtualOutsideLocation: input.includeVirtualOutsideLocation,
  };
}

export function inputFromPreferences(
  preferences: MemberPreferences,
): MatchFormInput | null {
  if (
    !preferences.careerStage ||
    !preferences.format ||
    !preferences.frequency ||
    preferences.goals.length === 0
  ) {
    return null;
  }

  return {
    goals: preferences.goals,
    careerStage: preferences.careerStage,
    format: preferences.format,
    frequency: preferences.frequency,
    location: preferences.location,
    availability: preferences.availability,
    includeVirtualOutsideLocation: preferences.includeVirtualOutsideLocation,
  };
}
