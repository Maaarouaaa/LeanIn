import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { memoryStore, resetMemoryStore } from "@/lib/data/memory";
import { SEED_CIRCLES } from "@/lib/data/seed";
import { saveMemberPreferences } from "@/lib/actions/circle-match";

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedMember: async () => DEMO_PROFILE_ID,
  getAuthenticatedMemberId: async () => DEMO_PROFILE_ID,
}));

describe("join request persistence", () => {
  beforeEach(() => {
    resetMemoryStore();
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
    const circle = SEED_CIRCLES[1];
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
});

describe("preference persistence", () => {
  beforeEach(() => {
    resetMemoryStore();
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
