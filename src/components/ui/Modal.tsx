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
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  const previousOverflow = useRef<string>("");
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== "Tab" || !dialogRef.current) return;

    const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    const elements = Array.from(focusable);
    if (!elements.length) return;
    const first = elements[0]!;
    const last = elements[elements.length - 1]!;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    const frame = requestAnimationFrame(() => {
      if (dialogRef.current?.contains(document.activeElement)) return;
      const focusTarget =
        dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
        dialogRef.current;
      focusTarget?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow.current;
      previouslyFocused.current?.focus?.();
    };
  }, [handleKeyDown, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-8">
      {/* Overlay stays under the dialog and does not capture wheel/touch scroll. */}
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 z-0 bg-ink/60 animate-fade-in"
        onClick={() => onCloseRef.current()}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-[calc(100%-0.5rem)] max-w-3xl max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain touch-pan-y rounded-t-3xl border border-ink bg-[linear-gradient(180deg,#efe8f8_0%,#ffffff_42%)] shadow-[var(--shadow-soft)] animate-scale-in sm:w-full sm:rounded-3xl",
          "max-sm:min-h-[min(92dvh,calc(100dvh-2rem))]",
          className,
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-ink/15 bg-[linear-gradient(180deg,#efe8f8_0%,#f7f2fb_100%)] px-5 py-5 sm:px-7">
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
            onClick={() => onCloseRef.current()}
            aria-label="Close"
            className="!min-h-10 !px-3"
          >
            ✕
          </Button>
        </div>

        <div className="px-5 py-5 sm:px-7">{children}</div>

        {footer ? (
          <div className="sticky bottom-0 z-20 border-t border-ink/15 bg-surface/95 px-5 py-4 backdrop-blur-sm sm:px-7">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
