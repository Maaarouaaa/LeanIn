"use client";

import {
  FlowProgress,
  flowStepFromPathname,
} from "@/components/ui/FlowProgress";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Shared shell that places the Circle Match progress indicator in one
 * consistent viewport position for /match, /matches, and /circles/[slug].
 */
export function MatchFlowShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const step = flowStepFromPathname(pathname);

  if (!step) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="z-30 flex justify-center px-4 py-3 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-6 lg:px-0 lg:py-0">
        <FlowProgress
          currentStep={step}
          className="lg:pointer-events-auto"
        />
      </div>
      {children}
    </div>
  );
}
