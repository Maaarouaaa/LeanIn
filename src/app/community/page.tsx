import { CommunityExperience } from "@/components/circles/CommunityExperience";
import { getCommunityCircles } from "@/lib/actions/circle-match";
import type { Metadata } from "next";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community",
};

export default async function CommunityPage() {
  const result = await getCommunityCircles();
  const circles = result.ok ? result.data.circles : [];
  const total = circles.length;

  return (
    <div className="page-enter">
      <section className="border-b border-ink bg-yellow px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1440px] space-y-3">
          <p className="type-eyebrow text-ink">Lean In Connect</p>
          <h1 className="type-page text-ink">Explore all Circles</h1>
          <p className="measure font-editorial type-lead italic text-plum">
            Browse the complete community—every Circle, not only your top
            matches.
          </p>
          <p className="type-meta text-ink-soft">
            {result.ok
              ? `${total} Circle${total === 1 ? "" : "s"} available`
              : "Community catalog"}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <Suspense
          fallback={
            <p className="type-meta text-ink-muted">Loading Circles…</p>
          }
        >
          <CommunityExperience
            circles={circles}
            scoresById={result.ok ? result.data.scoresById : {}}
            preferences={result.ok ? result.data.preferences : null}
            error={result.ok ? null : result.error}
          />
        </Suspense>
      </div>
    </div>
  );
}
