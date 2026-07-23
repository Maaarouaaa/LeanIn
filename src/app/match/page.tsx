import { MatchForm } from "@/components/match/MatchForm";
import { getMemberPreferences } from "@/lib/actions/circle-match";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Find your Circle",
};

export default async function MatchPage() {
  const result = await getMemberPreferences();
  const preferences = result.ok ? result.data.preferences : null;

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-burgundy">
          Personalized matching
        </p>
        <h1 className="font-serif text-4xl text-ink sm:text-5xl">
          Tell us what belonging looks like for you
        </h1>
        <p className="max-w-2xl text-ink-muted">
          Lean In Connect offers many ways to participate. Circle Match helps
          you find a small, supportive Circle faster—using preferences that map
          directly to a transparent ranking score.
        </p>
      </header>

      {!result.ok ? (
        <p className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {result.error}
        </p>
      ) : null}

      <MatchForm initialPreferences={preferences} />
    </div>
  );
}
