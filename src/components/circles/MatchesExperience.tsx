"use client";

import {
  FeaturedMatchCard,
  SecondaryMatchCard,
} from "@/components/circles/MatchCards";
import { Button } from "@/components/ui/Button";
import { FilterPill } from "@/components/ui/SelectableControls";
import type { CircleMatch, MemberPreferences } from "@/lib/types";
import Link from "next/link";
import { useMemo, useState } from "react";

type FilterValue = "all" | "virtual" | "in-person" | "weeknights";

interface MatchesExperienceProps {
  matches: CircleMatch[];
  preferences: MemberPreferences | null;
  error?: string | null;
}

export function MatchesExperience({
  matches,
  preferences,
  error,
}: MatchesExperienceProps) {
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    return matches.filter((match) => {
      if (filter === "virtual") {
        return (
          match.circle.format === "virtual" || match.circle.format === "hybrid"
        );
      }
      if (filter === "in-person") {
        return (
          match.circle.format === "in-person" ||
          match.circle.format === "hybrid"
        );
      }
      if (filter === "weeknights") return match.circle.meetsWeeknights;
      return true;
    });
  }, [filter, matches]);

  if (!preferences) {
    return (
      <div className="border border-ink bg-surface px-6 py-12 text-center">
        <h2 className="font-display text-4xl text-ink">Start with preferences</h2>
        <p className="mx-auto mt-3 max-w-lg text-ink-muted">
          Tell us what support you need so we can rank Circles that fit.
        </p>
        <Link href="/match" className="mt-6 inline-block">
          <Button>Begin Circle Match</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-error bg-error-soft px-6 py-10 text-error" role="alert">
        <h2 className="font-display text-3xl">Unable to load matches</h2>
        <p className="mt-2 text-sm">{error}</p>
        <Link href="/matches" className="mt-6 inline-block">
          <Button variant="secondary">Retry</Button>
        </Link>
      </div>
    );
  }

  const announcement =
    filtered.length === 0
      ? "No Circles match this filter."
      : `Showing ${filtered.length} Circle${filtered.length === 1 ? "" : "s"}.`;

  if (!filtered.length) {
    return (
      <div className="space-y-6">
        <FilterBar filter={filter} setFilter={setFilter} />
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        <div className="border border-ink bg-surface px-6 py-12 text-center">
          <h2 className="font-display text-4xl text-ink">No Circles for this filter</h2>
          <p className="mx-auto mt-3 max-w-lg text-ink-muted">
            Try another filter, or edit your preferences to widen the match.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => setFilter("all")}>
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

  const [featured, second, third] = filtered;

  return (
    <div className="space-y-8">
      <FilterBar filter={filter} setFilter={setFilter} />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {featured ? <FeaturedMatchCard match={featured} /> : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {second ? (
          <SecondaryMatchCard match={second} tone="lavender" />
        ) : null}
        {third ? <SecondaryMatchCard match={third} tone="lime" /> : null}
      </div>
    </div>
  );
}

function FilterBar({
  filter,
  setFilter,
}: {
  filter: FilterValue;
  setFilter: (value: FilterValue) => void;
}) {
  const options: { value: FilterValue; label: string }[] = [
    { value: "all", label: "All three" },
    { value: "virtual", label: "Virtual" },
    { value: "in-person", label: "In person" },
    { value: "weeknights", label: "Weeknights" },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-ink pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
          Filter results
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter matches"
        >
          {options.map((option) => (
            <FilterPill
              key={option.value}
              label={option.label}
              pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-ink-muted">Ranked by your saved preferences</p>
    </div>
  );
}
