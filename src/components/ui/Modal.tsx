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
  const overlayRef = useRef<HTMLDivElement>(null);
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
      // Prefer an already-focused control (e.g. JoinRequestModal textarea).
      // Otherwise move focus into the dialog once when it opens.
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
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-ink/60 p-4 sm:p-8 animate-fade-in"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCloseRef.current();
        }
      }}
    >
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          className={cn(
            "relative flex w-full max-w-3xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-t-3xl border border-ink bg-[linear-gradient(180deg,#efe8f8_0%,#ffffff_42%)] shadow-[var(--shadow-soft)] animate-scale-in overscroll-contain sm:rounded-3xl",
            "max-sm:min-h-[min(100%,calc(100dvh-2rem))]",
            className,
          )}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ink/15 px-5 py-5 sm:px-7">
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

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7">
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-ink/15 px-5 py-4 sm:px-7">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
