import { MatchesExperience } from "@/components/circles/MatchesExperience";
import { Button } from "@/components/ui/Button";
import { EditorialHero } from "@/components/ui/EditorialHero";
import { ProgressTracker } from "@/components/ui/ProgressTracker";
import { getRankedMatches } from "@/lib/actions/circle-match";
import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your matches",
};

export default async function MatchesPage() {
  const result = await getRankedMatches();

  return (
    <div className="page-enter">
      <EditorialHero
        tone="yellow"
        eyebrow="Your recommendations"
        title="Three Circles."
        editorial="One strong starting point."
        outlineWord="Matched"
        progress={<ProgressTracker currentStep={2} />}
        actions={
          <Link href="/match">
            <Button variant="secondary">Edit preferences</Button>
          </Link>
        }
      />

      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        <MatchesExperience
          matches={result.ok ? result.data.matches : []}
          allMatches={result.ok ? result.data.allMatches : []}
          preferences={result.ok ? result.data.preferences : null}
          error={result.ok ? null : result.error}
        />
      </div>
    </div>
  );
}
