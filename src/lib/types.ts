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

export type AvailabilityWindow =
  | "weekday-mornings"
  | "weekday-afternoons"
  | "weekday-evenings"
  | "weeknights"
  | "weekends"
  | "flexible";

export interface MemberPreferences {
  goals: Goal[];
  careerStage: CareerStage | null;
  format: MeetingFormat | null;
  frequency: MeetingFrequency | null;
  location: string;
  availability: AvailabilityWindow | "";
  includeVirtualOutsideLocation: boolean;
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
  imageSrc?: string;
  imageAlt?: string;
}

export interface CircleLeader {
  name: string;
  title: string;
  bio: string;
  initials: string;
  since?: string;
  imageSrc?: string;
  imageAlt?: string;
  /** First-person quote for the leader profile. */
  quote?: string;
  /** One concrete detail about how she runs meetings. */
  facilitationNote?: string;
}

export interface Circle {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  whoItsFor: string;
  topics: Goal[];
  careerStages: CareerStage[];
  format: Exclude<MeetingFormat, "either">;
  frequency: MeetingFrequency;
  location: string;
  schedule: string;
  nextMeeting: string;
  memberCount: number;
  imageSrc: string;
  imageAlt: string;
  meetsWeeknights: boolean;
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
  updatedAt: string;
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
  goals: Goal[];
  careerStage: CareerStage;
  format: MeetingFormat;
  frequency: MeetingFrequency;
  location: string;
  availability?: AvailabilityWindow | "";
  includeVirtualOutsideLocation: boolean;
}
