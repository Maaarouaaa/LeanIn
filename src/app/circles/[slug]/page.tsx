import { JoinRequestCTA } from "@/components/circles/JoinRequestCTA";
import { ProgressTracker } from "@/components/ui/ProgressTracker";
import { LeaderProfile, MemberAvatars } from "@/components/ui/People";
import { getCircleBySlugAction } from "@/lib/actions/circle-match";
import { GOAL_LABELS } from "@/lib/constants";
import { explainTopMatch } from "@/lib/matching";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CirclePageProps {
  params: Promise<{ slug: string }>;
}

function formatLabel(format: string): string {
  if (format === "in-person") return "In person";
  if (format === "virtual") return "Virtual";
  if (format === "hybrid") return "Hybrid";
  return format;
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
  const matchSentence = match ? explainTopMatch(match) : null;
  const topicSentence = circle.topics
    .map((topic) => GOAL_LABELS[topic] ?? topic)
    .join(" · ");

  return (
    <div className="page-enter">
      <div className="px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] justify-end">
          <ProgressTracker currentStep={3} />
        </div>
      </div>

      {/* Hero — brand title + match highlight; yellow reserved for match + CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 px-4 pb-10 pt-2 sm:px-6 lg:px-10 lg:pb-14">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
              {circle.category}
            </p>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h1 className="max-w-xl font-display text-5xl leading-[0.9] text-ink sm:text-6xl lg:text-7xl">
                {circle.name}
              </h1>
              {match ? (
                <span className="mb-1 inline-flex items-baseline gap-1.5 border border-ink bg-yellow px-2.5 py-1">
                  <span className="font-editorial text-2xl font-bold leading-none text-ink">
                    {match.score}%
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink">
                    match
                  </span>
                </span>
              ) : null}
            </div>

            {matchSentence ? (
              <p className="max-w-xl font-editorial text-lg italic leading-snug text-plum">
                {matchSentence}
              </p>
            ) : (
              <p className="max-w-xl text-lg leading-relaxed text-ink-soft">
                {circle.description}
              </p>
            )}
          </div>

          <div className="relative min-h-72 bg-lavender/50 lg:min-h-full">
            <div className="absolute inset-4 overflow-hidden sm:inset-6 lg:inset-8">
              <Image
                src={circle.imageSrc}
                alt={circle.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lower half — 7/5 editorial composition */}
      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16 xl:gap-20">
          {/* Left: continuous editorial story */}
          <article className="min-w-0">
            <header className="space-y-5">
              <h2 className="font-display text-3xl text-ink sm:text-4xl">
                Inside the Circle
              </h2>
              <div className="h-px w-24 bg-ink" aria-hidden="true" />
              <div className="max-w-2xl space-y-5 text-base leading-relaxed text-ink-soft sm:text-lg">
                <p>{circle.description}</p>
                <p className="font-editorial text-lg italic leading-relaxed text-ink sm:text-xl">
                  {circle.whoItsFor}
                </p>
                <p>
                  <span className="font-semibold text-ink">What you’ll work on: </span>
                  {topicSentence}.
                </p>
              </div>
            </header>

            <section className="mt-12 space-y-4" aria-labelledby="people-heading">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h3
                  id="people-heading"
                  className="font-editorial text-xl text-ink"
                >
                  Who’s already here
                </h3>
                <MemberAvatars
                  members={circle.members}
                  memberCount={circle.memberCount}
                  circle={circle}
                />
              </div>
            </section>

            <section className="mt-14 space-y-5" aria-labelledby="leader-heading">
              <h3
                id="leader-heading"
                className="font-editorial text-xl text-ink"
              >
                Led by
              </h3>
              <LeaderProfile leader={circle.leader} circle={circle} />
            </section>

            <div className="mt-10 pt-2">
              <Link
                href="/matches"
                className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
              >
                ← Back to your matches
              </Link>
            </div>
          </article>

          {/* Right: compact meeting rail */}
          <aside className="lg:pt-1">
            <div className="space-y-8 border border-ink bg-surface px-5 py-6 sm:px-6 lg:sticky lg:top-6">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  Meeting details
                </p>
                <dl className="mt-4 space-y-5">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Where
                    </dt>
                    <dd className="mt-1 text-sm leading-snug text-ink">
                      {circle.location}
                      <span className="text-ink-muted">
                        {" "}
                        · {formatLabel(circle.format)}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Cadence
                    </dt>
                    <dd className="mt-1 text-sm leading-snug text-ink">
                      {circle.schedule}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                      Next gathering
                    </dt>
                    <dd className="mt-1 font-editorial text-lg italic text-ink">
                      {circle.nextMeeting}
                    </dd>
                  </div>
                </dl>
              </div>

              {matchSentence ? (
                <div className="border-t border-ink/20 pt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                    Why this match
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {matchSentence}
                  </p>
                </div>
              ) : null}

              <div className="border-t border-ink/20 pt-6">
                <JoinRequestCTA
                  circle={circle}
                  initialRequest={request}
                  fullWidth
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
