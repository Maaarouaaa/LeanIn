import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PROFILE_ID } from "@/lib/constants";
import { SEED_CIRCLES } from "@/lib/data/seed";
import type { Circle } from "@/lib/types";

vi.mock("@/lib/auth", () => ({
  requireAuthenticatedMember: async () => DEMO_PROFILE_ID,
  getAuthenticatedMemberId: async () => DEMO_PROFILE_ID,
}));

const listCircles = vi.fn();
const getDemoProfile = vi.fn();
const getDataStore = vi.fn();

vi.mock("@/lib/data/store", () => ({
  getDataStore: () => getDataStore(),
}));

describe("getRankedMatches", () => {
  beforeEach(() => {
    vi.resetModules();
    listCircles.mockReset();
    getDemoProfile.mockReset();
    getDataStore.mockReset();
    getDataStore.mockResolvedValue({
      mode: "supabase",
      listCircles,
      getDemoProfile,
    });
  });

  it("terminates and returns up to three when only two Circles strongly match format", async () => {
    const catalog: Circle[] = SEED_CIRCLES.map((circle, index) => {
      if (index === 0) return { ...circle, format: "virtual" };
      if (index === 1) return { ...circle, format: "hybrid" };
      return { ...circle, format: "in-person" };
    });

    getDemoProfile.mockResolvedValue({
      id: DEMO_PROFILE_ID,
      displayName: "Amina",
      email: "amina@example.com",
      preferences: {
        goals: ["growing-as-a-leader", "building-confidence"],
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
    listCircles.mockResolvedValue(catalog);

    const { getRankedMatches } = await import("@/lib/actions/circle-match");
    const result = await getRankedMatches();

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.data.matches.length).toBe(3);
    expect(result.data.allMatches.length).toBe(catalog.length);
    expect(
      result.data.allMatches.every((match) => Number.isFinite(match.score)),
    ).toBe(true);
    expect(
      catalog.filter(
        (circle) => circle.format === "virtual" || circle.format === "hybrid",
      ),
    ).toHaveLength(2);
  });

  it("returns fewer than three when the catalog itself is smaller", async () => {
    getDemoProfile.mockResolvedValue({
      id: DEMO_PROFILE_ID,
      displayName: "Amina",
      email: "amina@example.com",
      preferences: {
        goals: ["growing-as-a-leader"],
        careerStage: "mid-career",
        format: "in-person",
        frequency: "monthly",
        location: "Oakland, CA",
        availability: "weeknights",
        includeVirtualOutsideLocation: true,
      },
      createdAt: "2026-01-01",
      updatedAt: "2026-01-02",
    });
    listCircles.mockResolvedValue(SEED_CIRCLES.slice(0, 2));

    const { getRankedMatches } = await import("@/lib/actions/circle-match");
    const result = await getRankedMatches();

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.matches).toHaveLength(2);
  });
});
