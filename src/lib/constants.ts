import type {
  AvailabilityWindow,
  CareerStage,
  Goal,
  MeetingFormat,
  MeetingFrequency,
} from "@/lib/types";

export const DEMO_PROFILE_ID = "11111111-1111-1111-1111-111111111111";
export const DEMO_AUTH_COOKIE = "circle_match_member";
export const MAX_GOALS = 3;
export const MAX_NOTE_LENGTH = 1000;

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

export const CAREER_STAGE_OPTIONS: { value: CareerStage; label: string }[] = [
  { value: "early-career", label: "Early career" },
  { value: "mid-career", label: "Mid-career" },
  { value: "senior-leader", label: "Senior leader" },
  { value: "career-transition", label: "Career transition" },
  { value: "returning-to-work", label: "Returning to work" },
  { value: "founder", label: "Founder / entrepreneur" },
];

export const FORMAT_OPTIONS: {
  value: MeetingFormat;
  label: string;
}[] = [
  { value: "virtual", label: "Virtual" },
  { value: "in-person", label: "In person" },
  { value: "either", label: "Either" },
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

export const AVAILABILITY_OPTIONS: {
  value: AvailabilityWindow;
  label: string;
}[] = [
  { value: "weekday-mornings", label: "Weekday mornings" },
  { value: "weekday-afternoons", label: "Weekday afternoons" },
  { value: "weekday-evenings", label: "Weekday evenings" },
  { value: "weeknights", label: "Weeknights" },
  { value: "weekends", label: "Weekends" },
  { value: "flexible", label: "Flexible" },
];

export const MATCH_WEIGHTS = {
  goals: 0.4,
  format: 0.15,
  location: 0.15,
  frequency: 0.1,
  careerStage: 0.1,
  availability: 0.1,
} as const;

export const GOAL_LABELS: Record<Goal, string> = Object.fromEntries(
  GOAL_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Goal, string>;

export const CAREER_STAGE_LABELS: Record<CareerStage, string> =
  Object.fromEntries(
    CAREER_STAGE_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<CareerStage, string>;

export const GOAL_ACCENTS = [
  "yellow",
  "lime",
  "magenta",
  "lavender",
] as const;
