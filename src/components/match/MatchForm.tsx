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
import { useEffect, useId, useRef, useState } from "react";

const CLIENT_SAVE_TIMEOUT_MS = 10_000;

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

async function withClientTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function MatchForm({ initialPreferences }: MatchFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const formErrorId = useId();
  const submittingRef = useRef(false);
  const [form, setForm] = useState<FormState>(() =>
    toFormState(initialPreferences),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  // Single source of truth for loading — do not mix with useTransition/useActionState.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Avoid native pre-hydration submits (full page reload / loading skeleton, no server action).
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    setClientReady(true);
  }, []);

  function toggleGoal(value: Goal) {
    if (isSubmitting) return;
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    console.log("[circle-match] MatchForm onSubmit fired");
    event.preventDefault();

    const formEl = event.currentTarget;

    // Prevent double-submit while a request is in flight.
    if (submittingRef.current || isSubmitting) return;

    const nextErrors = validate();
    const nativeValid = formEl.checkValidity();

    if (Object.keys(nextErrors).length > 0 || !nativeValid) {
      setErrors(nextErrors);
      formEl.reportValidity();
      // Loading must remain false on validation failure.
      setIsSubmitting(false);
      submittingRef.current = false;
      return;
    }

    // Start loading only after validation passes.
    submittingRef.current = true;
    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const result = await withClientTimeout(
        saveMemberPreferences({
          goals: form.goals,
          careerStage: form.careerStage as CareerStage,
          format: form.format as MeetingFormat,
          frequency: form.frequency as MeetingFrequency,
          location: form.location,
          availability: form.availability,
          includeVirtualOutsideLocation: form.includeVirtualOutsideLocation,
        }),
        CLIENT_SAVE_TIMEOUT_MS,
        "Saving preferences timed out. Please try again.",
      );

      if (!result.ok) {
        setErrors({ form: result.error });
        pushToast(result.error, "error");
        return;
      }

      pushToast("Preferences saved. Finding your Circles…", "success");
      router.push("/matches");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save preferences. Please try again.";
      setErrors({ form: message });
      pushToast(message, "error");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-12"
      // Use noValidate so onSubmit always fires; we call checkValidity/reportValidity ourselves.
      noValidate
      aria-busy={isSubmitting || undefined}
    >
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
          {/* Native required sentinel so form.checkValidity() covers goals. */}
          <input
            tabIndex={-1}
            aria-hidden="true"
            className="sr-only"
            name="goals-validity"
            required
            value={form.goals.length > 0 ? "ok" : ""}
            onChange={() => {}}
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {GOAL_OPTIONS.map((option, index) => (
              <GoalCard
                key={option.value}
                label={option.label}
                selected={form.goals.includes(option.value)}
                accentIndex={index}
                disabled={
                  isSubmitting ||
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
              required
              error={Boolean(errors.careerStage)}
              disabled={isSubmitting}
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
              required
              error={Boolean(errors.frequency)}
              disabled={isSubmitting}
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
              required
              error={Boolean(errors.location)}
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
            {FORMAT_OPTIONS.map((option, index) => (
              <RadioPill
                key={option.value}
                name="format"
                label={option.label}
                value={option.value}
                checked={form.format === option.value}
                disabled={isSubmitting}
                required={index === 0}
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
            disabled={isSubmitting}
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
        <p
          id={formErrorId}
          className="border border-error bg-error-soft px-4 py-3 text-sm text-error"
          role="alert"
          aria-live="assertive"
        >
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 border-t border-ink pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-muted">* Required fields</p>
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting}
          loadingLabel="Matching…"
          disabled={!clientReady || isSubmitting}
          aria-describedby={errors.form ? formErrorId : undefined}
          className="sm:min-w-56"
        >
          Find my Circles →
        </Button>
      </div>
    </form>
  );
}
