import {
  MATCH_WEIGHTS,
  GOAL_LABELS,
  CAREER_STAGE_LABELS,
} from "@/lib/constants";
import type {
  AvailabilityWindow,
  Circle,
  CircleMatch,
  MatchFormInput,
  MatchReason,
  MeetingFormat,
  MeetingFrequency,
} from "@/lib/types";

function normalizeLocation(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function isVirtualLocation(location: string): boolean {
  const value = normalizeLocation(location);
  return value.includes("virtual") || value.includes("global");
}

function locationCompatible(
  preferences: MatchFormInput,
  circle: Circle,
): number {
  const member = normalizeLocation(preferences.location);
  const circleLocation = normalizeLocation(circle.location);
  const circleIsVirtual =
    isVirtualLocation(circle.location) || circle.format === "virtual";

  if (!member) return 0.5;

  if (circleIsVirtual) {
    if (preferences.includeVirtualOutsideLocation) return 1;
    // Virtual still useful, but slightly lower if member wanted local-only virtual filter off
    return preferences.format === "virtual" || preferences.format === "either"
      ? 0.85
      : 0.55;
  }

  if (member === circleLocation) return 1;

  const memberCity = member.split(",")[0]?.trim() ?? member;
  const circleCity = circleLocation.split(",")[0]?.trim() ?? circleLocation;

  if (
    memberCity &&
    circleCity &&
    (member.includes(circleCity) || circleLocation.includes(memberCity))
  ) {
    return 1;
  }

  if (member.split(",").length > 1 && circleLocation.split(",").length > 1) {
    const memberRegion = member.split(",").slice(-1)[0]?.trim();
    const circleRegion = circleLocation.split(",").slice(-1)[0]?.trim();
    if (memberRegion && circleRegion && memberRegion === circleRegion) {
      return 0.65;
    }
  }

  return 0;
}

function formatCompatible(
  preference: MeetingFormat,
  circleFormat: Circle["format"],
): number {
  if (preference === "either") return 1;
  if (preference === circleFormat) return 1;
  if (circleFormat === "hybrid") return 0.85;
  // Soft penalty only — never gate Circles out of the ranked set.
  return 0.25;
}

function frequencyCompatible(
  preference: MeetingFrequency,
  circleFrequency: MeetingFrequency,
): number {
  if (preference === "flexible" || circleFrequency === "flexible") return 1;
  if (preference === circleFrequency) return 1;

  const order: MeetingFrequency[] = ["weekly", "biweekly", "monthly", "flexible"];
  const distance = Math.abs(
    order.indexOf(preference) - order.indexOf(circleFrequency),
  );
  if (distance === 1) return 0.6;
  return 0.2;
}

function goalOverlapScore(
  memberGoals: MatchFormInput["goals"],
  circleTopics: Circle["topics"],
) {
  if (memberGoals.length === 0) {
    return { score: 0, overlap: [] as MatchFormInput["goals"] };
  }
  const overlap = memberGoals.filter((goal) => circleTopics.includes(goal));
  return {
    score: overlap.length / memberGoals.length,
    overlap,
  };
}

function careerStageScore(
  memberStage: MatchFormInput["careerStage"],
  circleStages: Circle["careerStages"],
): number {
  if (circleStages.includes(memberStage)) return 1;
  const adjacency: Record<string, string[]> = {
    "early-career": ["mid-career", "career-transition"],
    "mid-career": ["early-career", "senior-leader", "career-transition"],
    "senior-leader": ["mid-career"],
    "career-transition": ["early-career", "mid-career", "returning-to-work"],
    "returning-to-work": ["career-transition", "mid-career"],
    founder: ["mid-career", "senior-leader"],
  };
  if (
    adjacency[memberStage]?.some((stage) =>
      circleStages.includes(stage as never),
    )
  ) {
    return 0.45;
  }
  return 0;
}

function availabilityCompatible(
  availability: AvailabilityWindow | "" | undefined,
  circle: Circle,
): number {
  if (!availability || availability === "flexible") return 1;
  if (availability === "weeknights" || availability === "weekday-evenings") {
    return circle.meetsWeeknights ? 1 : 0.25;
  }
  if (availability === "weekends") {
    return /saturday|sunday|weekend/i.test(circle.schedule) ? 1 : 0.3;
  }
  if (availability === "weekday-mornings") {
    return /\b(8:00|9:00|10:00)\s*AM\b/i.test(circle.schedule) ? 1 : 0.35;
  }
  if (availability === "weekday-afternoons") {
    return /\b(12:00|1:00|2:00|3:00|4:00)\s*PM\b/i.test(circle.schedule)
      ? 1
      : 0.35;
  }
  return 0.5;
}

/**
 * Deterministic Circle matching score.
 * Weights: goals 40%, format 15%, location 15%, frequency 10%,
 * career stage 10%, availability 10%.
 */
export function scoreCircleMatch(
  preferences: MatchFormInput,
  circle: Circle,
): CircleMatch {
  const reasons: MatchReason[] = [];

  const { score: goalScore, overlap } = goalOverlapScore(
    preferences.goals,
    circle.topics,
  );
  const goalWeighted = goalScore * MATCH_WEIGHTS.goals;
  const locationScore = locationCompatible(preferences, circle);
  reasons.push({
    label: "Shared goals",
    detail:
      overlap.length > 0
        ? `${overlap
            .map((goal) => GOAL_LABELS[goal] ?? goal)
            .join(" + ")}${
            locationScore >= 1 && !isVirtualLocation(circle.location)
              ? " + your location"
              : ""
          }.`
        : "Fewer direct goal overlaps, with adjacent career themes.",
    weight: MATCH_WEIGHTS.goals,
  });

  const formatScore = formatCompatible(preferences.format, circle.format);
  const formatWeighted = formatScore * MATCH_WEIGHTS.format;
  reasons.push({
    label: "Meeting format",
    detail:
      preferences.format === "either"
        ? `This Circle meets ${circle.format}, and you are open to either format.`
        : formatScore >= 0.85
          ? `Matches your preference for ${
              preferences.format === "in-person" ? "in-person" : preferences.format
            } meetings.`
          : `This Circle is ${circle.format}; you preferred ${preferences.format}.`,
    weight: MATCH_WEIGHTS.format,
  });

  const locationWeighted = locationScore * MATCH_WEIGHTS.location;
  reasons.push({
    label: "Location",
    detail:
      locationScore >= 1
        ? `Location fits: ${circle.location}.`
        : locationScore >= 0.5
          ? `Partial location fit with ${circle.location}.`
          : `Based elsewhere (${circle.location}).`,
    weight: MATCH_WEIGHTS.location,
  });

  const frequencyScore = frequencyCompatible(
    preferences.frequency,
    circle.frequency,
  );
  const frequencyWeighted = frequencyScore * MATCH_WEIGHTS.frequency;
  reasons.push({
    label: "Meeting rhythm",
    detail:
      frequencyScore === 1
        ? `Meets on a ${circle.frequency} cadence that matches your preference.`
        : `Meets ${circle.frequency}; close to your ${preferences.frequency} preference.`,
    weight: MATCH_WEIGHTS.frequency,
  });

  const careerScore = careerStageScore(
    preferences.careerStage,
    circle.careerStages,
  );
  const careerWeighted = careerScore * MATCH_WEIGHTS.careerStage;
  const careerLabel =
    CAREER_STAGE_LABELS[preferences.careerStage] ?? preferences.careerStage;
  reasons.push({
    label: "Career stage",
    detail:
      careerScore === 1
        ? `Designed for ${careerLabel.toLowerCase()} members.`
        : careerScore > 0
          ? `Welcomes adjacent stages, including ${careerLabel.toLowerCase()}.`
          : `Primarily serves other career stages.`,
    weight: MATCH_WEIGHTS.careerStage,
  });

  const availabilityScore = availabilityCompatible(
    preferences.availability,
    circle,
  );
  const availabilityWeighted = availabilityScore * MATCH_WEIGHTS.availability;
  reasons.push({
    label: "Availability",
    detail:
      availabilityScore >= 1
        ? `Schedule fits your availability (${circle.schedule}).`
        : `Schedule may be a stretch for your availability.`,
    weight: MATCH_WEIGHTS.availability,
  });

  const raw =
    goalWeighted +
    formatWeighted +
    locationWeighted +
    frequencyWeighted +
    careerWeighted +
    availabilityWeighted;

  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

  const sortedReasons = [...reasons]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return { circle, score, reasons: sortedReasons };
}

/**
 * Score every Circle once, sort descending, and return the full ranked list.
 * Callers take `ranked.slice(0, 3)` — never loop/retry until length === 3.
 * Preferences affect scores only; incompatible Circles stay in the set.
 */
export function rankCircleMatches(
  preferences: MatchFormInput,
  circles: Circle[],
): CircleMatch[] {
  // Materialize a finite array — never iterate an open-ended source.
  const list = Array.isArray(circles) ? circles.slice() : [];
  console.info("[circle-match] stage:rank.circlesRetrieved", {
    count: list.length,
  });

  console.info("[circle-match] stage:rank.scoreCalculation start", {
    count: list.length,
  });
  const scored: CircleMatch[] = [];
  for (let index = 0; index < list.length; index += 1) {
    const circle = list[index];
    try {
      scored.push(scoreCircleMatch(preferences, circle));
    } catch (error) {
      console.error("[circle-match] stage:rank.scoreCalculation circle failed", {
        index,
        slug: circle?.slug ?? null,
        message: error instanceof Error ? error.message : "unknown",
      });
      scored.push({ circle, score: 0, reasons: [] });
    }
  }
  console.info("[circle-match] stage:rank.scoreCalculation end", {
    scoredCount: scored.length,
  });

  console.info("[circle-match] stage:rank.sort start", {
    scoredCount: scored.length,
  });
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.circle.name.localeCompare(b.circle.name);
  });
  console.info("[circle-match] stage:rank.sort end", {
    scoredCount: scored.length,
  });

  console.info("[circle-match] stage:rank.results", {
    returned: scored.length,
  });
  return scored;
}

/** Top recommendations — always a finite slice, never a fill loop. */
export function topRankedMatches(
  preferences: MatchFormInput,
  circles: Circle[],
  limit = 3,
): CircleMatch[] {
  return rankCircleMatches(preferences, circles).slice(0, limit);
}

export function explainTopMatch(match: CircleMatch): string {
  const primary = match.reasons.find((reason) => reason.weight > 0);
  if (!primary) {
    return "This Circle aligns with several of your preferences.";
  }
  // Prefer concise "Why this matches" copy
  if (primary.label === "Shared goals") {
    return primary.detail.replace(/\.$/, "");
  }
  return primary.detail;
}

export function validateMatchForm(input: Partial<MatchFormInput>): string[] {
  const errors: string[] = [];
  if (!input.goals?.length) errors.push("Select at least one support goal.");
  if (input.goals && input.goals.length > 3) {
    errors.push("Choose up to three goals.");
  }
  if (!input.careerStage) errors.push("Select your career stage.");
  if (!input.format) errors.push("Select a preferred meeting format.");
  if (!input.frequency) errors.push("Select a preferred meeting frequency.");
  if (!input.location?.trim()) errors.push("Enter your location.");
  return errors;
}
