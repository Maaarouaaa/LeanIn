import { MATCH_WEIGHTS, GOAL_LABELS, CAREER_STAGE_LABELS } from "@/lib/constants";
import type {
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

function locationCompatible(memberLocation: string, circleLocation: string): number {
  const member = normalizeLocation(memberLocation);
  const circle = normalizeLocation(circleLocation);

  if (!member) return 0.5;
  if (circle.includes("virtual") || circle.includes("global")) return 1;
  if (member === circle) return 1;

  const memberCity = member.split(",")[0]?.trim() ?? member;
  const circleCity = circle.split(",")[0]?.trim() ?? circle;

  if (memberCity && circleCity && (member.includes(circleCity) || circle.includes(memberCity))) {
    return 1;
  }

  // Same metro / state-ish soft match
  if (member.split(",").length > 1 && circle.split(",").length > 1) {
    const memberRegion = member.split(",").slice(-1)[0]?.trim();
    const circleRegion = circle.split(",").slice(-1)[0]?.trim();
    if (memberRegion && circleRegion && memberRegion === circleRegion) {
      return 0.6;
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
  return 0;
}

function frequencyCompatible(
  preference: MeetingFrequency,
  circleFrequency: MeetingFrequency,
): number {
  if (preference === "flexible" || circleFrequency === "flexible") return 1;
  if (preference === circleFrequency) return 1;

  const order: MeetingFrequency[] = ["weekly", "biweekly", "monthly", "flexible"];
  const prefIndex = order.indexOf(preference);
  const circleIndex = order.indexOf(circleFrequency);
  const distance = Math.abs(prefIndex - circleIndex);

  if (distance === 1) return 0.6;
  return 0.2;
}

function goalOverlapScore(memberGoals: MatchFormInput["goals"], circleTopics: Circle["topics"]) {
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
  // Adjacent soft matches
  const adjacency: Record<string, string[]> = {
    "early-career": ["mid-career", "career-transition"],
    "mid-career": ["early-career", "senior-leader", "career-transition"],
    "senior-leader": ["mid-career"],
    "career-transition": ["early-career", "mid-career", "returning-to-work"],
    "returning-to-work": ["career-transition", "mid-career"],
    founder: ["mid-career", "senior-leader"],
  };

  if (adjacency[memberStage]?.some((stage) => circleStages.includes(stage as never))) {
    return 0.45;
  }

  return 0;
}

/**
 * Deterministic Circle matching score.
 * Weights: goals 45%, format 20%, location 15%, frequency 10%, career stage 10%.
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
  if (overlap.length > 0) {
    reasons.push({
      label: "Shared goals",
      detail: `Aligned on ${overlap.map((goal) => GOAL_LABELS[goal]).join(", ").toLowerCase()}.`,
      weight: MATCH_WEIGHTS.goals,
    });
  } else {
    reasons.push({
      label: "Topic fit",
      detail: "Fewer direct goal overlaps, but this Circle still covers adjacent career themes.",
      weight: MATCH_WEIGHTS.goals,
    });
  }

  const formatScore = formatCompatible(preferences.format, circle.format);
  const formatWeighted = formatScore * MATCH_WEIGHTS.format;
  reasons.push({
    label: "Meeting format",
    detail:
      preferences.format === "either"
        ? `This Circle meets ${circle.format}, and you are open to either format.`
        : formatScore >= 0.85
          ? `Matches your preference for ${preferences.format === "in-person" ? "in-person" : preferences.format} meetings.`
          : `This Circle is ${circle.format}; you preferred ${preferences.format}.`,
    weight: MATCH_WEIGHTS.format,
  });

  const locationScore = locationCompatible(preferences.location, circle.location);
  const locationWeighted = locationScore * MATCH_WEIGHTS.location;
  reasons.push({
    label: "Location",
    detail:
      locationScore >= 1
        ? `Location fits: ${circle.location}.`
        : locationScore >= 0.5
          ? `Partial location fit with ${circle.location}.`
          : `Based elsewhere (${circle.location}); still worth considering if format works for you.`,
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
  reasons.push({
    label: "Career stage",
    detail:
      careerScore === 1
        ? `Designed for ${CAREER_STAGE_LABELS[preferences.careerStage].toLowerCase()} members.`
        : careerScore > 0
          ? `Welcomes adjacent stages, including ${CAREER_STAGE_LABELS[preferences.careerStage].toLowerCase()}.`
          : `Primarily serves other career stages, though the topics may still resonate.`,
    weight: MATCH_WEIGHTS.careerStage,
  });

  // Support-type soft boost (does not change weight model; used only for reason richness)
  const supportOverlap = preferences.supportTypes.filter((type) =>
    circle.supportTypes.includes(type),
  );
  if (supportOverlap.length > 0) {
    reasons.unshift({
      label: "Support style",
      detail: `Offers the kind of support you asked for.`,
      weight: 0,
    });
  }

  const raw =
    goalWeighted +
    formatWeighted +
    locationWeighted +
    frequencyWeighted +
    careerWeighted;

  const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

  // Prefer reasons that contributed most positively
  const sortedReasons = [...reasons]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);

  return {
    circle,
    score,
    reasons: sortedReasons,
  };
}

export function rankCircleMatches(
  preferences: MatchFormInput,
  circles: Circle[],
): CircleMatch[] {
  return circles
    .map((circle) => scoreCircleMatch(preferences, circle))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.circle.name.localeCompare(b.circle.name);
    });
}

export function explainTopMatch(match: CircleMatch): string {
  const primary = match.reasons.find((reason) => reason.weight > 0);
  return primary?.detail ?? "This Circle aligns with several of your preferences.";
}
