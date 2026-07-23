import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: FieldProps) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {optional ? (
          <span className="text-xs text-ink-subtle">Optional</span>
        ) : null}
      </div>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {/* describedBy is applied by callers via aria-describedby when needed */}
      <span className="sr-only" data-describedby={describedBy} />
    </div>
  );
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function TextInput({ className, error, ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "min-h-11 w-full rounded-md border bg-surface px-3.5 text-sm text-ink placeholder:text-ink-subtle transition-colors",
        error
          ? "border-danger"
          : "border-border-strong focus:border-burgundy",
        className,
      )}
      {...props}
    />
  );
}

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({ className, error, ...props }: TextAreaProps) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-md border bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-subtle transition-colors resize-y",
        error
          ? "border-danger"
          : "border-border-strong focus:border-burgundy",
        className,
      )}
      {...props}
    />
  );
}
