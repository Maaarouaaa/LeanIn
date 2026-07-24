import { cn } from "@/lib/cn";
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

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
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
          {!optional ? <span className="text-error"> *</span> : null}
        </label>
        {optional ? (
          <span className="type-meta italic text-ink-muted">
            Optional
          </span>
        ) : null}
      </div>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "min-h-12 w-full border border-ink bg-surface px-3.5 text-sm text-ink placeholder:text-ink-muted";

export function TextInput({
  className,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      className={cn(controlClass, error && "border-error bg-error-soft", className)}
      {...props}
    />
  );
}

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(function TextArea({ className, error, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-32 w-full resize-y border border-ink bg-surface px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted",
        error && "border-error bg-error-soft",
        className,
      )}
      {...props}
    />
  );
});

export function SelectInput({
  className,
  error,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  return (
    <select
      className={cn(
        controlClass,
        "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22><path fill=%22%23171717%22 d=%22M6 8 0 0h12z%22/></svg>')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-10",
        error && "border-error bg-error-soft",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
