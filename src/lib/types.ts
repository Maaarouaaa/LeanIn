export type SupportType =
  | "peer-support"
  | "skill-building"
  | "accountability"
  | "networking"
  | "leadership-growth";

export type CareerStage =
  | "early-career"
  | "mid-career"
  | "senior-leader"
  | "career-transition"
  | "returning-to-work"
  | "founder";

export type MeetingFormat = "virtual" | "in-person" | "hybrid" | "either";

export type MeetingFrequency =
  | "weekly"
  | "biweekly"
  | "monthly"
  | "flexible";

export type Goal =
  | "growing-as-a-leader"
  | "navigating-career-transition"
  | "building-confidence"
  | "finding-mentorship"
  | "growing-in-technology"
  | "returning-to-work"
  | "work-life-integration"
  | "entrepreneurship";

export type JoinRequestStatus = "pending" | "approved" | "declined";

export interface MemberPreferences {
  supportTypes: SupportType[];
  careerStage: CareerStage | null;
  goals: Goal[];
  format: MeetingFormat | null;
  frequency: MeetingFrequency | null;
  location: string;
  availability: string;
}

export interface Profile {
  id: string;
  displayName: string;
  email: string;
  preferences: MemberPreferences | null;
  createdAt: string;
  updatedAt: string;
}

export interface CircleMemberPreview {
  name: string;
  role: string;
  initials: string;
}

export interface CircleLeader {
  name: string;
  title: string;
  bio: string;
  initials: string;
}

export interface Circle {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  whoItsFor: string;
  topics: Goal[];
  supportTypes: SupportType[];
  careerStages: CareerStage[];
  format: Exclude<MeetingFormat, "either">;
  frequency: MeetingFrequency;
  location: string;
  schedule: string;
  memberCount: number;
  imageTone: "burgundy" | "blush" | "sage" | "sand" | "slate" | "rose";
  leader: CircleLeader;
  members: CircleMemberPreview[];
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  profileId: string;
  circleId: string;
  note: string | null;
  status: JoinRequestStatus;
  createdAt: string;
}

export interface MatchReason {
  label: string;
  detail: string;
  weight: number;
}

export interface CircleMatch {
  circle: Circle;
  score: number;
  reasons: MatchReason[];
}

export interface MatchFormInput {
  supportTypes: SupportType[];
  careerStage: CareerStage;
  goals: Goal[];
  format: MeetingFormat;
  frequency: MeetingFrequency;
  location: string;
  availability?: string;
}
