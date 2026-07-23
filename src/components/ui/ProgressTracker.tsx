import { cn } from "@/lib/cn";

const STEPS = [
  { id: 1, label: "Preferences" },
  { id: 2, label: "Matches" },
  { id: 3, label: "Request" },
] as const;

export function ProgressTracker({
  currentStep,
  className,
}: {
  currentStep: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <nav
      aria-label="Circle Match progress"
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-ink bg-surface px-3 py-2 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <ol className="flex items-center gap-3">
        {STEPS.map((step, index) => {
          const complete = step.id < currentStep;
          const current = step.id === currentStep;
          return (
            <li key={step.id} className="flex items-center gap-3">
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full border border-ink text-xs font-bold",
                    complete && "bg-yellow text-ink",
                    current && "bg-ink text-white",
                    !complete && !current && "bg-surface text-ink",
                  )}
                  aria-current={current ? "step" : undefined}
                >
                  {complete ? (
                    <span aria-hidden="true">✓</span>
                  ) : (
                    step.id
                  )}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.14em]",
                    current ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {step.label}
                </span>
              </span>
              {index < STEPS.length - 1 ? (
                <span
                  className="hidden h-px w-4 bg-ink/30 sm:block"
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
