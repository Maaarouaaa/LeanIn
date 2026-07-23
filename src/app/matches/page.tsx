import { MatchesExperience } from "@/components/circles/MatchesExperience";
import {
  getAllRankedMatches,
  getRankedMatches,
} from "@/lib/actions/circle-match";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Circle matches",
};

export default async function MatchesPage() {
  const [topResult, allResult] = await Promise.all([
    getRankedMatches(),
    getAllRankedMatches(),
  ]);

  if (!topResult.ok) {
    return (
      <div className="page-enter rounded-xl border border-danger/20 bg-danger-soft px-6 py-8 text-danger" role="alert">
        <h1 className="font-serif text-3xl">Unable to load matches</h1>
        <p className="mt-2 text-sm">{topResult.error}</p>
      </div>
    );
  }

  const allMatches = allResult.ok ? allResult.data.matches : topResult.data.matches;

  return (
    <div className="page-enter space-y-8">
      <header className="max-w-3xl space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-burgundy">
          Recommended for you
        </p>
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">
          Circles that fit your goals
        </h1>
        <p className="text-ink-muted">
          Ranked by goal overlap, format, location, meeting rhythm, and career
          stage. Your top recommendation is highlighted—without diminishing the
          other strong options.
        </p>
      </header>

      <MatchesExperience
        matches={topResult.data.matches}
        allMatches={allMatches}
        preferences={topResult.data.preferences}
      />
    </div>
  );
}
