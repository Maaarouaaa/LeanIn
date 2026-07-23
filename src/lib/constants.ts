import type {
  CareerStage,
  Goal,
  MeetingFormat,
  MeetingFrequency,
  SupportType,
} from "@/lib/types";

export const DEMO_PROFILE_ID = "11111111-1111-1111-1111-111111111111";

export const SUPPORT_TYPE_OPTIONS: {
  value: SupportType;
  label: string;
  description: string;
}[] = [
  {
    value: "peer-support",
    label: "Peer support",
    description: "Share experiences with women navigating similar paths.",
  },
  {
    value: "skill-building",
    label: "Skill building",
    description: "Practice communication, negotiation, and career skills.",
  },
  {
    value: "accountability",
    label: "Accountability",
    description: "Stay focused on goals with a consistent group rhythm.",
  },
  {
    value: "networking",
    label: "Networking",
    description: "Meet women across industries and expand your circle.",
  },
  {
    value: "leadership-growth",
    label: "Leadership growth",
    description: "Grow confidence and presence as you take on more scope.",
  },
];

export const CAREER_STAGE_OPTIONS: { value: CareerStage; label: string }[] = [
  { value: "early-career", label: "Early career" },
  { value: "mid-career", label: "Mid-career" },
  { value: "senior-leader", label: "Senior leader" },
  { value: "career-transition", label: "Career transition" },
  { value: "returning-to-work", label: "Returning to work" },
  { value: "founder", label: "Founder / entrepreneur" },
];

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "growing-as-a-leader", label: "Growing as a leader" },
  { value: "navigating-career-transition", label: "Navigating a career transition" },
  { value: "building-confidence", label: "Building confidence" },
  { value: "finding-mentorship", label: "Finding mentorship" },
  { value: "growing-in-technology", label: "Growing in technology" },
  { value: "returning-to-work", label: "Returning to work" },
  { value: "work-life-integration", label: "Work-life integration" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
];

export const FORMAT_OPTIONS: {
  value: MeetingFormat;
  label: string;
  description: string;
}[] = [
  {
    value: "virtual",
    label: "Virtual",
    description: "Join from anywhere on video.",
  },
  {
    value: "in-person",
    label: "In person",
    description: "Meet face-to-face in your city.",
  },
  {
    value: "either",
    label: "Either",
    description: "Open to virtual or in-person Circles.",
  },
];

export const FREQUENCY_OPTIONS: {
  value: MeetingFrequency;
  label: string;
}[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Every two weeks" },
  { value: "monthly", label: "Monthly" },
  { value: "flexible", label: "Flexible" },
];

export const MATCH_WEIGHTS = {
  goals: 0.45,
  format: 0.2,
  location: 0.15,
  frequency: 0.1,
  careerStage: 0.1,
} as const;

export const GOAL_LABELS: Record<Goal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Goal, string>;

export const CAREER_STAGE_LABELS: Record<CareerStage, string> =
  Object.fromEntries(
    CAREER_STAGE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<CareerStage, string>;
