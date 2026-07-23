"use client";

import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { createJoinRequestAction } from "@/lib/actions/circle-match";
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
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await createJoinRequestAction({
        circleId: circle.id,
        note,
      });

      if (!result.ok) {
        setError(result.error);
        pushToast(result.error, "error");
        return;
      }

      pushToast("Your request was sent to the Circle leader.", "success");
      onSuccess(result.data.request);
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
      title="Request to join"
      description={`Share a short note with ${circle.leader.name}, the Circle leader for ${circle.name}.`}
      footer={
        <>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="join-request-form"
            loading={isPending}
            className="flex-1 sm:flex-none"
          >
            Send request
          </Button>
        </>
      }
    >
      <form id="join-request-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-border bg-blush/40 px-4 py-3 text-sm text-ink-muted">
          Your request will be reviewed by the Circle leader. You&apos;ll see a
          pending status here until they respond.
        </div>

        <div className="space-y-2">
          <label htmlFor="join-note" className="text-sm font-medium text-ink">
            Optional note
          </label>
          <TextArea
            id="join-note"
            name="note"
            placeholder="A sentence about why this Circle feels like a fit…"
            value={note}
            disabled={isPending}
            maxLength={500}
            onChange={(event) => setNote(event.target.value)}
          />
          <p className="text-xs text-ink-subtle">{note.length}/500</p>
        </div>

        {error ? (
          <p
            className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-sm text-danger"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
