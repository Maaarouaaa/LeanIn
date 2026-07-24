"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  labelledByExtra?: string;
}

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const elements = Array.from(focusable);
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose, open],
  );

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => {
      const focusTarget =
        dialogRef.current?.querySelector<HTMLElement>(
          "textarea, input, button",
        ) ?? dialogRef.current;
      focusTarget?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused.current?.focus();
    };
  }, [handleKeyDown, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-ink/45 animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-ink bg-[linear-gradient(180deg,#efe8f8_0%,#ffffff_42%)] shadow-[var(--shadow-soft)] animate-scale-in sm:rounded-3xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-ink/15 px-5 py-5 sm:px-7">
          <div className="space-y-2">
            <p className="type-eyebrow text-ink">Request to join</p>
            <h2 id={titleId} className="type-section text-ink">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="type-meta text-ink-muted">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label="Close"
            className="!min-h-10 !px-3"
          >
            ✕
          </Button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-7">{children}</div>
        {footer ? (
          <div className="border-t border-ink/15 px-5 py-4 sm:px-7">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
