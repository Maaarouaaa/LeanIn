import type { Circle } from "@/lib/types";

export type CircleFilterValue = "all" | "virtual" | "in-person" | "weeknights";

export const CIRCLE_FILTER_OPTIONS: {
  value: CircleFilterValue;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "virtual", label: "Virtual" },
  { value: "in-person", label: "In person" },
  { value: "weeknights", label: "Weeknights" },
];

export function isCircleFilterValue(value: string): value is CircleFilterValue {
  return CIRCLE_FILTER_OPTIONS.some((option) => option.value === value);
}

export function matchesCircleFilter(
  circle: Pick<Circle, "format" | "meetsWeeknights">,
  filter: CircleFilterValue,
): boolean {
  if (filter === "virtual") {
    return circle.format === "virtual" || circle.format === "hybrid";
  }
  if (filter === "in-person") {
    return circle.format === "in-person" || circle.format === "hybrid";
  }
  if (filter === "weeknights") {
    return circle.meetsWeeknights;
  }
  return true;
}

export function filterCircles<T extends Pick<Circle, "format" | "meetsWeeknights">>(
  items: T[],
  filter: CircleFilterValue,
): T[] {
  return items.filter((item) => matchesCircleFilter(item, filter));
}

/** Stable community catalog order: soonest meeting label, then name. */
export function sortCommunityCircles(circles: Circle[]): Circle[] {
  return [...circles].sort((a, b) => {
    const meeting = a.nextMeeting.localeCompare(b.nextMeeting);
    if (meeting !== 0) return meeting;
    return a.name.localeCompare(b.name);
  });
}
