import { MatchForm } from "@/components/match/MatchForm";
import { EditorialHero } from "@/components/ui/EditorialHero";
import { ProgressTracker } from "@/components/ui/ProgressTracker";
import { getMemberPreferences } from "@/lib/actions/circle-match";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Preferences",
};

export default async function MatchPage() {
  const result = await getMemberPreferences();
  const preferences = result.ok ? result.data.preferences : null;

  return (
    <div className="page-enter">
      <EditorialHero
        tone="split"
        eyebrow="Personalized Circle matching"
        title="Find your people."
        editorial="The right room can change what feels possible."
        outlineWord="Match"
        imageSrc="/assets/heroes/hero-match.jpg"
        imageAlt="Three women smiling together at a Lean In community gathering"
        badge="About 3 minutes"
        progress={<ProgressTracker currentStep={1} />}
      />

      <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
        {!result.ok ? (
          <p
            className="mb-6 border border-error bg-error-soft px-4 py-3 text-sm text-error"
            role="alert"
          >
            {result.error}
          </p>
        ) : null}
        <MatchForm initialPreferences={preferences} />
      </div>
    </div>
  );
}
