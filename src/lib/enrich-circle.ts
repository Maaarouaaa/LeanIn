import { SEED_CIRCLES } from "@/lib/data/seed";
import type { Circle } from "@/lib/types";

/**
 * Overlay editorial presentation fields from the local seed when a Circle
 * loaded from the database is missing photos, quotes, or richer copy.
 * Operational fields (id, schedule, etc.) stay as stored.
 */
export function enrichCirclePresentation(circle: Circle): Circle {
  const seed = SEED_CIRCLES.find(
    (item) => item.slug === circle.slug || item.id === circle.id,
  );
  if (!seed) return circle;

  const leaderNeedsEnrichment =
    !circle.leader.facilitationNote || !circle.leader.imageSrc;

  const membersNeedEnrichment =
    circle.members.length < 4 ||
    circle.members.some((member) => !member.imageSrc);

  const copyNeedsEnrichment =
    !circle.description?.trim() ||
    circle.description.length < 80 ||
    !circle.whoItsFor?.trim() ||
    circle.whoItsFor.length < 40;

  return {
    ...circle,
    description: copyNeedsEnrichment ? seed.description : circle.description,
    whoItsFor: copyNeedsEnrichment ? seed.whoItsFor : circle.whoItsFor,
    memberCount: Math.max(circle.memberCount, seed.memberCount),
    leader: leaderNeedsEnrichment
      ? {
          ...seed.leader,
          ...circle.leader,
          facilitationNote:
            circle.leader.facilitationNote ?? seed.leader.facilitationNote,
          imageSrc: circle.leader.imageSrc ?? seed.leader.imageSrc,
          imageAlt: circle.leader.imageAlt ?? seed.leader.imageAlt,
          bio: seed.leader.bio || circle.leader.bio,
        }
      : circle.leader,
    members: membersNeedEnrichment ? seed.members : circle.members,
  };
}
