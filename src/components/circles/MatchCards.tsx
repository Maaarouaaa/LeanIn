import { ViewCircleLink } from "@/components/circles/ViewCircleLink";
import { MatchBadge } from "@/components/ui/People";
import { explainTopMatch } from "@/lib/matching";
import type { CircleMatch } from "@/lib/types";
import Image from "next/image";

export function FeaturedMatchCard({ match }: { match: CircleMatch }) {
  const { circle, score } = match;
  const why = explainTopMatch(match);

  return (
    <article className="overflow-hidden rounded-2xl border border-ink bg-ink text-white">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col space-y-5 p-6 sm:p-8">
          <p className="type-eyebrow text-yellow">Top match</p>
          <h2 className="font-editorial text-[clamp(1.75rem,3vw,2.5rem)] font-semibold leading-tight">
            {circle.name}
          </h2>
          <p className="measure type-body text-white/85">{circle.description}</p>
          <dl className="grid gap-4 type-meta sm:grid-cols-3">
            <div>
              <dt className="font-medium text-white/55">Format</dt>
              <dd className="mt-1 text-white/90">
                {circle.location} ·{" "}
                {circle.format === "in-person" ? "In person" : circle.format}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-white/55">Schedule</dt>
              <dd className="mt-1 text-white/90">{circle.schedule}</dd>
            </div>
            <div>
              <dt className="font-medium text-white/55">Members</dt>
              <dd className="mt-1 text-white/90">{circle.memberCount} members</dd>
            </div>
          </dl>
          <div className="inline-block border border-ink bg-yellow px-3 py-2 text-ink">
            <p className="type-meta font-semibold">Why this matches</p>
            <p className="mt-1 type-meta font-medium">{why}</p>
          </div>
          <div className="pt-1">
            <ViewCircleLink
              slug={circle.slug}
              name={circle.name}
              tone="yellow"
            />
          </div>
        </div>

        <div className="relative order-first p-4 sm:p-6 lg:order-none lg:p-6">
          <div className="absolute right-8 top-8 z-10 sm:right-10 sm:top-10">
            <div className="border border-ink bg-yellow px-3 py-4 text-center text-ink">
              <p className="text-3xl font-semibold leading-none">{score}%</p>
              <p className="mt-1 type-meta font-medium">Match</p>
            </div>
          </div>
          <div className="relative aspect-[16/9] min-w-0 overflow-hidden rounded-2xl bg-paper-deep">
            <Image
              src={circle.imageSrc}
              alt={circle.imageAlt}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[52%_42%]"
            />
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
        <p className="type-eyebrow text-ink-muted">{circle.category}</p>
        <h3 className="font-editorial text-2xl font-semibold leading-snug text-ink">
          {circle.name}
        </h3>
        <p className="type-body text-ink-soft">{why}</p>
        <p className="type-meta text-ink-muted">
          {circle.format === "in-person" ? circle.location : "Virtual"} ·{" "}
          {circle.schedule} · {circle.memberCount} members
        </p>
        <ViewCircleLink slug={circle.slug} name={circle.name} tone="light" />
      </div>
    </article>
  );
}
