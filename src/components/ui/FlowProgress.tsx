"use client";

import { cn } from "@/lib/cn";

const STEPS = [
  { id: 1, label: "Preferences" },
  { id: 2, label: "Matches" },
  { id: 3, label: "Request" },
] as const;

export type FlowStep = 1 | 2 | 3;

export function flowStepFromPathname(pathname: string): FlowStep | null {
  if (pathname === "/match" || pathname.startsWith("/match/")) return 1;
  if (pathname === "/matches" || pathname.startsWith("/matches/")) return 2;
  if (pathname.startsWith("/circles/")) return 3;
  return null;
}

export function FlowProgress({
  currentStep,
  className,
}: {
  currentStep: FlowStep;
  className?: string;
}) {
  return (
    <nav
      aria-label="Circle Match progress"
      className={cn(
        "flex h-12 w-[35rem] max-w-[calc(100vw-2rem)] items-center rounded-full border border-ink bg-surface px-3 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <ol className="grid w-full grid-cols-3 items-center gap-1">
        {STEPS.map((step, index) => {
          const complete = step.id < currentStep;
          const current = step.id === currentStep;
          return (
            <li key={step.id} className="flex min-w-0 items-center justify-center gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink text-xs font-bold",
                    complete && "bg-yellow text-ink",
                    current && "bg-ink text-white",
                    !complete && !current && "bg-surface text-ink",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {complete ? <span aria-hidden="true">✓</span> : step.id}
                </span>
                <span
                  className={cn(
                    "truncate type-meta",
                    current ? "font-semibold text-ink" : "font-medium text-ink-muted",
                  )}
                >
                  {step.label}
                </span>
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className="sr-only"
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        Step {currentStep} of {STEPS.length}
      </p>
    </nav>
  );
}
