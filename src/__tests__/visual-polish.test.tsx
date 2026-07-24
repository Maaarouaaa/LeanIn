/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { flowStepFromPathname } from "@/components/ui/FlowProgress";
import { ViewCircleLink } from "@/components/circles/ViewCircleLink";
import { LeaderProfile } from "@/components/ui/People";
import { EditorialHero } from "@/components/ui/EditorialHero";
import { EditorialImageFrame } from "@/components/ui/EditorialImageFrame";
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

  it("renders an arrow-only action with an accessible View label", () => {
    render(
      <div className="relative">
        <ViewCircleLink slug="bay-area-leadership-lab" name="Leadership Lab" />
      </div>,
    );
    const link = screen.getByRole("link", { name: "View Leadership Lab" });
    expect(link).toHaveAttribute("href", "/circles/bay-area-leadership-lab");
    expect(link.textContent?.trim()).toBe("");
    expect(link.textContent).not.toMatch(/View Circle|Door|→/);
    expect(link.querySelector("svg")).not.toBeNull();
    expect(link.className).toMatch(/top-5/);
    expect(link.className).toMatch(/h-11/);
  });
});

describe("EditorialHero split", () => {
  afterEach(() => cleanup());

  it("uses a normal two-column split without decorative yellow overlays", () => {
    const { container } = render(
      <EditorialHero
        tone="split"
        title="Find your people."
        imageSrc="/assets/heroes/hero-match.jpg"
        imageAlt="Community gathering"
        badge="About 3 minutes"
      />,
    );

    const hero = container.querySelector(
      '[data-editorial-hero="split"]',
    ) as HTMLElement | null;
    expect(hero).not.toBeNull();
    expect(
      container.querySelector("[data-hero-yellow-overlap]"),
    ).toBeNull();
    expect(
      container.querySelector("[data-editorial-image='hero']"),
    ).not.toBeNull();
    expect(screen.getByText("About 3 minutes")).toBeInTheDocument();
  });
});

describe("EditorialImageFrame", () => {
  afterEach(() => cleanup());

  it("provides a relative aspect-ratio box with inline border-radius", () => {
    const { container } = render(
      <EditorialImageFrame variant="card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Card" src="/assets/circles/leadership-lab.jpg" />
      </EditorialImageFrame>,
    );
    const frame = container.querySelector(
      "[data-editorial-image='card']",
    ) as HTMLElement | null;
    expect(frame).not.toBeNull();
    expect(frame?.className).toMatch(/relative/);
    expect(frame?.style.aspectRatio).toMatch(/4/);
    expect(frame?.style.borderRadius).toContain("%");
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
