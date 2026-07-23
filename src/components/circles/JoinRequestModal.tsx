"use client";

import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { StatusBanner } from "@/components/ui/People";
import { useToast } from "@/components/ui/Toast";
import { MAX_NOTE_LENGTH } from "@/lib/constants";
import type { Circle, JoinRequest } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface JoinRequestModalProps {
  circle: Circle;
  open: boolean;
  onClose: () => void;
  onSuccess: (request: JoinRequest) => void;
}

export function JoinRequestModal({
  circle,
  open,
  onClose,
  onSuccess,
}: JoinRequestModalProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [note, setNote] = useState("");
  const [privacyAck, setPrivacyAck] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (note.length > MAX_NOTE_LENGTH) {
      setError(`Notes must be ${MAX_NOTE_LENGTH} characters or fewer.`);
      return;
    }

    startTransition(async () => {
      const response = await fetch(
        `/api/circles/${circle.slug}/join-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note }),
        },
      );

      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: string;
        status?: JoinRequest["status"];
        createdAt?: string;
        updatedAt?: string;
        memberId?: string;
        circleId?: string;
      };

      if (!response.ok) {
        const message = payload.error ?? "Unable to submit your join request.";
        setError(message);
        pushToast(message, "error");
        return;
      }

      const request: JoinRequest = {
        id: payload.id!,
        profileId: payload.memberId ?? "",
        circleId: payload.circleId ?? circle.id,
        note: note.trim() ? note.trim() : null,
        status: payload.status ?? "pending",
        createdAt: payload.createdAt ?? new Date().toISOString(),
        updatedAt: payload.updatedAt ?? new Date().toISOString(),
      };

      pushToast("Your request was sent to the Circle leader.", "success");
      onSuccess(request);
      setNote("");
      onClose();
      router.refresh();
    });
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isPending) onClose();
      }}
      title={circle.name}
      footer={
        <div className="space-y-3">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="join-request-form"
              loading={isPending}
              loadingLabel="Sending…"
              className="w-full sm:w-auto"
            >
              Send request →
            </Button>
          </div>
          <p className="text-xs text-ink-muted">
            Your request will be saved and can be reviewed later.
          </p>
        </div>
      }
    >
      <form id="join-request-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-md text-sm text-ink-soft">
            Share what drew you to the Circle or what you hope to learn. A short
            note helps {circle.leader.name} understand whether this community is
            the right fit for you.
          </p>
          <div className="shrink-0 border border-ink bg-yellow px-4 py-3 text-ink">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
              Next meeting
            </p>
            <p className="mt-1 font-display text-2xl leading-none">
              {circle.nextMeeting}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="join-note" className="text-sm font-bold text-ink">
              Include a short note to {circle.leader.name.split(" ")[0]}
            </label>
            <span className="font-editorial text-xs italic text-ink-muted">
              Optional
            </span>
          </div>
          <TextArea
            id="join-note"
            name="note"
            placeholder="Hi Maya, I'm growing into a broader team leadership role and would value a thoughtful peer group for navigating influence and change."
            value={note}
            disabled={isPending}
            maxLength={MAX_NOTE_LENGTH}
            onChange={(event) => setNote(event.target.value)}
          />
          <p className="text-right text-xs text-ink-muted">
            {note.length} / {MAX_NOTE_LENGTH}
          </p>
        </div>

        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--ink)]"
            checked={privacyAck}
            onChange={(event) => setPrivacyAck(event.target.checked)}
          />
          <span>Your note is visible only to the Circle leader.</span>
        </label>

        {error ? (
          <StatusBanner tone="error" title="Request could not be sent">
            {error}
          </StatusBanner>
        ) : null}
      </form>
    </Modal>
  );
}
