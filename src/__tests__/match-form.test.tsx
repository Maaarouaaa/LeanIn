/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
const pushToast = vi.fn();
const saveMemberPreferences = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ pushToast }),
}));

vi.mock("@/lib/actions/circle-match", () => ({
  saveMemberPreferences: (...args: unknown[]) => saveMemberPreferences(...args),
}));

import { MatchForm } from "@/components/match/MatchForm";

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("checkbox", { name: /Growing as a leader/i }),
  );
  await user.selectOptions(screen.getByLabelText(/Career stage/i), "mid-career");
  await user.selectOptions(screen.getByLabelText(/Meeting frequency/i), "monthly");
  await user.clear(screen.getByLabelText(/^Location/i));
  await user.type(screen.getByLabelText(/^Location/i), "Oakland, CA");
  await user.click(screen.getByRole("radio", { name: /^In person$/i }));
}

describe("MatchForm submission", () => {
  beforeEach(() => {
    push.mockReset();
    pushToast.mockReset();
    saveMemberPreferences.mockReset();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("does not call the server action or start loading when invalid", async () => {
    const user = userEvent.setup();
    render(<MatchForm />);

    const submit = await screen.findByRole("button", { name: /Find my Circles/i });
    expect(submit).toHaveAttribute("type", "submit");
    await waitFor(() => expect(submit).toBeEnabled());

    await user.click(submit);

    expect(console.log).toHaveBeenCalledWith(
      "[circle-match] MatchForm onSubmit fired",
    );
    expect(saveMemberPreferences).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Find my Circles/i })).not.toHaveAttribute(
      "aria-busy",
    );
    expect(
      screen.getByText(/Select at least one support goal/i),
    ).toBeInTheDocument();
  });

  it("calls saveMemberPreferences on valid submit and navigates", async () => {
    const user = userEvent.setup();
    saveMemberPreferences.mockResolvedValue({
      ok: true,
      data: { profile: { id: "1" }, mode: "supabase" },
    });

    render(<MatchForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Find my Circles/i })).toBeEnabled(),
    );
    await fillValidForm(user);

    await user.click(screen.getByRole("button", { name: /Find my Circles/i }));

    expect(console.log).toHaveBeenCalledWith(
      "[circle-match] MatchForm onSubmit fired",
    );

    await waitFor(() => {
      expect(saveMemberPreferences).toHaveBeenCalledTimes(1);
    });

    expect(saveMemberPreferences).toHaveBeenCalledWith(
      expect.objectContaining({
        goals: ["growing-as-a-leader"],
        careerStage: "mid-career",
        format: "in-person",
        frequency: "monthly",
        location: "Oakland, CA",
      }),
    );

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/matches");
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Find my Circles/i }),
      ).not.toHaveAttribute("aria-busy");
    });
  });

  it("shows an accessible error and resets loading when the server fails", async () => {
    const user = userEvent.setup();
    saveMemberPreferences.mockResolvedValue({
      ok: false,
      error: "Unable to save preferences. Please try again.",
    });

    render(<MatchForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Find my Circles/i })).toBeEnabled(),
    );
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /Find my Circles/i }));

    await waitFor(() => {
      expect(
        screen.getByRole("alert"),
      ).toHaveTextContent(/Unable to save preferences/i);
    });

    expect(push).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /Find my Circles/i }),
    ).not.toHaveAttribute("aria-busy");
  });

  it("shows a timeout error if the action does not settle within 10 seconds", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });

    saveMemberPreferences.mockImplementation(
      () => new Promise(() => {}),
    );

    render(<MatchForm />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Find my Circles/i })).toBeEnabled(),
    );
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /Find my Circles/i }));

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/timed out/i);
    });

    expect(push).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("keeps the submit button inside the form with type=submit and no loading onClick", async () => {
    const { container } = render(<MatchForm />);
    const form = container.querySelector("form");
    const submit = screen.getByRole("button", { name: /Find my Circles/i });
    expect(form).toContainElement(submit);
    expect(submit).toHaveAttribute("type", "submit");
    expect(submit.onclick).toBeNull();
    await waitFor(() => expect(submit).toBeEnabled());
  });
});
