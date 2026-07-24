import { Button } from "@/components/ui/Button";
import { MatchBadge } from "@/components/ui/People";
import { explainTopMatch } from "@/lib/matching";
import type { CircleMatch } from "@/lib/types";
import Image from "next/image";
import Link from "next/link";

export function FeaturedMatchCard({ match }: { match: CircleMatch }) {
  const { circle, score } = match;
  const why = explainTopMatch(match);

  return (
    <article className="overflow-hidden rounded-2xl border border-ink bg-ink text-white">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-yellow">
            Top match
          </p>
          <h2 className="font-display text-4xl leading-[0.92] sm:text-5xl">
            {circle.name}
          </h2>
          <p className="max-w-xl text-base text-white/85">{circle.description}</p>
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-white/55">Format</dt>
              <dd className="mt-1">
                {circle.location} ·{" "}
                {circle.format === "in-person" ? "In person" : circle.format}
              </dd>
            </div>
            <div>
              <dt className="text-white/55">Schedule</dt>
              <dd className="mt-1">{circle.schedule}</dd>
            </div>
            <div>
              <dt className="text-white/55">Members</dt>
              <dd className="mt-1">{circle.memberCount} members</dd>
            </div>
          </dl>
          <div className="inline-block border border-ink bg-yellow px-3 py-2 text-ink">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Why this matches
            </p>
            <p className="mt-1 text-sm font-medium">{why}</p>
          </div>
        </div>

        <div className="relative min-h-72">
          <div className="absolute right-5 top-0 z-10 -translate-y-1/4">
            <div className="border border-ink bg-yellow px-3 py-4 text-center text-ink">
              <p className="font-display text-3xl leading-none">{score}%</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em]">
                Match
              </p>
            </div>
          </div>
          <div className="absolute inset-4 overflow-hidden organic-mask-wide sm:inset-6">
            <Image
              src={circle.imageSrc}
              alt={circle.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </div>
          <div className="absolute bottom-8 right-8 z-10">
            <Link href={`/circles/${circle.slug}`}>
              <Button variant="yellow">View Circle →</Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SecondaryMatchCard({
  match,
  tone,
}: {
  match: CircleMatch;
  tone: "lavender" | "lime";
}) {
  const { circle, score } = match;
  const why = explainTopMatch(match);

  return (
    <article className="grid overflow-hidden border border-ink bg-surface sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative min-h-48">
        <div className="absolute left-3 top-3 z-10">
          <MatchBadge score={score} tone={tone} />
        </div>
        <Image
          src={circle.imageSrc}
          alt={circle.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 30vw"
        />
      </div>
      <div className="space-y-3 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
          {circle.category}
        </p>
        <h3 className="font-display text-2xl leading-none text-ink">
          {circle.name}
        </h3>
        <p className="text-sm text-ink-soft">{why}</p>
        <p className="text-sm text-ink-muted">
          {circle.format === "in-person" ? circle.location : "Virtual"} ·{" "}
          {circle.schedule} · {circle.memberCount} members
        </p>
        <Link
          href={`/circles/${circle.slug}`}
          className="inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
        >
          View Circle →
        </Link>
      </div>
    </article>
  );
}
