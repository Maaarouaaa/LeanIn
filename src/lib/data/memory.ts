import { DEMO_PROFILE, SEED_CIRCLES } from "@/lib/data/seed";
import type { DataStore } from "@/lib/data/types";
import type {
  Circle,
  JoinRequest,
  MemberPreferences,
  Profile,
} from "@/lib/types";

interface MemoryState {
  profile: Profile;
  circles: Circle[];
  joinRequests: JoinRequest[];
}

declare global {
  var __circleMatchMemory: MemoryState | undefined;
}

function getState(): MemoryState {
  if (!globalThis.__circleMatchMemory) {
    globalThis.__circleMatchMemory = {
      profile: structuredClone(DEMO_PROFILE),
      circles: structuredClone(SEED_CIRCLES),
      joinRequests: [],
    };
  }
  return globalThis.__circleMatchMemory;
}

function nowIso() {
  return new Date().toISOString();
}

export const memoryStore: DataStore = {
  mode: "memory",

  async getDemoProfile() {
    return structuredClone(getState().profile);
  },

  async savePreferences(profileId, preferences: MemberPreferences) {
    const state = getState();
    if (state.profile.id !== profileId) {
      throw new Error("Profile not found");
    }
    state.profile = {
      ...state.profile,
      preferences: structuredClone(preferences),
      updatedAt: nowIso(),
    };
    return structuredClone(state.profile);
  },

  async listCircles() {
    return structuredClone(getState().circles);
  },

  async getCircleBySlug(slug) {
    const circle = getState().circles.find((item) => item.slug === slug);
    return circle ? structuredClone(circle) : null;
  },

  async getCircleById(id) {
    const circle = getState().circles.find((item) => item.id === id);
    return circle ? structuredClone(circle) : null;
  },

  async createJoinRequest({ profileId, circleId, note }) {
    const state = getState();
    const existing = state.joinRequests.find(
      (request) =>
        request.profileId === profileId && request.circleId === circleId,
    );
    if (existing) {
      const error = new Error("A join request for this Circle already exists.");
      (error as Error & { code: string }).code = "DUPLICATE_REQUEST";
      throw error;
    }

    const circle = state.circles.find((item) => item.id === circleId);
    if (!circle) {
      throw new Error("Circle not found");
    }

    const request: JoinRequest = {
      id: crypto.randomUUID(),
      profileId,
      circleId,
      note: note?.trim() ? note.trim() : null,
      status: "pending",
      createdAt: nowIso(),
    };
    state.joinRequests.push(request);
    return structuredClone(request);
  },

  async getJoinRequest(profileId, circleId) {
    const request = getState().joinRequests.find(
      (item) => item.profileId === profileId && item.circleId === circleId,
    );
    return request ? structuredClone(request) : null;
  },

  async listJoinRequestsForProfile(profileId) {
    return structuredClone(
      getState().joinRequests.filter((item) => item.profileId === profileId),
    );
  },
};
