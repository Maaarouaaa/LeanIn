"use client";

import { JoinRequestModal } from "@/components/circles/JoinRequestModal";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/People";
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
            Request sent
          </Button>
        ) : (
          <Button className="w-full sm:w-auto" onClick={() => setOpen(true)}>
            Request to join →
          </Button>
        )}
      </div>

      {isPending ? (
        <StatusBanner tone="success" title="Your request has been sent.">
          <p>
            Next steps: {circle.leader.name} will review your request. Duplicate
            requests for this Circle are blocked.
          </p>
        </StatusBanner>
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
