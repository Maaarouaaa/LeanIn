import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { TimeoutError } from "@/lib/with-timeout";

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedMember: async () => DEMO_PROFILE_ID,
  getAuthenticatedMemberId: async () => DEMO_PROFILE_ID,
}));

const savePreferences = vi.fn();
const getDataStore = vi.fn();

vi.mock("@/lib/data/store", () => ({
  getDataStore: () => getDataStore(),
}));

describe("saveMemberPreferences", () => {
  beforeEach(() => {
    vi.resetModules();
    savePreferences.mockReset();
    getDataStore.mockReset();
    getDataStore.mockResolvedValue({
      mode: "supabase",
      savePreferences,
    });
  });

  it("returns ok after a successful save", async () => {
    savePreferences.mockResolvedValue({
      id: DEMO_PROFILE_ID,
      displayName: "Amina",
      email: "amina@example.com",
      preferences: {
        goals: ["growing-as-a-leader"],
        careerStage: "mid-career",
        format: "virtual",
        frequency: "monthly",
        location: "Oakland, CA",
        availability: "weeknights",
        includeVirtualOutsideLocation: true,
      },
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });

    const { saveMemberPreferences } = await import(
      "@/lib/actions/circle-match"
    );

    const result = await saveMemberPreferences({
      goals: ["growing-as-a-leader"],
      careerStage: "mid-career",
      format: "virtual",
      frequency: "monthly",
      location: "Oakland, CA",
      availability: "weeknights",
      includeVirtualOutsideLocation: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mode).toBe("supabase");
      expect(result.data.profile.id).toBe(DEMO_PROFILE_ID);
    }
  });

  it("returns a user-facing error when the Supabase save times out", async () => {
    savePreferences.mockRejectedValue(
      new TimeoutError("Saving preferences timed out. Please try again."),
    );

    const { saveMemberPreferences } = await import(
      "@/lib/actions/circle-match"
    );

    const result = await saveMemberPreferences({
      goals: ["growing-as-a-leader"],
      careerStage: "mid-career",
      format: "virtual",
      frequency: "monthly",
      location: "Oakland, CA",
      availability: "weeknights",
      includeVirtualOutsideLocation: true,
    });

    expect(result).toEqual({
      ok: false,
      error: "Saving preferences timed out. Please try again.",
    });
  });

  it("returns validation errors without calling the store", async () => {
    const { saveMemberPreferences } = await import(
      "@/lib/actions/circle-match"
    );

    const result = await saveMemberPreferences({
      goals: [],
      careerStage: "mid-career",
      format: "virtual",
      frequency: "monthly",
      location: "Oakland, CA",
      availability: "",
      includeVirtualOutsideLocation: true,
    });

    expect(result.ok).toBe(false);
    expect(savePreferences).not.toHaveBeenCalled();
  });
});
