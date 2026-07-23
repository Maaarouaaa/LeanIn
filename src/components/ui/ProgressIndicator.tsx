import { cn } from "@/lib/cn";

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  className,
}: ProgressIndicatorProps) {
  return (
    <nav aria-label="Form progress" className={cn("w-full", className)}>
      <ol className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-3 sm:flex-1",
                index < steps.length - 1 && "sm:pr-3",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    isComplete && "border-burgundy bg-burgundy text-white",
                    isCurrent && "border-burgundy bg-burgundy-soft text-burgundy",
                    !isComplete &&
                      !isCurrent &&
                      "border-border-strong bg-surface text-ink-subtle",
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isComplete ? (
                    <span aria-hidden="true">✓</span>
                  ) : (
                    stepNumber
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    isCurrent ? "font-medium text-ink" : "text-ink-muted",
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className={cn(
                    "ml-auto hidden h-px flex-1 sm:block",
                    isComplete ? "bg-burgundy/40" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        Step {currentStep} of {steps.length}
      </p>
    </nav>
  );
}
