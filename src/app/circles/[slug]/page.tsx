import { JoinRequestCTA } from "@/components/circles/JoinRequestCTA";
import { ProgressTracker } from "@/components/ui/ProgressTracker";
import {
  LeaderProfile,
  MatchBadge,
  MemberAvatars,
} from "@/components/ui/People";
import { getCircleBySlugAction } from "@/lib/actions/circle-match";
import { GOAL_LABELS } from "@/lib/constants";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CirclePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CirclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCircleBySlugAction(slug);
  if (!result.ok) return { title: "Circle" };
  return { title: result.data.circle.name };
}

export default async function CircleDetailPage({ params }: CirclePageProps) {
  const { slug } = await params;
  const result = await getCircleBySlugAction(slug);

  if (!result.ok) {
    if (result.error === "Circle not found.") notFound();
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-error" role="alert">
        <h1 className="font-display text-4xl">Something went wrong</h1>
        <p className="mt-2 text-sm">{result.error}</p>
      </div>
    );
  }

  const { circle, request, match } = result.data;

  return (
    <div className="page-enter">
      <div className="border-b border-ink bg-paper px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] justify-end">
          <ProgressTracker currentStep={3} />
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-ink">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              {circle.category} · {circle.location}
            </p>
            <h1 className="max-w-xl font-display text-5xl leading-[0.9] text-ink sm:text-6xl lg:text-7xl">
              {circle.name}
            </h1>
            <p className="max-w-xl text-lg text-ink-soft">{circle.description}</p>
            <JoinRequestCTA circle={circle} initialRequest={request} />
          </div>
          <div className="relative min-h-80 bg-yellow">
            <div className="absolute inset-5 overflow-hidden organic-mask-wide sm:inset-8">
              <Image
                src={circle.imageSrc}
                alt={circle.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </div>
            {match ? (
              <div className="absolute bottom-8 right-8 z-10 bg-ink/80 px-3 py-2 text-white backdrop-blur-sm">
                <p className="font-display text-2xl leading-none">
                  {match.score}%
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                  Match
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-0 px-4 sm:px-6 lg:px-10">
        <section className="grid gap-8 border-b border-ink py-10 lg:grid-cols-2">
          <div className="space-y-3">
            <h2 className="font-display text-3xl text-ink">About this Circle</h2>
            <p className="font-editorial text-lg leading-relaxed text-ink-soft">
              {circle.description}
            </p>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-3xl text-ink">Who it’s for</h2>
            <p className="text-ink-soft">{circle.whoItsFor}</p>
          </div>
        </section>

        <section className="grid gap-6 border-b border-ink py-10 sm:grid-cols-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Location & format
            </h3>
            <p className="mt-2 text-ink">
              {circle.location} ·{" "}
              {circle.format === "in-person" ? "In person" : circle.format}
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Schedule
            </h3>
            <p className="mt-2 text-ink">{circle.schedule}</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              Next meeting
            </h3>
            <p className="mt-2 text-ink">{circle.nextMeeting}</p>
          </div>
        </section>

        <section className="space-y-4 border-b border-ink py-10">
          <h2 className="font-display text-3xl text-ink">Topics we discuss</h2>
          <ul className="flex flex-wrap gap-2">
            {circle.topics.map((topic, index) => (
              <li
                key={topic}
                className={
                  index === 0
                    ? "inline-flex items-center gap-2 rounded-full border border-ink bg-yellow px-4 py-2 text-sm font-semibold"
                    : "inline-flex items-center rounded-full border border-ink bg-surface px-4 py-2 text-sm font-semibold"
                }
              >
                {index === 0 ? (
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-ink"
                    aria-hidden="true"
                  />
                ) : null}
                {GOAL_LABELS[topic]}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-10 border-b border-ink py-10 lg:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-ink">
              The people in this Circle
            </h2>
            <MemberAvatars
              members={circle.members}
              memberCount={circle.memberCount}
            />
            <p className="text-sm text-ink-muted">
              {circle.memberCount} members — Product, finance, public service,
              and social impact.
            </p>
          </div>
          <div className="space-y-4">
            <h2 className="font-display text-3xl text-ink">Circle leader</h2>
            <LeaderProfile leader={circle.leader} />
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 py-8">
          <Link
            href="/matches"
            className="text-sm font-bold uppercase tracking-[0.12em] text-ink underline-offset-4 hover:underline"
          >
            ← Back to matches
          </Link>
          {match ? <MatchBadge score={match.score} /> : null}
        </div>
      </div>
    </div>
  );
}
