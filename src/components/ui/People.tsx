import { cn } from "@/lib/cn";
import {
  CIRCLE_PORTRAIT_POOL,
  remainingMemberCount,
  resolveLeaderPortrait,
  resolveMemberPortrait,
} from "@/lib/circle-portraits";
import type { Circle, CircleLeader, CircleMemberPreview } from "@/lib/types";
import Image from "next/image";

export function MatchBadge({
  score,
  tone = "yellow",
  className,
}: {
  score: number;
  tone?: "yellow" | "lavender" | "lime";
  className?: string;
}) {
  const tones = {
    yellow: "bg-yellow text-ink",
    lavender: "bg-lavender text-ink",
    lime: "bg-lime text-ink",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border border-ink px-2.5 py-1 type-meta font-semibold",
        tones[tone],
        className,
      )}
    >
      {score}% match
    </span>
  );
}

export function MemberAvatars({
  members,
  memberCount,
  circle,
}: {
  members: CircleMemberPreview[];
  memberCount: number;
  circle: Circle;
}) {
  // Always show four overlapping portraits; fill from the asset pool when needed.
  const shown: CircleMemberPreview[] = [...members.slice(0, 4)];
  let padIndex = 0;
  while (shown.length < 4) {
    const portrait =
      CIRCLE_PORTRAIT_POOL.filter((item) => item.src !== circle.imageSrc)[
        padIndex % Math.max(1, CIRCLE_PORTRAIT_POOL.length - 1)
      ] ?? CIRCLE_PORTRAIT_POOL[0];
    shown.push({
      name: `Circle member ${shown.length + 1}`,
      role: "Member",
      initials: "•",
      imageSrc: portrait.src,
      imageAlt: portrait.alt,
    });
    padIndex += 1;
  }

  const remaining = remainingMemberCount(Math.max(memberCount, 4), shown.length);

  return (
    <div className="flex items-center gap-3">
      <ul className="flex items-center" aria-label="Circle members">
        {shown.map((member, index) => {
          const portrait = resolveMemberPortrait(member, index, circle);
          return (
            <li
              key={`${member.name}-${index}`}
              className={cn(
                "relative h-12 w-12 overflow-hidden rounded-full border border-ink bg-paper-deep",
                index > 0 && "-ml-3",
              )}
              style={{ zIndex: shown.length - index }}
              title={
                member.role === "Member"
                  ? "Circle member"
                  : `${member.name}, ${member.role}`
              }
            >
              <Image
                src={portrait.src}
                alt={
                  member.role === "Member"
                    ? portrait.alt
                    : `${member.name}, ${member.role}`
                }
                fill
                className="object-cover"
                sizes="48px"
              />
            </li>
          );
        })}
      </ul>
      {remaining > 0 ? (
        <p
          className="type-meta font-semibold text-ink"
          aria-label={`${remaining} more members`}
        >
          +{remaining}
        </p>
      ) : null}
    </div>
  );
}

export function LeaderProfile({
  leader,
  circle,
}: {
  leader: CircleLeader;
  circle: Circle;
}) {
  const portrait = resolveLeaderPortrait(leader, circle);
  const facilitationNote =
    leader.facilitationNote?.trim() ||
    (leader.since
      ? `She has led this Circle since ${leader.since}, keeping each gathering focused on one live workplace situation.`
      : leader.bio.trim() || null);

  return (
    <figure className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
      <div className="relative h-40 w-32 shrink-0 overflow-hidden border border-ink bg-paper-deep sm:h-48 sm:w-36">
        <Image
          src={portrait.src}
          alt={portrait.alt}
          fill
          className="object-cover object-[center_20%]"
          sizes="(max-width: 640px) 128px, 144px"
        />
      </div>
      <figcaption className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="text-xl font-semibold text-ink sm:text-2xl">
            {leader.name}
          </p>
          <p className="mt-1 type-meta text-ink-muted">{leader.title}</p>
        </div>
        {facilitationNote ? (
          <p className="measure type-body text-ink-soft">{facilitationNote}</p>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function StatusBanner({
  tone,
  title,
  children,
}: {
  tone: "success" | "error" | "info";
  title: string;
  children?: React.ReactNode;
}) {
  const tones = {
    success: "border-success bg-success-soft text-success",
    error: "border-error bg-error-soft text-error",
    info: "border-ink bg-lavender/40 text-ink",
  };
  return (
    <div className={cn("border px-4 py-4 text-sm", tones[tone])} role="status">
      <p className="font-bold">{title}</p>
      {children ? <div className="mt-1">{children}</div> : null}
    </div>
  );
}
