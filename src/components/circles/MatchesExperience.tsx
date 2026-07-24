"use client";

import {
  FeaturedMatchCard,
  SecondaryMatchCard,
} from "@/components/circles/MatchCards";
import { CircleFilters } from "@/components/circles/CircleFilters";
import { Button } from "@/components/ui/Button";
import {
  matchesCircleFilter,
  type CircleFilterValue,
} from "@/lib/circle-filters";
import type { CircleMatch, MemberPreferences } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface MatchesExperienceProps {
  matches: CircleMatch[];
  allMatches?: CircleMatch[];
  preferences: MemberPreferences | null;
  error?: string | null;
  submissionId?: string | null;
}

export function MatchesExperience({
  matches,
  allMatches,
  preferences,
  error,
  submissionId,
}: MatchesExperienceProps) {
  const [filter, setFilter] = useState<CircleFilterValue>("all");

  useEffect(() => {
    console.log("[circle-match] MatchesExperience render", {
      submissionId: submissionId ?? null,
      matchCount: matches.length,
      allMatchCount: allMatches?.length ?? 0,
      hasPreferences: Boolean(preferences),
      hasError: Boolean(error),
    });
  }, [allMatches?.length, error, matches.length, preferences, submissionId]);

  const filtered = useMemo(() => {
    const pool = allMatches?.length ? allMatches : matches;
    return pool
      .filter((match) => matchesCircleFilter(match.circle, filter))
      .slice(0, 3);
  }, [allMatches, filter, matches]);

  if (!preferences && !error) {
    return (
      <div className="border border-ink bg-surface px-6 py-12 text-center">
        <h2 className="type-section text-ink">Start with preferences</h2>
        <p className="mx-auto mt-3 max-w-lg type-body text-ink-muted">
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
      <div
        className="border border-error bg-error-soft px-6 py-10 text-error"
        role="alert"
      >
        <h2 className="type-section">Unable to load matches</h2>
        <p className="mt-2 type-meta">{error}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={
              submissionId
                ? `/matches?sid=${encodeURIComponent(submissionId)}`
                : "/matches"
            }
          >
            <Button variant="secondary">Retry</Button>
          </Link>
          <Link href="/match">
            <Button>Edit preferences</Button>
          </Link>
        </div>
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
        <CircleFilters
          value={filter}
          onChange={setFilter}
          allLabel="All three"
        />
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        <div className="border border-ink bg-surface px-6 py-12 text-center">
          <h2 className="type-section text-ink">No Circles for this filter</h2>
          <p className="mx-auto mt-3 max-w-lg type-body text-ink-muted">
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
      <CircleFilters value={filter} onChange={setFilter} allLabel="All three" />
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
