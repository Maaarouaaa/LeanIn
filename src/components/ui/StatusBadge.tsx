import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BadgeTone = "neutral" | "burgundy" | "success" | "warning";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-blush text-ink-muted border-border",
  burgundy: "bg-burgundy-soft text-burgundy border-burgundy/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-danger-soft text-danger border-danger/20",
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
