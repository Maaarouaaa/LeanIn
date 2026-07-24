"use client";

import { JoinRequestModal } from "@/components/circles/JoinRequestModal";
import { Button } from "@/components/ui/Button";
import { StatusBanner } from "@/components/ui/People";
import type { Circle, JoinRequest } from "@/lib/types";
import { useCallback, useState } from "react";

interface JoinRequestCTAProps {
  circle: Circle;
  initialRequest: JoinRequest | null;
  /** Stretch the primary button across the meeting rail. */
  fullWidth?: boolean;
}

function requestLabel(status: JoinRequest["status"]): string {
  if (status === "approved") return "Request approved";
  if (status === "declined") return "Request declined";
  return "Request sent";
}

export function JoinRequestCTA({
  circle,
  initialRequest,
  fullWidth = false,
}: JoinRequestCTAProps) {
  const [request, setRequest] = useState<JoinRequest | null>(initialRequest);
  const [open, setOpen] = useState(false);
  const hasRequest = Boolean(request);
  const isPending = request?.status === "pending";

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleSuccess = useCallback((next: JoinRequest) => {
    setRequest(next);
  }, []);

  return (
    <div className="space-y-3">
      <div
        className={
          fullWidth ? "w-full" : "flex flex-col gap-3 sm:flex-row sm:items-center"
        }
      >
        {hasRequest && request ? (
          <Button
            disabled
            variant="secondary"
            className={fullWidth ? "w-full" : "w-full sm:w-auto"}
          >
            {requestLabel(request.status)}
          </Button>
        ) : (
          <Button
            variant="yellow"
            className={fullWidth ? "w-full" : "w-full sm:w-auto"}
            onClick={() => setOpen(true)}
          >
            Request to join
          </Button>
        )}
      </div>

      {isPending ? (
        <StatusBanner
          tone="success"
          title="Your request is with the Circle leader."
        >
          <p>
            {circle.leader.name} reviews new requests for this Circle. You’ll
            hear back once she responds.
          </p>
        </StatusBanner>
      ) : null}

      {request?.status === "approved" ? (
        <StatusBanner tone="success" title="You’re in this Circle.">
          <p>Your join request was approved.</p>
        </StatusBanner>
      ) : null}

      {request?.status === "declined" ? (
        <StatusBanner
          tone="error"
          title="This request was declined."
        >
          <p>
            You already have a request on file for this Circle. Choose another
            Circle to continue.
          </p>
        </StatusBanner>
      ) : null}

      <JoinRequestModal
        key={circle.id}
        circle={circle}
        open={open}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
