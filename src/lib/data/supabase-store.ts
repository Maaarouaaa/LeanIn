import { DEMO_PROFILE_ID } from "@/lib/constants";
import type { DataStore } from "@/lib/data/types";
import { getSupabaseAdmin, logSupabaseError } from "@/lib/supabase/server";
import {
  SUPABASE_QUERY_TIMEOUT_MS,
  TimeoutError,
  withTimeout,
} from "@/lib/with-timeout";
import type {
  CareerStage,
  Circle,
  CircleLeader,
  CircleMemberPreview,
  Goal,
  JoinRequest,
  MeetingFormat,
  MeetingFrequency,
  MemberPreferences,
  Profile,
} from "@/lib/types";

function throwQueryError(context: string, error: unknown): never {
  logSupabaseError(context, error);
  throw error;
}

function throwTimeout(context: string, error: TimeoutError): never {
  logSupabaseError(`${context} timed out`, error);
  throw error;
}

async function runSupabaseQuery<T>(
  stage: string,
  run: () => PromiseLike<{ data: T; error: unknown }>,
): Promise<T> {
  const started = Date.now();
  console.info(`[circle-match] stage:${stage} start`);
  try {
    const { data, error } = await withTimeout(
      Promise.resolve(run()),
      SUPABASE_QUERY_TIMEOUT_MS,
      "Supabase query timed out after 10 seconds.",
    );
    if (error) throwQueryError(`${stage} failed`, error);
    console.info(`[circle-match] stage:${stage} end`, {
      ok: true,
      ms: Date.now() - started,
    });
    return data;
  } catch (error) {
    console.info(`[circle-match] stage:${stage} end`, {
      ok: false,
      ms: Date.now() - started,
      reason: error instanceof TimeoutError ? "timeout" : "exception",
    });
    if (error instanceof TimeoutError) throwTimeout(stage, error);
    throw error;
  }
}

interface ProfileRow {
  id: string;
  display_name: string;
  email: string;
  preferences: MemberPreferences | null;
  created_at: string;
  updated_at: string;
}

interface CircleRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  who_its_for: string;
  topics: Goal[];
  career_stages: CareerStage[];
  format: Exclude<MeetingFormat, "either">;
  frequency: MeetingFrequency;
  location: string;
  schedule: string;
  next_meeting: string;
  member_count: number;
  image_src: string;
  image_alt: string;
  meets_weeknights: boolean;
  leader: CircleLeader;
  members: CircleMemberPreview[];
  created_at: string;
}

interface JoinRequestRow {
  id: string;
  profile_id: string;
  circle_id: string;
  note: string | null;
  status: JoinRequest["status"];
  created_at: string;
  updated_at: string;
}

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    preferences: row.preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapCircle(row: CircleRow): Circle {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    description: row.description,
    whoItsFor: row.who_its_for,
    topics: row.topics,
    careerStages: row.career_stages,
    format: row.format,
    frequency: row.frequency,
    location: row.location,
    schedule: row.schedule,
    nextMeeting: row.next_meeting,
    memberCount: row.member_count,
    imageSrc: row.image_src,
    imageAlt: row.image_alt,
    meetsWeeknights: row.meets_weeknights,
    leader: row.leader,
    members: row.members,
    createdAt: row.created_at,
  };
}

function mapJoinRequest(row: JoinRequestRow): JoinRequest {
  return {
    id: row.id,
    profileId: row.profile_id,
    circleId: row.circle_id,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const supabaseStore: DataStore = {
  mode: "supabase",

  async getDemoProfile() {
    const data = await runSupabaseQuery("supabase.profiles.getDemoProfile", () =>
      getSupabaseAdmin()
        .from("profiles")
        .select("*")
        .eq("id", DEMO_PROFILE_ID)
        .single(),
    );
    return mapProfile(data as ProfileRow);
  },

  async savePreferences(profileId, preferences) {
    try {
      const data = await runSupabaseQuery(
        "supabase.profiles.savePreferences",
        () =>
          getSupabaseAdmin()
            .from("profiles")
            .update({
              preferences,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profileId)
            .select("*")
            .single(),
      );
      return mapProfile(data as ProfileRow);
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new TimeoutError(
          "Saving preferences timed out. Please try again.",
        );
      }
      if (error instanceof Error) {
        throw new Error(
          error.message || "Unable to save preferences. Please try again.",
        );
      }
      throw new Error("Unable to save preferences. Please try again.");
    }
  },

  async listCircles() {
    const data = await runSupabaseQuery("supabase.circles.listCircles", () =>
      getSupabaseAdmin()
        .from("circles")
        .select("*")
        .order("name", { ascending: true }),
    );
    return (data as CircleRow[]).map(mapCircle);
  },

  async getCircleBySlug(slug) {
    const data = await runSupabaseQuery("supabase.circles.getCircleBySlug", () =>
      getSupabaseAdmin()
        .from("circles")
        .select("*")
        .eq("slug", slug)
        .maybeSingle(),
    );
    return data ? mapCircle(data as CircleRow) : null;
  },

  async getCircleById(id) {
    const data = await runSupabaseQuery("supabase.circles.getCircleById", () =>
      getSupabaseAdmin()
        .from("circles")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
    );
    return data ? mapCircle(data as CircleRow) : null;
  },

  async createJoinRequest({ profileId, circleId, note }) {
    try {
      const timestamp = new Date().toISOString();
      const data = await runSupabaseQuery(
        "supabase.join_requests.createJoinRequest",
        () =>
          getSupabaseAdmin()
            .from("join_requests")
            .insert({
              profile_id: profileId,
              circle_id: circleId,
              note: note?.trim() ? note.trim() : null,
              status: "pending",
              updated_at: timestamp,
            })
            .select("*")
            .single(),
      );
      return mapJoinRequest(data as JoinRequestRow);
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        const duplicate = new Error(
          "A join request for this Circle already exists.",
        );
        (duplicate as Error & { code: string }).code = "DUPLICATE_REQUEST";
        throw duplicate;
      }
      throw error;
    }
  },

  async getJoinRequest(profileId, circleId) {
    const data = await runSupabaseQuery(
      "supabase.join_requests.getJoinRequest",
      () =>
        getSupabaseAdmin()
          .from("join_requests")
          .select("*")
          .eq("profile_id", profileId)
          .eq("circle_id", circleId)
          .maybeSingle(),
    );
    return data ? mapJoinRequest(data as JoinRequestRow) : null;
  },

  async listJoinRequestsForProfile(profileId) {
    const data = await runSupabaseQuery(
      "supabase.join_requests.listJoinRequestsForProfile",
      () =>
        getSupabaseAdmin()
          .from("join_requests")
          .select("*")
          .eq("profile_id", profileId)
          .order("created_at", { ascending: false }),
    );
    return (data as JoinRequestRow[]).map(mapJoinRequest);
  },
};
