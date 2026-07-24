import type { Circle, CircleLeader, CircleMemberPreview } from "@/lib/types";

/** Shared portrait pool drawn from existing Circle photography. */
export const CIRCLE_PORTRAIT_POOL = [
  {
    src: "/assets/circles/leadership-lab.jpg",
    alt: "Two women smiling together at a community gathering",
  },
  {
    src: "/assets/circles/women-tech.jpg",
    alt: "Woman presenting at a technology workplace gathering",
  },
  {
    src: "/assets/circles/founders.jpg",
    alt: "Woman speaking with confidence at a founders meetup",
  },
  {
    src: "/assets/circles/returning.jpg",
    alt: "Professional woman smiling outdoors in soft daylight",
  },
  {
    src: "/assets/circles/work-life.jpg",
    alt: "Two colleagues collaborating across a sunlit table",
  },
  {
    src: "/assets/circles/transition.jpg",
    alt: "Team workshop conversation around a shared table",
  },
  {
    src: "/assets/circles/early-career.jpg",
    alt: "Young professionals collaborating outdoors",
  },
  {
    src: "/assets/circles/product-tech.jpg",
    alt: "Professionals collaborating in a bright workspace",
  },
] as const;

export function resolveMemberPortrait(
  member: CircleMemberPreview,
  index: number,
  circle: Circle,
): { src: string; alt: string } {
  if (member.imageSrc) {
    return {
      src: member.imageSrc,
      alt: member.imageAlt ?? `${member.name}, ${member.role}`,
    };
  }
  // Prefer other Circle photos so portraits don't all match the hero.
  const pool = CIRCLE_PORTRAIT_POOL.filter((item) => item.src !== circle.imageSrc);
  const pick = pool[index % pool.length] ?? CIRCLE_PORTRAIT_POOL[0];
  return {
    src: pick.src,
    alt: `${member.name}, ${member.role}`,
  };
}

export function resolveLeaderPortrait(
  leader: CircleLeader,
  circle: Circle,
): { src: string; alt: string } {
  if (leader.imageSrc) {
    return {
      src: leader.imageSrc,
      alt: leader.imageAlt ?? `${leader.name}, Circle leader`,
    };
  }
  return {
    src: circle.imageSrc,
    alt: leader.imageAlt ?? `${leader.name}, Circle leader`,
  };
}

export function remainingMemberCount(memberCount: number, shown = 4): number {
  return Math.max(0, memberCount - shown);
}
