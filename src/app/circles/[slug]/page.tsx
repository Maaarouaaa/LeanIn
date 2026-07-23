import { CircleVisual } from "@/components/circles/CircleVisual";
import { JoinRequestCTA } from "@/components/circles/JoinRequestCTA";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getCircleBySlugAction } from "@/lib/actions/circle-match";
import { CAREER_STAGE_LABELS, GOAL_LABELS } from "@/lib/constants";
import type { Metadata } from "next";
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
      <div className="rounded-xl border border-danger/20 bg-danger-soft px-6 py-8 text-danger" role="alert">
        <h1 className="font-serif text-3xl">Something went wrong</h1>
        <p className="mt-2 text-sm">{result.error}</p>
      </div>
    );
  }

  const { circle, request } = result.data;

  return (
    <div className="page-enter space-y-8">
      <Link
        href="/matches"
        className="inline-flex text-sm font-medium text-burgundy underline-offset-4 hover:underline"
      >
        ← Back to matches
      </Link>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <CircleVisual circle={circle} className="h-56 sm:h-64" />
        <div className="space-y-8 p-6 sm:p-8">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="burgundy">{circle.category}</StatusBadge>
              <StatusBadge>
                {circle.format} · {circle.frequency}
              </StatusBadge>
            </div>
            <h1 className="font-serif text-4xl text-ink sm:text-5xl">
              {circle.name}
            </h1>
            <p className="max-w-3xl text-lg text-ink-muted">
              {circle.description}
            </p>
          </header>

          <JoinRequestCTA circle={circle} initialRequest={request} />

          <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-2">
            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-ink">Who it is for</h2>
              <p className="text-ink-muted">{circle.whoItsFor}</p>
              <p className="text-sm text-ink-subtle">
                Career stages:{" "}
                {circle.careerStages
                  .map((stage) => CAREER_STAGE_LABELS[stage])
                  .join(", ")}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl text-ink">Meeting details</h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-ink-subtle">Location</dt>
                  <dd className="text-ink">{circle.location}</dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Schedule</dt>
                  <dd className="text-ink">{circle.schedule}</dd>
                </div>
                <div>
                  <dt className="text-ink-subtle">Members</dt>
                  <dd className="text-ink">{circle.memberCount} members</dd>
                </div>
              </dl>
            </section>
          </div>

          <section className="space-y-3 border-t border-border pt-8">
            <h2 className="font-serif text-2xl text-ink">Topics discussed</h2>
            <ul className="flex flex-wrap gap-2">
              {circle.topics.map((topic) => (
                <li
                  key={topic}
                  className="rounded-full border border-border bg-blush px-3 py-1.5 text-sm text-ink"
                >
                  {GOAL_LABELS[topic]}
                </li>
              ))}
            </ul>
          </section>

          <div className="grid gap-8 border-t border-border pt-8 lg:grid-cols-2">
            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-ink">Circle leader</h2>
              <div className="flex items-start gap-4">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-burgundy text-sm font-semibold text-white"
                  aria-hidden="true"
                >
                  {circle.leader.initials}
                </div>
                <div>
                  <p className="font-medium text-ink">{circle.leader.name}</p>
                  <p className="text-sm text-ink-muted">{circle.leader.title}</p>
                  <p className="mt-2 text-sm text-ink-muted">
                    {circle.leader.bio}
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-serif text-2xl text-ink">Member preview</h2>
              <ul className="space-y-3">
                {circle.members.map((member) => (
                  <li key={member.name} className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-blush text-xs font-semibold text-burgundy"
                      aria-hidden="true"
                    >
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {member.name}
                      </p>
                      <p className="text-xs text-ink-muted">{member.role}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
