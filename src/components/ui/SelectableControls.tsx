"use client";

import { cn } from "@/lib/cn";

const ACCENTS = ["bg-yellow", "bg-lime", "bg-magenta text-white", "bg-lavender"] as const;

interface GoalCardProps {
  label: string;
  selected: boolean;
  disabled?: boolean;
  accentIndex: number;
  onToggle: () => void;
}

export function GoalCard({
  label,
  selected,
  disabled,
  accentIndex,
  onToggle,
}: GoalCardProps) {
  return (
    <label
      className={cn(
        "relative flex min-h-[5.5rem] cursor-pointer items-center justify-center border border-ink px-3 py-4 text-center transition-colors motion-safe-transition",
        selected ? ACCENTS[accentIndex % ACCENTS.length] : "bg-surface hover:bg-paper-deep",
        disabled && !selected && "cursor-not-allowed opacity-45",
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        disabled={disabled && !selected}
        onChange={onToggle}
      />
      <span className="text-sm font-semibold leading-snug text-ink sm:text-base">
        {label}
      </span>
      {selected ? (
        <span
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border border-ink bg-ink text-xs text-white"
          aria-hidden="true"
        >
          ✓
        </span>
      ) : null}
    </label>
  );
}

interface RadioPillProps {
  name: string;
  label: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  required?: boolean;
}

export function RadioPill({
  name,
  label,
  value,
  checked,
  onChange,
  disabled,
  required,
}: RadioPillProps) {
  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-ink px-4 text-sm font-semibold transition-colors",
        checked ? "bg-yellow" : "bg-surface hover:bg-paper-deep",
        disabled && "cursor-not-allowed opacity-45",
      )}
    >
      <input
        type="radio"
        className="h-4 w-4 accent-[var(--ink)]"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        required={required}
        onChange={onChange}
      />
      {label}
    </label>
  );
}

interface FilterPillProps {
  label: string;
  pressed: boolean;
  onClick: () => void;
}

export function FilterPill({ label, pressed, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-ink px-4 text-sm font-semibold",
        pressed ? "bg-yellow" : "bg-surface hover:bg-paper-deep",
      )}
    >
      {pressed ? (
        <span
          className="h-2.5 w-2.5 rounded-full bg-ink"
          aria-hidden="true"
        />
      ) : null}
      {label}
    </button>
  );
}
