/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { flowStepFromPathname } from "@/components/ui/FlowProgress";
import { ViewCircleLink } from "@/components/circles/ViewCircleLink";
import { LeaderProfile } from "@/components/ui/People";
import { SEED_CIRCLES } from "@/lib/data/seed";

vi.mock("next/image", () => ({
  default: (props: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt} />
  ),
}));

describe("flowStepFromPathname", () => {
  it("maps Circle Match routes to stable steps", () => {
    expect(flowStepFromPathname("/match")).toBe(1);
    expect(flowStepFromPathname("/matches")).toBe(2);
    expect(flowStepFromPathname("/circles/bay-area-leadership-lab")).toBe(3);
    expect(flowStepFromPathname("/")).toBeNull();
  });
});

describe("ViewCircleLink", () => {
  afterEach(() => cleanup());

  it("renders View with a door icon and no arrow copy", () => {
    render(
      <ViewCircleLink slug="bay-area-leadership-lab" name="Leadership Lab" />,
    );
    const link = screen.getByRole("link", { name: "View Leadership Lab" });
    expect(link).toHaveAttribute("href", "/circles/bay-area-leadership-lab");
    expect(link.textContent).not.toMatch(/Circle →|→/);
    expect(link.querySelector("svg")).not.toBeNull();
  });
});

describe("LeaderProfile", () => {
  afterEach(() => cleanup());

  it("does not render leader quotes publicly", () => {
    const circle = SEED_CIRCLES[0]!;
    render(<LeaderProfile leader={circle.leader} circle={circle} />);
    expect(screen.queryByText(/hard conversation/i)).not.toBeInTheDocument();
    expect(screen.getByText(circle.leader.name)).toBeInTheDocument();
    expect(screen.getByText(circle.leader.title)).toBeInTheDocument();
    expect(
      screen.getByText(/influence rehearsal/i),
    ).toBeInTheDocument();
  });
});
