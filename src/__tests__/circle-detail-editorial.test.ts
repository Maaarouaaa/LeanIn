import { describe, expect, it } from "vitest";
import { enrichCirclePresentation } from "@/lib/enrich-circle";
import { explainTopMatch } from "@/lib/matching";
import { SEED_CIRCLES } from "@/lib/data/seed";
import type { Circle, CircleMatch } from "@/lib/types";

describe("enrichCirclePresentation", () => {
  it("fills missing leader quote and member photos from seed", () => {
    const sparse: Circle = {
      ...SEED_CIRCLES[0]!,
      description: "Short.",
      whoItsFor: "Short.",
      memberCount: 10,
      leader: {
        name: "Maya Robinson",
        title: "VP, People & Culture",
        bio: "Generic bio.",
        initials: "MR",
        since: "2022",
      },
      members: [
        { name: "Maya", role: "People", initials: "MR" },
        { name: "Priya", role: "Product", initials: "PS" },
      ],
    };

    const enriched = enrichCirclePresentation(sparse);
    expect(enriched.leader.facilitationNote).toContain("influence rehearsal");
    expect(enriched.members).toHaveLength(4);
    expect(enriched.members.every((member) => member.imageSrc)).toBe(true);
    expect(enriched.memberCount).toBe(14);
    expect(enriched.description.length).toBeGreaterThan(80);
  });
});

describe("explainTopMatch", () => {
  it("writes one specific sentence for shared goals", () => {
    const match: CircleMatch = {
      circle: SEED_CIRCLES[0]!,
      score: 92,
      reasons: [
        {
          label: "Shared goals",
          detail: "Growing as a leader + Building confidence + your location.",
          weight: 40,
        },
      ],
    };

    expect(explainTopMatch(match)).toBe(
      "You’re aligned on growing as a leader and building confidence, and this Circle meets near you.",
    );
  });
});
