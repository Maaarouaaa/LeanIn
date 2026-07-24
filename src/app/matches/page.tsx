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

export default async function MatchesPage({
  searchParams,
}: {
  searchParams?: Promise<{ sid?: string | string[] }>;
}) {
  const params = searchParams ? await searchParams : undefined;
  const sidParam = params?.sid;
  const submissionId = Array.isArray(sidParam) ? sidParam[0] : sidParam;

  console.info("[circle-match] matches.page loader start", {
    submissionId: submissionId ?? null,
  });

  const result = await getRankedMatches(undefined, submissionId);

  console.info("[circle-match] matches.page loader end", {
    submissionId: submissionId ?? null,
    ok: result.ok,
    matchCount: result.ok ? result.data.matches.length : 0,
    error: result.ok ? null : result.error,
  });

  if (!result.ok) {
    // Surface ranking failures explicitly — do not swallow into an empty UI.
    console.error("[circle-match] matches.page ranking failed", {
      submissionId: submissionId ?? null,
      error: result.error,
    });
  }

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
          submissionId={submissionId ?? null}
        />
      </div>
    </div>
  );
}
