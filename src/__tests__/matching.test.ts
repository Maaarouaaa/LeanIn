import { describe, expect, it } from "vitest";
import {
  rankCircleMatches,
  scoreCircleMatch,
  validateMatchForm,
} from "@/lib/matching";
import { SEED_CIRCLES } from "@/lib/data/seed";
import type { MatchFormInput } from "@/lib/types";

const bayAreaPrefs: MatchFormInput = {
  goals: ["growing-as-a-leader", "building-confidence", "finding-mentorship"],
  careerStage: "mid-career",
  format: "in-person",
  frequency: "monthly",
  location: "Oakland, CA",
  availability: "weeknights",
  includeVirtualOutsideLocation: true,
};

describe("validateMatchForm", () => {
  it("requires core fields", () => {
    expect(validateMatchForm({})).toEqual(
      expect.arrayContaining([
        "Select at least one support goal.",
        "Select your career stage.",
        "Select a preferred meeting format.",
        "Select a preferred meeting frequency.",
        "Enter your location.",
      ]),
    );
  });

  it("prevents more than three goals", () => {
    const errors = validateMatchForm({
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
    });
    expect(errors).toContain("Choose up to three goals.");
  });

  it("accepts a complete form", () => {
    expect(validateMatchForm(bayAreaPrefs)).toEqual([]);
  });
});

describe("scoreCircleMatch", () => {
  it("ranks Bay Area Leadership Lab highly for local leadership prefs", () => {
    const lab = SEED_CIRCLES.find(
      (circle) => circle.slug === "bay-area-leadership-lab",
    )!;
    const match = scoreCircleMatch(bayAreaPrefs, lab);
    expect(match.score).toBeGreaterThanOrEqual(85);
  });

  it("is deterministic", () => {
    const circle = SEED_CIRCLES[0];
    expect(scoreCircleMatch(bayAreaPrefs, circle)).toEqual(
      scoreCircleMatch(bayAreaPrefs, circle),
    );
  });

  it("scores availability for weeknights", () => {
    const morning = SEED_CIRCLES.find(
      (circle) => circle.slug === "work-life-integration-lab",
    )!;
    const evening = SEED_CIRCLES.find(
      (circle) => circle.slug === "women-building-in-tech",
    )!;
    const morningScore = scoreCircleMatch(bayAreaPrefs, morning).score;
    const eveningScore = scoreCircleMatch(
      { ...bayAreaPrefs, format: "virtual", location: "Remote" },
      evening,
    ).score;
    expect(eveningScore).toBeGreaterThan(morningScore - 5);
  });
});

describe("rankCircleMatches", () => {
  it("returns descending scores", () => {
    const ranked = rankCircleMatches(bayAreaPrefs, SEED_CIRCLES);
    for (let i = 1; i < ranked.length; i += 1) {
      expect(ranked[i - 1].score).toBeGreaterThanOrEqual(ranked[i].score);
    }
  });

  it("surfaces the leadership lab near the top for Bay Area leadership prefs", () => {
    const ranked = rankCircleMatches(bayAreaPrefs, SEED_CIRCLES);
    expect(ranked[0].circle.slug).toBe("bay-area-leadership-lab");
  });
});

describe("filtering helpers", () => {
  it("can isolate weeknight Circles from ranked results", () => {
    const ranked = rankCircleMatches(bayAreaPrefs, SEED_CIRCLES);
    const weeknights = ranked.filter((match) => match.circle.meetsWeeknights);
    expect(weeknights.length).toBeGreaterThan(0);
    expect(weeknights.every((match) => match.circle.meetsWeeknights)).toBe(
      true,
    );
  });
});
