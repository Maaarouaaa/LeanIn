"use client";

import { cn } from "@/lib/cn";

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  description?: string;
}

export function SelectableChip({
  label,
  selected,
  onToggle,
  disabled,
  description,
}: SelectableChipProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "min-h-11 rounded-full border px-4 text-sm transition-colors motion-safe-transition disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-burgundy bg-burgundy-soft text-burgundy"
          : "border-border-strong bg-surface text-ink hover:border-burgundy/40",
      )}
    >
      <span className="font-medium">{label}</span>
      {description ? (
        <span className="ml-2 text-ink-muted">{description}</span>
      ) : null}
    </button>
  );
}

interface SelectableCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  type?: "radio" | "checkbox";
}

export function SelectableCard({
  title,
  description,
  selected,
  onSelect,
  disabled,
  name,
  value,
  type = "radio",
}: SelectableCardProps) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 transition-colors motion-safe-transition",
        selected
          ? "border-burgundy bg-burgundy-soft/70"
          : "border-border bg-surface hover:border-border-strong",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <input
        type={type}
        className="mt-1 h-4 w-4 accent-[var(--burgundy)]"
        checked={selected}
        onChange={onSelect}
        disabled={disabled}
        name={name}
        value={value}
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-ink">{title}</span>
        {description ? (
          <span className="block text-sm text-ink-muted">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
