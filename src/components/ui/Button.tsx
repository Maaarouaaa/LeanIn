import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "yellow" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink/90 disabled:bg-ink/40 disabled:text-white/70",
  secondary:
    "bg-surface text-ink border border-ink hover:bg-paper disabled:opacity-45",
  yellow:
    "bg-yellow text-ink border border-ink hover:bg-yellow-deep disabled:opacity-45",
  ghost: "bg-transparent text-ink hover:underline disabled:opacity-45",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Please wait…",
  className,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 text-center rounded-full font-semibold transition-colors motion-safe-transition disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={Boolean(disabled || loading)}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        />
      ) : null}
      <span className="text-center leading-none">
        {loading ? loadingLabel : children}
      </span>
    </button>
  );
}
