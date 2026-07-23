import { beforeEach, describe, expect, it } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { memoryStore } from "@/lib/data/memory";
import { SEED_CIRCLES } from "@/lib/data/seed";
import {
  createJoinRequestAction,
  getJoinRequestStatus,
  saveMemberPreferences,
} from "@/lib/actions/circle-match";

describe("join request behavior", () => {
  beforeEach(() => {
    // Reset in-memory store between tests
    globalThis.__circleMatchMemory = undefined;
  });

  it("creates a pending join request", async () => {
    const circle = SEED_CIRCLES[0];
    const result = await createJoinRequestAction({
      circleId: circle.id,
      note: "I would love to join.",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.request.status).toBe("pending");
    expect(result.data.request.circleId).toBe(circle.id);
    expect(result.data.request.note).toBe("I would love to join.");

    const status = await getJoinRequestStatus(circle.id);
    expect(status.ok).toBe(true);
    if (!status.ok) return;
    expect(status.data.request?.status).toBe("pending");
  });

  it("prevents duplicate join requests", async () => {
    const circle = SEED_CIRCLES[1];
    const first = await createJoinRequestAction({ circleId: circle.id });
    expect(first.ok).toBe(true);

    const second = await createJoinRequestAction({ circleId: circle.id });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.code).toBe("DUPLICATE_REQUEST");

    const stored = await memoryStore.listJoinRequestsForProfile(DEMO_PROFILE_ID);
    expect(stored).toHaveLength(1);
  });

  it("preserves pending state after re-fetch", async () => {
    const circle = SEED_CIRCLES[2];
    await createJoinRequestAction({ circleId: circle.id });

    const again = await memoryStore.getJoinRequest(DEMO_PROFILE_ID, circle.id);
    expect(again?.status).toBe("pending");
  });
});

describe("preference persistence", () => {
  beforeEach(() => {
    globalThis.__circleMatchMemory = undefined;
  });

  it("saves member preferences for the demo profile", async () => {
    const result = await saveMemberPreferences({
      supportTypes: ["peer-support"],
      careerStage: "mid-career",
      goals: ["growing-as-a-leader", "building-confidence"],
      format: "virtual",
      frequency: "monthly",
      location: "New York, NY",
      availability: "Weeknights",
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const profile = await memoryStore.getDemoProfile();
    expect(profile.preferences?.location).toBe("New York, NY");
    expect(profile.preferences?.goals).toContain("growing-as-a-leader");
  });

  it("rejects incomplete preferences", async () => {
    const result = await saveMemberPreferences({
      supportTypes: [],
      careerStage: "mid-career",
      goals: ["building-confidence"],
      format: "virtual",
      frequency: "weekly",
      location: "Austin, TX",
    });

    expect(result.ok).toBe(false);
  });
});
