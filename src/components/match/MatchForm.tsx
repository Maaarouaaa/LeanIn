"use client";

import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextInput } from "@/components/ui/Field";
import {
  GoalCard,
  RadioPill,
} from "@/components/ui/SelectableControls";
import { useToast } from "@/components/ui/Toast";
import {
  AVAILABILITY_OPTIONS,
  CAREER_STAGE_OPTIONS,
  FORMAT_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  MAX_GOALS,
} from "@/lib/constants";
import { saveMemberPreferences } from "@/lib/actions/circle-match";
import type {
  AvailabilityWindow,
  CareerStage,
  Goal,
  MeetingFormat,
  MeetingFrequency,
  MemberPreferences,
} from "@/lib/types";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface MatchFormProps {
  initialPreferences?: MemberPreferences | null;
}

interface FormState {
  goals: Goal[];
  careerStage: CareerStage | "";
  format: MeetingFormat | "";
  frequency: MeetingFrequency | "";
  location: string;
  availability: AvailabilityWindow | "";
  includeVirtualOutsideLocation: boolean;
}

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

function toFormState(preferences?: MemberPreferences | null): FormState {
  return {
    goals: preferences?.goals ?? [],
    careerStage: preferences?.careerStage ?? "",
    format: preferences?.format ?? "",
    frequency: preferences?.frequency ?? "",
    location: preferences?.location ?? "",
    availability: preferences?.availability ?? "",
    includeVirtualOutsideLocation:
      preferences?.includeVirtualOutsideLocation ?? true,
  };
}

export function MatchForm({ initialPreferences }: MatchFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [form, setForm] = useState<FormState>(() =>
    toFormState(initialPreferences),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();

  function toggleGoal(value: Goal) {
    setForm((current) => {
      const exists = current.goals.includes(value);
      if (exists) {
        return {
          ...current,
          goals: current.goals.filter((item) => item !== value),
        };
      }
      if (current.goals.length >= MAX_GOALS) {
        setErrors((prev) => ({
          ...prev,
          goals: "Choose up to three.",
        }));
        return current;
      }
      setErrors((prev) => ({ ...prev, goals: undefined }));
      return { ...current, goals: [...current.goals, value] };
    });
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.goals.length) next.goals = "Select at least one support goal.";
    if (form.goals.length > MAX_GOALS) next.goals = "Choose up to three.";
    if (!form.careerStage) next.careerStage = "Select your career stage.";
    if (!form.format) next.format = "Select a preferred meeting format.";
    if (!form.frequency) next.frequency = "Select a preferred meeting frequency.";
    if (!form.location.trim()) next.location = "Enter your location.";
    return next;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    startTransition(async () => {
      const result = await saveMemberPreferences({
        goals: form.goals,
        careerStage: form.careerStage as CareerStage,
        format: form.format as MeetingFormat,
        frequency: form.frequency as MeetingFrequency,
        location: form.location,
        availability: form.availability,
        includeVirtualOutsideLocation: form.includeVirtualOutsideLocation,
      });

      if (!result.ok) {
        setErrors({ form: result.error });
        pushToast(result.error, "error");
        return;
      }

      pushToast("Preferences saved. Finding your Circles…", "success");
      router.push("/matches");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12" noValidate>
      <section className="space-y-5" aria-labelledby="support-goals-title">
        <div className="flex flex-col gap-3 border-b border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="support-goals-title"
            className="font-display text-3xl text-ink sm:text-4xl"
          >
            01 What kind of support are you looking for?
          </h2>
          <p className="max-w-sm text-sm text-ink-muted sm:text-right">
            We use these preferences to rank Circles that fit your goals—not
            just the most popular ones.
          </p>
        </div>

        <fieldset>
          <legend className="sr-only">Support goals</legend>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GOAL_OPTIONS.map((option, index) => (
              <GoalCard
                key={option.value}
                label={option.label}
                selected={form.goals.includes(option.value)}
                accentIndex={index}
                disabled={
                  isPending ||
                  (!form.goals.includes(option.value) &&
                    form.goals.length >= MAX_GOALS)
                }
                onToggle={() => toggleGoal(option.value)}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-muted">Choose up to three.</p>
          {errors.goals ? (
            <p
              id="goals-error"
              className="mt-2 text-sm font-medium text-error"
              role="alert"
            >
              {errors.goals}
            </p>
          ) : null}
        </fieldset>
      </section>

      <section className="space-y-6" aria-labelledby="details-title">
        <h2
          id="details-title"
          className="border-b border-ink pb-4 font-display text-3xl text-ink sm:text-4xl"
        >
          02 Help us find a Circle that fits your life
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id="careerStage" label="Career stage" error={errors.careerStage}>
            <SelectInput
              id="careerStage"
              name="careerStage"
              value={form.careerStage}
              error={Boolean(errors.careerStage)}
              disabled={isPending}
              aria-invalid={Boolean(errors.careerStage)}
              aria-describedby={errors.careerStage ? "careerStage-error" : undefined}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  careerStage: event.target.value as CareerStage | "",
                }))
              }
            >
              <option value="">Select a stage</option>
              {CAREER_STAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field
            id="frequency"
            label="Meeting frequency"
            error={errors.frequency}
          >
            <SelectInput
              id="frequency"
              name="frequency"
              value={form.frequency}
              error={Boolean(errors.frequency)}
              disabled={isPending}
              aria-invalid={Boolean(errors.frequency)}
              aria-describedby={errors.frequency ? "frequency-error" : undefined}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  frequency: event.target.value as MeetingFrequency | "",
                }))
              }
            >
              <option value="">Select frequency</option>
              {FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field id="location" label="Location" error={errors.location}>
            <TextInput
              id="location"
              name="location"
              placeholder="Oakland, CA"
              value={form.location}
              error={Boolean(errors.location)}
              disabled={isPending}
              aria-required="true"
              aria-invalid={Boolean(errors.location)}
              aria-describedby={errors.location ? "location-error" : undefined}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            />
          </Field>

          <Field id="availability" label="Availability" optional>
            <SelectInput
              id="availability"
              name="availability"
              value={form.availability}
              disabled={isPending}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availability: event.target.value as AvailabilityWindow | "",
                }))
              }
            >
              <option value="">Select availability</option>
              {AVAILABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
            Preferred format <span className="text-error">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map((option) => (
              <RadioPill
                key={option.value}
                name="format"
                label={option.label}
                value={option.value}
                checked={form.format === option.value}
                disabled={isPending}
                onChange={() =>
                  setForm((current) => ({ ...current, format: option.value }))
                }
              />
            ))}
          </div>
          {errors.format ? (
            <p className="text-sm font-medium text-error" role="alert">
              {errors.format}
            </p>
          ) : null}
        </fieldset>

        <label className="flex items-start gap-3 text-sm text-ink">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 accent-[var(--yellow)]"
            checked={form.includeVirtualOutsideLocation}
            disabled={isPending}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                includeVirtualOutsideLocation: event.target.checked,
              }))
            }
          />
          <span>Include virtual Circles outside my location.</span>
        </label>
      </section>

      {errors.form ? (
        <p className="border border-error bg-error-soft px-4 py-3 text-sm text-error" role="alert">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">* Required fields</p>
            <Button type="submit" size="lg" loading={isPending} loadingLabel="Matching…" className="sm:min-w-56">
          Find my Circles →
        </Button>
      </div>
    </form>
  );
}
