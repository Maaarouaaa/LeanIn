"use client";

import { FilterPill } from "@/components/ui/SelectableControls";
import {
  CIRCLE_FILTER_OPTIONS,
  type CircleFilterValue,
} from "@/lib/circle-filters";

interface CircleFiltersProps {
  value: CircleFilterValue;
  onChange: (value: CircleFilterValue) => void;
  /** Optional label override, e.g. “Filter results” vs “Filter Circles”. */
  label?: string;
  allLabel?: string;
}

export function CircleFilters({
  value,
  onChange,
  label = "Filter results",
  allLabel = "All",
}: CircleFiltersProps) {
  const options = CIRCLE_FILTER_OPTIONS.map((option) =>
    option.value === "all" ? { ...option, label: allLabel } : option,
  );

  return (
    <div className="space-y-2">
      <p className="type-meta font-semibold text-ink">{label}</p>
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        role="group"
        aria-label={label}
      >
        {options.map((option) => (
          <FilterPill
            key={option.value}
            label={option.label}
            pressed={value === option.value}
            onClick={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}
