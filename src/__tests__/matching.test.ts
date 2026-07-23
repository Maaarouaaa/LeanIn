import { describe, expect, it } from "vitest";
import { rankCircleMatches, scoreCircleMatch } from "@/lib/matching";
import { SEED_CIRCLES } from "@/lib/data/seed";
import type { MatchFormInput } from "@/lib/types";

const basePreferences: MatchFormInput = {
  supportTypes: ["peer-support", "leadership-growth"],
  careerStage: "mid-career",
  goals: ["growing-in-technology", "growing-as-a-leader", "building-confidence"],
  format: "virtual",
  frequency: "biweekly",
  location: "San Francisco, CA",
};

describe("scoreCircleMatch", () => {
  it("gives a high score to a strong topic/format fit", () => {
    const techCircle = SEED_CIRCLES.find(
      (circle) => circle.slug === "tech-leadership-collective",
    );
    expect(techCircle).toBeDefined();

    const match = scoreCircleMatch(basePreferences, techCircle!);
    expect(match.score).toBeGreaterThanOrEqual(80);
    expect(match.reasons.some((reason) => reason.label === "Shared goals")).toBe(
      true,
    );
  });

  it("is deterministic for the same inputs", () => {
    const circle = SEED_CIRCLES[0];
    const first = scoreCircleMatch(basePreferences, circle);
    const second = scoreCircleMatch(basePreferences, circle);
    expect(first.score).toBe(second.score);
    expect(first.reasons).toEqual(second.reasons);
  });

  it("scores location matches higher for same city", () => {
    const chicago = SEED_CIRCLES.find(
      (circle) => circle.slug === "career-transition-circle-chicago",
    )!;
    const local = scoreCircleMatch(
      {
        ...basePreferences,
        goals: ["navigating-career-transition", "building-confidence"],
        format: "in-person",
        careerStage: "career-transition",
        location: "Chicago, IL",
      },
      chicago,
    );
    const remote = scoreCircleMatch(
      {
        ...basePreferences,
        goals: ["navigating-career-transition", "building-confidence"],
        format: "in-person",
        careerStage: "career-transition",
        location: "Miami, FL",
      },
      chicago,
    );

    expect(local.score).toBeGreaterThan(remote.score);
  });

  it("treats either format as compatible with all Circles", () => {
    const inPerson = SEED_CIRCLES.find(
      (circle) => circle.slug === "midcareer-momentum",
    )!;
    const match = scoreCircleMatch(
      { ...basePreferences, format: "either" },
      inPerson,
    );
    expect(
      match.reasons.find((reason) => reason.label === "Meeting format")?.detail,
    ).toMatch(/open to either format/i);
  });
});

describe("rankCircleMatches", () => {
  it("returns Circles sorted by descending score", () => {
    const ranked = rankCircleMatches(basePreferences, SEED_CIRCLES);
    expect(ranked.length).toBe(SEED_CIRCLES.length);

    for (let index = 1; index < ranked.length; index += 1) {
      expect(ranked[index - 1].score).toBeGreaterThanOrEqual(ranked[index].score);
    }
  });

  it("surfaces tech leadership near the top for tech leadership prefs", () => {
    const ranked = rankCircleMatches(basePreferences, SEED_CIRCLES);
    const topSlugs = ranked.slice(0, 3).map((match) => match.circle.slug);
    expect(topSlugs).toContain("tech-leadership-collective");
  });
});
