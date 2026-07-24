import { describe, expect, it } from "vitest";
import {
  rankCircleMatches,
  scoreCircleMatch,
  topRankedMatches,
  validateMatchForm,
} from "@/lib/matching";
import { SEED_CIRCLES } from "@/lib/data/seed";
import type { Circle, MatchFormInput } from "@/lib/types";

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

  it("still scores format-mismatched Circles instead of excluding them", () => {
    const virtual = SEED_CIRCLES.find(
      (circle) => circle.slug === "women-building-in-tech",
    )!;
    const match = scoreCircleMatch(
      { ...bayAreaPrefs, format: "in-person" },
      virtual,
    );
    expect(match.score).toBeGreaterThan(0);
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

  it("scores every Circle even when only one or two strongly match format", () => {
    // Catalog where only two Circles strongly match a virtual preference.
    const catalog: Circle[] = SEED_CIRCLES.map((circle, index) => {
      if (index === 0) return { ...circle, format: "virtual" };
      if (index === 1) return { ...circle, format: "hybrid" };
      return { ...circle, format: "in-person" };
    });

    const prefs: MatchFormInput = {
      ...bayAreaPrefs,
      format: "virtual",
    };

    const strongFormatMatches = catalog.filter(
      (circle) => circle.format === "virtual" || circle.format === "hybrid",
    );
    expect(strongFormatMatches.length).toBe(2);

    const ranked = rankCircleMatches(prefs, catalog);
    expect(ranked).toHaveLength(catalog.length);

    const top = ranked.slice(0, 3);
    expect(top).toHaveLength(3);
    expect(top.every((match) => Number.isFinite(match.score))).toBe(true);

    // Strong format fits should appear, but mismatches remain in the ranked set.
    expect(
      top.filter(
        (match) =>
          match.circle.format === "virtual" || match.circle.format === "hybrid",
      ).length,
    ).toBeGreaterThanOrEqual(1);
    expect(ranked.some((match) => match.circle.format === "in-person")).toBe(
      true,
    );
  });

  it("topRankedMatches returns a finite slice without filling to three", () => {
    const twoCircles = SEED_CIRCLES.slice(0, 2);
    const top = topRankedMatches(bayAreaPrefs, twoCircles, 3);
    expect(top).toHaveLength(2);
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
