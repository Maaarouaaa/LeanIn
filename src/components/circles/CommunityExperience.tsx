"use client";

import { CircleFilters } from "@/components/circles/CircleFilters";
import { StandardCircleCard } from "@/components/circles/MatchCards";
import { Button } from "@/components/ui/Button";
import {
  filterCircles,
  isCircleFilterValue,
  type CircleFilterValue,
} from "@/lib/circle-filters";
import type { Circle, MemberPreferences } from "@/lib/types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface CommunityExperienceProps {
  circles: Circle[];
  scoresById: Record<string, number>;
  preferences: MemberPreferences | null;
  error?: string | null;
}

export function CommunityExperience({
  circles,
  scoresById,
  preferences,
  error,
}: CommunityExperienceProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawFilter = searchParams.get("filter") ?? "all";
  const filter: CircleFilterValue = isCircleFilterValue(rawFilter)
    ? rawFilter
    : "all";

  const filtered = useMemo(
    () => filterCircles(circles, filter),
    [circles, filter],
  );

  function setFilter(next: CircleFilterValue) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") {
      params.delete("filter");
    } else {
      params.set("filter", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  if (error) {
    return (
      <div
        className="border border-error bg-error-soft px-6 py-10 text-error"
        role="alert"
      >
        <h2 className="type-section">Unable to load Circles</h2>
        <p className="mt-2 type-meta">{error}</p>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => router.refresh()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const announcement =
    filtered.length === 0
      ? "No Circles match this filter."
      : `Showing ${filtered.length} of ${circles.length} Circles.`;

  return (
    <div className="space-y-8">
      <CircleFilters value={filter} onChange={setFilter} />
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      {filtered.length === 0 ? (
        <div className="border border-ink bg-surface px-6 py-12 text-center">
          <h2 className="type-section text-ink">No Circles for this filter</h2>
          <p className="mx-auto mt-3 max-w-lg type-body text-ink-muted">
            Try another filter to explore more of the community.
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={() => setFilter("all")}>
              Clear filter
            </Button>
          </div>
        </div>
      ) : (
        <ul className="grid list-none gap-5 p-0 lg:grid-cols-2">
          {filtered.map((circle, index) => (
            <li key={circle.id}>
              <StandardCircleCard
                circle={circle}
                tone={index % 2 === 0 ? "lavender" : "lime"}
                score={
                  preferences ? scoresById[circle.id] : undefined
                }
                detail={circle.description}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
