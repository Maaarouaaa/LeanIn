"use client";

import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useEffect } from "react";

export default function MatchesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[circle-match] matches.error boundary", {
      message: error.message,
      digest: error.digest ?? null,
    });
  }, [error]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div
        className="border border-error bg-error-soft px-6 py-10 text-error"
        role="alert"
      >
        <h2 className="type-section">Unable to load matches</h2>
        <p className="mt-2 type-meta">
          {error.message || "Something went wrong while loading your matches."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={reset}>
            Retry
          </Button>
          <Link href="/match">
            <Button>Edit preferences</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
