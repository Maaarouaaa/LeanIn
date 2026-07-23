"use client";

import { CircleCard } from "@/components/circles/CircleCard";
import { Button } from "@/components/ui/Button";
import type { CircleMatch, MemberPreferences } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

interface MatchesExperienceProps {
  matches: CircleMatch[];
  allMatches: CircleMatch[];
  preferences: MemberPreferences | null;
}

export function MatchesExperience({
  matches,
  allMatches,
  preferences,
}: MatchesExperienceProps) {
  const [formatFilter, setFormatFilter] = useState<string>("all");
  const [showMore, setShowMore] = useState(false);

  const filtered = useMemo(() => {
    const source = showMore ? allMatches : matches;
    if (formatFilter === "all") return source;
    return source.filter((match) => match.circle.format === formatFilter);
  }, [allMatches, formatFilter, matches, showMore]);

  if (!preferences) {
    return (
      <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
        <h2 className="font-serif text-3xl text-ink">Start with your preferences</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-muted">
          Circle Match needs a few details about the support you want before it
          can recommend Circles.
        </p>
        <Link href="/match" className="mt-6 inline-block">
          <Button>Begin Circle Match</Button>
        </Link>
      </div>
    );
  }

  if (!filtered.length) {
    return (
      <div className="space-y-6">
        <FilterBar
          formatFilter={formatFilter}
          setFormatFilter={setFormatFilter}
        />
        <div className="rounded-xl border border-border bg-surface px-6 py-10 text-center">
          <h2 className="font-serif text-3xl text-ink">No Circles for this filter</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Try another format, or edit your preferences to widen the match.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => setFormatFilter("all")}>
              Clear filter
            </Button>
            <Link href="/match">
              <Button>Edit preferences</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [featured, ...rest] = filtered;

  return (
    <div className="space-y-8">
      <FilterBar formatFilter={formatFilter} setFormatFilter={setFormatFilter} />

      <div className="space-y-6">
        {featured ? <CircleCard match={featured} featured /> : null}
        <div className="grid gap-6 lg:grid-cols-2">
          {rest.map((match) => (
            <CircleCard key={match.circle.id} match={match} />
          ))}
        </div>
      </div>

      {!showMore && allMatches.length > matches.length ? (
        <div className="text-center">
          <Button variant="secondary" onClick={() => setShowMore(true)}>
            Show additional Circles
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FilterBar({
  formatFilter,
  setFormatFilter,
}: {
  formatFilter: string;
  setFormatFilter: (value: string) => void;
}) {
  const options = [
    { value: "all", label: "All formats" },
    { value: "virtual", label: "Virtual" },
    { value: "in-person", label: "In person" },
    { value: "hybrid", label: "Hybrid" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by format">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setFormatFilter(option.value)}
            className={
              formatFilter === option.value
                ? "min-h-10 rounded-full border border-burgundy bg-burgundy-soft px-4 text-sm text-burgundy"
                : "min-h-10 rounded-full border border-border-strong bg-surface px-4 text-sm text-ink-muted hover:border-burgundy/40"
            }
            aria-pressed={formatFilter === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Link
        href="/match"
        className="text-sm font-medium text-burgundy underline-offset-4 hover:underline"
      >
        Edit preferences
      </Link>
    </div>
  );
}
