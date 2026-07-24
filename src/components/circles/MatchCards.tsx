import { ViewCircleLink } from "@/components/circles/ViewCircleLink";
import { EditorialImageFrame } from "@/components/ui/EditorialImageFrame";
import { MatchBadge } from "@/components/ui/People";
import { explainTopMatch } from "@/lib/matching";
import type { CircleMatch } from "@/lib/types";
import Image from "next/image";

export function FeaturedMatchCard({ match }: { match: CircleMatch }) {
  const { circle, score } = match;
  const why = explainTopMatch(match);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-ink bg-ink text-white">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col space-y-5 p-6 pb-20 sm:p-8 sm:pb-20">
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
          <ViewCircleLink
            slug={circle.slug}
            name={circle.name}
            tone="yellow"
          />
        </div>

        <div className="relative order-first p-4 sm:p-6 lg:order-none lg:p-6">
          <div className="absolute right-8 top-8 z-10 sm:right-10 sm:top-10">
            <div className="border border-ink bg-yellow px-3 py-4 text-center text-ink">
              <p className="text-3xl font-semibold leading-none">{score}%</p>
              <p className="mt-1 type-meta font-medium">Match</p>
            </div>
          </div>
          <EditorialImageFrame variant="feature">
            <Image
              src={circle.imageSrc}
              alt={circle.imageAlt}
              fill
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="z-0 object-cover object-[52%_42%]"
            />
          </EditorialImageFrame>
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
    <article className="relative grid overflow-hidden border border-ink bg-surface sm:grid-cols-[0.9fr_1.1fr]">
      <div className="relative p-3 sm:p-4">
        <div className="absolute left-5 top-5 z-10 sm:left-6 sm:top-6">
          <MatchBadge score={score} tone={tone} />
        </div>
        <EditorialImageFrame variant="card">
          <Image
            src={circle.imageSrc}
            alt={circle.imageAlt}
            fill
            className="z-0 object-cover object-[50%_40%]"
            sizes="(max-width: 640px) 100vw, 30vw"
          />
        </EditorialImageFrame>
      </div>
      <div className="relative space-y-3 p-5 pb-20">
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
