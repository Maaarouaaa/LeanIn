/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  filterCircles,
  matchesCircleFilter,
  sortCommunityCircles,
} from "@/lib/circle-filters";
import { SEED_CIRCLES } from "@/lib/data/seed";
import { topRankedMatches } from "@/lib/matching";
import type { MatchFormInput } from "@/lib/types";

const push = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();
let search = "";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, refresh }),
  usePathname: () => "/community",
  useSearchParams: () => new URLSearchParams(search),
}));

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} />
  ),
}));

import { CommunityExperience } from "@/components/circles/CommunityExperience";
import { Masthead } from "@/components/layout/Masthead";

describe("circle filters", () => {
  it("includes hybrid Circles in compatible format filters", () => {
    const hybrid = SEED_CIRCLES.find((circle) => circle.format === "hybrid");
    expect(hybrid).toBeTruthy();
    expect(matchesCircleFilter(hybrid!, "virtual")).toBe(true);
    expect(matchesCircleFilter(hybrid!, "in-person")).toBe(true);
  });

  it("filters weeknights and returns the full community catalog", () => {
    const weeknights = filterCircles(SEED_CIRCLES, "weeknights");
    expect(weeknights.every((circle) => circle.meetsWeeknights)).toBe(true);
    expect(sortCommunityCircles(SEED_CIRCLES)).toHaveLength(SEED_CIRCLES.length);
  });
});

describe("matches vs community scope", () => {
  it("keeps personalized matches limited to three while community keeps all", () => {
    const preferences: MatchFormInput = {
      goals: ["growing-as-a-leader"],
      careerStage: "mid-career",
      format: "either",
      frequency: "monthly",
      location: "Oakland, CA",
      availability: "weeknights",
      includeVirtualOutsideLocation: true,
    };
    const top = topRankedMatches(preferences, SEED_CIRCLES, 3);
    expect(top).toHaveLength(3);
    expect(SEED_CIRCLES.length).toBeGreaterThan(3);

    const lowScore = SEED_CIRCLES.find(
      (circle) => !top.some((match) => match.circle.id === circle.id),
    );
    expect(lowScore).toBeTruthy();
    expect(filterCircles(SEED_CIRCLES, "all")).toContainEqual(lowScore);
  });
});

describe("CommunityExperience", () => {
  afterEach(() => {
    cleanup();
    search = "";
    replace.mockReset();
  });

  it("renders every Circle and supports filter reset", async () => {
    const user = userEvent.setup();
    render(
      <CommunityExperience
        circles={SEED_CIRCLES}
        scoresById={{}}
        preferences={null}
      />,
    );

    expect(
      screen.getAllByRole("link", { name: /^View / }).length,
    ).toBe(SEED_CIRCLES.length);

    await user.click(screen.getByRole("button", { name: "Virtual" }));
    expect(replace).toHaveBeenCalled();
  });
});

describe("Masthead community link", () => {
  afterEach(() => cleanup());

  it("routes Community to /community", () => {
    render(<Masthead dataMode="memory" />);
    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute(
      "href",
      "/community",
    );
  });
});
