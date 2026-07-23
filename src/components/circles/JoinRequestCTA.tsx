"use client";

import { JoinRequestModal } from "@/components/circles/JoinRequestModal";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Circle, JoinRequest } from "@/lib/types";
import { useState } from "react";

interface JoinRequestCTAProps {
  circle: Circle;
  initialRequest: JoinRequest | null;
}

export function JoinRequestCTA({
  circle,
  initialRequest,
}: JoinRequestCTAProps) {
  const [request, setRequest] = useState<JoinRequest | null>(initialRequest);
  const [open, setOpen] = useState(false);

  const isPending = request?.status === "pending";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {isPending ? (
          <Button disabled className="w-full sm:w-auto">
            Request pending
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            Request to join
          </Button>
        )}
        {isPending ? (
          <StatusBadge tone="success">Awaiting Circle leader review</StatusBadge>
        ) : null}
      </div>

      {isPending ? (
        <div
          className="rounded-lg border border-success/20 bg-success-soft px-4 py-4 text-sm text-success animate-fade-in"
          role="status"
        >
          <p className="font-medium">Your request has been sent.</p>
          <p className="mt-1 text-success/90">
            Next steps: {circle.leader.name} will review your request. You can
            continue exploring other Circles meanwhile—duplicate requests for
            this Circle are blocked.
          </p>
        </div>
      ) : null}

      <JoinRequestModal
        circle={circle}
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={setRequest}
      />
    </div>
  );
}
