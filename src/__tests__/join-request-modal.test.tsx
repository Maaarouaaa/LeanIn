/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SEED_CIRCLES } from "@/lib/data/seed";
import { MAX_NOTE_LENGTH } from "@/lib/constants";

const refresh = vi.fn();
const pushToast = vi.fn();
const fetchMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh }),
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => ({ pushToast }),
}));

import { JoinRequestCTA } from "@/components/circles/JoinRequestCTA";

const circle = SEED_CIRCLES[0]!;

describe("Join request modal", () => {
  beforeEach(() => {
    refresh.mockReset();
    pushToast.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
    vi.unstubAllGlobals();
  });

  async function openModal(user: ReturnType<typeof userEvent.setup>) {
    render(<JoinRequestCTA circle={circle} initialRequest={null} />);
    const trigger = screen.getByRole("button", { name: /Request to join/i });
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    return { trigger, dialog };
  }

  it("keeps textarea focus while typing a full sentence and updates the counter", async () => {
    const user = userEvent.setup();
    await openModal(user);

    const textarea = screen.getByRole("textbox", {
      name: /Include a short note/i,
    });
    const sentence =
      "I am looking for peer coaching on influence and executive presence.";

    await user.clear(textarea);
    await user.type(textarea, sentence);

    expect(textarea).toHaveFocus();
    expect(textarea).toHaveValue(sentence);
    expect(
      screen.getByText(`${sentence.length} / ${MAX_NOTE_LENGTH}`),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("locks background scrolling while open and restores it on close", async () => {
    const user = userEvent.setup();
    document.body.style.overflow = "auto";

    const { trigger, dialog } = await openModal(user);
    expect(document.body.style.overflow).toBe("hidden");

    expect(dialog.className).toMatch(/max-h-\[calc\(100dvh-2rem\)\]/);
    expect(dialog.className).toMatch(/overflow-y-auto/);
    expect(dialog.className).toMatch(/overscroll-contain/);
    expect(dialog.className).toMatch(/touch-pan-y/);

    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(document.body.style.overflow).toBe("auto");
    expect(trigger).toHaveFocus();
  });

  it("submits only when Send request is clicked", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "req-1",
        status: "pending",
        memberId: "member-1",
        circleId: circle.id,
        createdAt: "2026-07-24T00:00:00.000Z",
        updatedAt: "2026-07-24T00:00:00.000Z",
      }),
    });

    await openModal(user);
    const textarea = screen.getByRole("textbox", {
      name: /Include a short note/i,
    });
    await user.type(textarea, "Ready to join this Circle.");
    expect(fetchMock).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /Send request/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock).toHaveBeenCalledWith(
      `/api/circles/${circle.slug}/join-requests`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ note: "Ready to join this Circle." }),
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole("button", { name: /Request sent/i }),
    ).toBeDisabled();
    expect(refresh).toHaveBeenCalled();
  });

  it("announces submission errors with a live region", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ error: "Unable to submit your join request." }),
    });

    await openModal(user);
    await user.click(screen.getByRole("button", { name: /Send request/i }));

    const dialog = await screen.findByRole("dialog");
    await waitFor(() => {
      expect(
        within(dialog).getByText(/Unable to submit your join request/i),
      ).toBeInTheDocument();
    });
    expect(dialog.querySelector("[aria-live='polite']")).not.toBeNull();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
