import { JoinRequestCTA } from "@/components/circles/JoinRequestCTA";
import { LeaderProfile, MemberAvatars } from "@/components/ui/People";
import { EditorialImageFrame } from "@/components/ui/EditorialImageFrame";
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
  searchParams?: Promise<{ from?: string | string[] }>;
}

function formatLabel(format: string): string {
  if (format === "in-person") return "In person";
  if (format === "virtual") return "Virtual";
  if (format === "hybrid") return "Hybrid";
  return format;
}

function leaderFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export async function generateMetadata({
  params,
}: CirclePageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCircleBySlugAction(slug);
  if (!result.ok) return { title: "Circle" };
  return { title: result.data.circle.name };
}

export default async function CircleDetailPage({
  params,
  searchParams,
}: CirclePageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const fromRaw = Array.isArray(query?.from) ? query?.from[0] : query?.from;
  const fromCommunity = fromRaw === "community";
  const result = await getCircleBySlugAction(slug);

  if (!result.ok) {
    if (result.error === "Circle not found.") notFound();
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-error" role="alert">
        <h1 className="type-section text-error">Something went wrong</h1>
        <p className="mt-2 type-meta">{result.error}</p>
      </div>
    );
  }

  const { circle, request, match } = result.data;
  const matchSentence = match ? explainTopMatch(match) : null;
  const topicLabels = circle.topics.map(
    (topic) => GOAL_LABELS[topic] ?? topic,
  );
  const locationCity = circle.location.split("·")[0]?.trim() ?? circle.location;
  const leaderGivenName = leaderFirstName(circle.leader.name);

  return (
    <div className="page-enter">
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 px-4 pb-10 pt-8 sm:px-6 lg:px-10 lg:pb-14 lg:pt-16">
            <p className="type-eyebrow text-ink-muted">
              {circle.category} · {locationCity}
            </p>

            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <h1 className="type-page max-w-xl text-ink">{circle.name}</h1>
              {match ? (
                <span className="mb-1 inline-flex items-baseline gap-1.5 border border-ink bg-yellow px-2.5 py-1 font-product">
                  <span className="text-2xl font-semibold leading-none text-ink">
                    {match.score}%
                  </span>
                  <span className="type-meta font-medium text-ink">match</span>
                </span>
              ) : null}
            </div>

            {matchSentence ? (
              <p className="measure font-editorial type-lead italic text-plum">
                {matchSentence}
              </p>
            ) : (
              <p className="measure font-editorial type-lead text-ink-soft">
                {circle.description}
              </p>
            )}
          </div>

          <div className="relative flex min-h-72 items-center bg-lavender/50 p-4 sm:p-6 lg:min-h-full lg:p-8">
            <EditorialImageFrame variant="detail" className="w-full">
              <Image
                src={circle.imageSrc}
                alt={circle.imageAlt}
                fill
                className="z-0 object-cover object-[50%_38%]"
                sizes="(max-width: 1024px) 100vw, 45vw"
                priority
              />
            </EditorialImageFrame>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="grid gap-12 lg:grid-cols-[7fr_5fr] lg:gap-16 xl:gap-20">
          <article className="min-w-0">
            <div className="measure space-y-5">
              <p className="font-editorial type-lead text-ink-soft">
                {circle.description}
              </p>
              <p className="font-editorial type-lead italic text-ink">
                {circle.whoItsFor}
              </p>
            </div>

            <section className="mt-12 space-y-4" aria-labelledby="topics-heading">
              <h2 id="topics-heading" className="type-section text-ink">
                What we talk about
              </h2>
              <ul className="flex flex-wrap gap-2" aria-label="Circle topics">
                {topicLabels.map((label) => (
                  <li
                    key={label}
                    className="border border-ink/25 bg-paper-deep px-3 py-1.5 type-meta font-medium text-ink"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </section>

            <section
              className="mt-14 space-y-5"
              aria-labelledby="people-heading"
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="people-heading" className="type-section text-ink">
                  Meet the Circle
                </h2>
                <MemberAvatars
                  members={circle.members}
                  memberCount={circle.memberCount}
                  circle={circle}
                />
              </div>
            </section>

            <section
              className="mt-14 space-y-5"
              aria-labelledby="leader-heading"
            >
              <h2 id="leader-heading" className="type-section text-ink">
                Led by {leaderGivenName}
              </h2>
              <LeaderProfile leader={circle.leader} circle={circle} />
            </section>

            <div className="mt-10">
              <Link
                href={fromCommunity ? "/community" : "/matches"}
                className="type-meta font-semibold text-ink underline-offset-4 hover:underline"
              >
                {fromCommunity
                  ? "← Back to community"
                  : "← Back to your matches"}
              </Link>
            </div>
          </article>

          <aside className="lg:pt-1">
            <div className="space-y-7 border border-ink bg-surface px-5 py-6 sm:px-6 lg:sticky lg:top-6">
              <dl className="space-y-5">
                <div>
                  <dt className="type-meta font-semibold text-ink">
                    Location and format
                  </dt>
                  <dd className="mt-1 type-body text-ink-soft">
                    {circle.location}
                    <span className="text-ink-muted">
                      {" "}
                      · {formatLabel(circle.format)}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="type-meta font-semibold text-ink">Schedule</dt>
                  <dd className="mt-1 type-body text-ink-soft">
                    {circle.schedule}
                  </dd>
                </div>
                <div>
                  <dt className="type-meta font-semibold text-ink">
                    Next meeting
                  </dt>
                  <dd className="mt-1 type-body font-medium text-ink">
                    {circle.nextMeeting}
                  </dd>
                </div>
              </dl>

              {matchSentence ? (
                <div className="border-t border-ink/15 pt-6">
                  <p className="type-meta font-semibold text-ink">
                    Why this match
                  </p>
                  <p className="mt-2 type-body text-ink-soft">{matchSentence}</p>
                </div>
              ) : null}

              <div className="border-t border-ink/15 pt-6">
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
