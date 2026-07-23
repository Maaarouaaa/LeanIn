import { cn } from "@/lib/cn";

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
        "inline-flex items-center border border-ink px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]",
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
}: {
  members: { name: string; initials: string }[];
  memberCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ul className="flex -space-x-2">
        {members.slice(0, 4).map((member) => (
          <li
            key={member.name}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink bg-paper text-xs font-bold"
            title={member.name}
          >
            <span className="sr-only">{member.name}</span>
            <span aria-hidden="true">{member.initials}</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-ink-muted">
        {memberCount} members
      </p>
    </div>
  );
}

export function LeaderProfile({
  leader,
}: {
  leader: {
    name: string;
    title: string;
    bio?: string;
    initials: string;
    since?: string;
  };
}) {
  return (
    <div className="flex items-start gap-4">
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-ink bg-ink text-sm font-bold text-white"
        aria-hidden="true"
      >
        {leader.initials}
      </div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-ink">
          {leader.name}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {leader.title}
          {leader.since ? ` · Circle Leader since ${leader.since}` : null}
        </p>
        {leader.bio ? (
          <p className="mt-2 text-sm text-ink-soft">{leader.bio}</p>
        ) : null}
      </div>
    </div>
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
