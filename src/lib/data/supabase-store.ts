import { DEMO_PROFILE_ID } from "@/lib/constants";
import type { DataStore } from "@/lib/data/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";
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
  SupportType,
} from "@/lib/types";

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
  support_types: SupportType[];
  career_stages: CareerStage[];
  format: Exclude<MeetingFormat, "either">;
  frequency: MeetingFrequency;
  location: string;
  schedule: string;
  member_count: number;
  image_tone: Circle["imageTone"];
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
    supportTypes: row.support_types,
    careerStages: row.career_stages,
    format: row.format,
    frequency: row.frequency,
    location: row.location,
    schedule: row.schedule,
    memberCount: row.member_count,
    imageTone: row.image_tone,
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
  };
}

export const supabaseStore: DataStore = {
  mode: "supabase",

  async getDemoProfile() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", DEMO_PROFILE_ID)
      .single();

    if (error) throw error;
    return mapProfile(data as ProfileRow);
  },

  async savePreferences(profileId, preferences) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        preferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profileId)
      .select("*")
      .single();

    if (error) throw error;
    return mapProfile(data as ProfileRow);
  },

  async listCircles() {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("circles")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return (data as CircleRow[]).map(mapCircle);
  },

  async getCircleBySlug(slug) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("circles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCircle(data as CircleRow) : null;
  },

  async getCircleById(id) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("circles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapCircle(data as CircleRow) : null;
  },

  async createJoinRequest({ profileId, circleId, note }) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("join_requests")
      .insert({
        profile_id: profileId,
        circle_id: circleId,
        note: note?.trim() ? note.trim() : null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        const duplicate = new Error(
          "A join request for this Circle already exists.",
        );
        (duplicate as Error & { code: string }).code = "DUPLICATE_REQUEST";
        throw duplicate;
      }
      throw error;
    }

    return mapJoinRequest(data as JoinRequestRow);
  },

  async getJoinRequest(profileId, circleId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("profile_id", profileId)
      .eq("circle_id", circleId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapJoinRequest(data as JoinRequestRow) : null;
  },

  async listJoinRequestsForProfile(profileId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("join_requests")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as JoinRequestRow[]).map(mapJoinRequest);
  },
};
