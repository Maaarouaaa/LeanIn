import { CircleVisual } from "@/components/circles/CircleVisual";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/cn";
import { GOAL_LABELS } from "@/lib/constants";
import { explainTopMatch } from "@/lib/matching";
import type { CircleMatch } from "@/lib/types";
import Link from "next/link";

interface CircleCardProps {
  match: CircleMatch;
  featured?: boolean;
  className?: string;
}

export function CircleCard({ match, featured = false, className }: CircleCardProps) {
  const { circle, score, reasons } = match;
  const why = explainTopMatch(match);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-xl border bg-surface transition-shadow motion-safe-transition",
        featured
          ? "border-burgundy/35 shadow-[var(--shadow-soft)]"
          : "border-border hover:border-border-strong",
        className,
      )}
    >
      <CircleVisual circle={circle} />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="burgundy">{score}% match</StatusBadge>
          {featured ? <StatusBadge tone="success">Top match</StatusBadge> : null}
          <StatusBadge>{circle.category}</StatusBadge>
        </div>

        <div className="space-y-2">
          <h3 className="font-serif text-2xl text-ink sm:text-[1.7rem]">
            {circle.name}
          </h3>
          <p className="text-sm text-ink-muted">{circle.description}</p>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-ink-subtle">Location & format</dt>
            <dd className="mt-0.5 text-ink">
              {circle.location} · {circle.format}
            </dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Schedule</dt>
            <dd className="mt-0.5 text-ink">{circle.schedule}</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Members</dt>
            <dd className="mt-0.5 text-ink">{circle.memberCount} members</dd>
          </div>
          <div>
            <dt className="text-ink-subtle">Topics</dt>
            <dd className="mt-0.5 text-ink">
              {circle.topics
                .slice(0, 2)
                .map((topic) => GOAL_LABELS[topic])
                .join(" · ")}
            </dd>
          </div>
        </dl>

        <div className="rounded-lg border border-border bg-blush/50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">
            Why this matches you
          </p>
          <p className="mt-1.5 text-sm text-ink">{why}</p>
          {reasons.length > 1 ? (
            <ul className="mt-2 space-y-1 text-sm text-ink-muted">
              {reasons.slice(0, 2).map((reason) => (
                <li key={reason.label}>· {reason.detail}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="pt-1">
          <Link href={`/circles/${circle.slug}`}>
            <Button className="w-full sm:w-auto">View Circle</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
