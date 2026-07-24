import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { memoryStore, resetMemoryStore } from "@/lib/data/memory";
import { resetDataModeCache } from "@/lib/data/store";
import { SEED_CIRCLES } from "@/lib/data/seed";
import { saveMemberPreferences } from "@/lib/actions/circle-match";

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedMember: async () => DEMO_PROFILE_ID,
  getAuthenticatedMemberId: async () => DEMO_PROFILE_ID,
}));

function forceMemoryAdapter() {
  resetMemoryStore();
  resetDataModeCache();
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SECRET_KEY;
}

describe("join request persistence", () => {
  beforeEach(() => {
    forceMemoryAdapter();
  });

  it("creates a pending join request", async () => {
    const circle = SEED_CIRCLES[0];
    const request = await memoryStore.createJoinRequest({
      profileId: DEMO_PROFILE_ID,
      circleId: circle.id,
      note: "I would love to join.",
    });

    expect(request.status).toBe("pending");
    expect(request.note).toBe("I would love to join.");
    expect(request.updatedAt).toBeTruthy();

    const stored = await memoryStore.getJoinRequest(
      DEMO_PROFILE_ID,
      circle.id,
    );
    expect(stored?.id).toBe(request.id);
  });

  it("prevents duplicate active join requests", async () => {
    const circle = SEED_CIRCLES[1]!;
    await memoryStore.createJoinRequest({
      profileId: DEMO_PROFILE_ID,
      circleId: circle.id,
    });

    await expect(
      memoryStore.createJoinRequest({
        profileId: DEMO_PROFILE_ID,
        circleId: circle.id,
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_REQUEST" });

    const stored = await memoryStore.listJoinRequestsForProfile(
      DEMO_PROFILE_ID,
    );
    expect(stored).toHaveLength(1);
  });

  it("looks up join requests by both profile and Circle", async () => {
    const a = SEED_CIRCLES[0]!;
    const b = SEED_CIRCLES[1]!;
    await memoryStore.createJoinRequest({
      profileId: DEMO_PROFILE_ID,
      circleId: a.id,
      note: "For Circle A",
    });

    const forA = await memoryStore.getJoinRequest(DEMO_PROFILE_ID, a.id);
    const forB = await memoryStore.getJoinRequest(DEMO_PROFILE_ID, b.id);

    expect(forA?.circleId).toBe(a.id);
    expect(forA?.note).toBe("For Circle A");
    expect(forB).toBeNull();
  });

  it("blocks a second request even when the first is not pending", async () => {
    const circle = SEED_CIRCLES[2]!;
    const first = await memoryStore.createJoinRequest({
      profileId: DEMO_PROFILE_ID,
      circleId: circle.id,
    });

    const memory = globalThis.__circleMatchMemory;
    expect(memory).toBeTruthy();
    const row = memory!.joinRequests.find((item) => item.id === first.id);
    expect(row).toBeTruthy();
    row!.status = "declined";

    await expect(
      memoryStore.createJoinRequest({
        profileId: DEMO_PROFILE_ID,
        circleId: circle.id,
      }),
    ).rejects.toMatchObject({ code: "DUPLICATE_REQUEST" });
  });
});

describe("preference persistence", () => {
  beforeEach(() => {
    forceMemoryAdapter();
  });

  it("saves member preferences for the demo profile", async () => {
    const result = await saveMemberPreferences({
      goals: ["growing-as-a-leader", "building-confidence"],
      careerStage: "mid-career",
      format: "in-person",
      frequency: "monthly",
      location: "Oakland, CA",
      availability: "weeknights",
      includeVirtualOutsideLocation: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.mode).toBe("memory");
    const profile = await memoryStore.getDemoProfile();
    expect(profile.preferences?.location).toBe("Oakland, CA");
    expect(profile.preferences?.includeVirtualOutsideLocation).toBe(true);
  });

  it("rejects incomplete preferences", async () => {
    const result = await saveMemberPreferences({
      goals: [],
      careerStage: "mid-career",
      format: "virtual",
      frequency: "weekly",
      location: "Austin, TX",
      includeVirtualOutsideLocation: false,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects more than three goals", async () => {
    const result = await saveMemberPreferences({
      goals: [
        "growing-as-a-leader",
        "building-confidence",
        "finding-mentorship",
        "entrepreneurship",
      ],
      careerStage: "mid-career",
      format: "either",
      frequency: "monthly",
      location: "Oakland, CA",
      includeVirtualOutsideLocation: true,
    });
    expect(result.ok).toBe(false);
  });
});
