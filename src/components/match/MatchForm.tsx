"use client";

import { Button } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { SelectableCard, SelectableChip } from "@/components/ui/Selectable";
import { useToast } from "@/components/ui/Toast";
import {
  CAREER_STAGE_OPTIONS,
  FORMAT_OPTIONS,
  FREQUENCY_OPTIONS,
  GOAL_OPTIONS,
  SUPPORT_TYPE_OPTIONS,
} from "@/lib/constants";
import { saveMemberPreferences } from "@/lib/actions/circle-match";
import type {
  CareerStage,
  Goal,
  MeetingFormat,
  MeetingFrequency,
  MemberPreferences,
  SupportType,
} from "@/lib/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

const STEPS = ["Support & stage", "Goals & format", "Location"];

interface MatchFormProps {
  initialPreferences?: MemberPreferences | null;
}

interface FormState {
  supportTypes: SupportType[];
  careerStage: CareerStage | "";
  goals: Goal[];
  format: MeetingFormat | "";
  frequency: MeetingFrequency | "";
  location: string;
  availability: string;
}

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

function toFormState(preferences?: MemberPreferences | null): FormState {
  return {
    supportTypes: preferences?.supportTypes ?? [],
    careerStage: preferences?.careerStage ?? "",
    goals: preferences?.goals ?? [],
    format: preferences?.format ?? "",
    frequency: preferences?.frequency ?? "",
    location: preferences?.location ?? "",
    availability: preferences?.availability ?? "",
  };
}

export function MatchForm({ initialPreferences }: MatchFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(() =>
    toFormState(initialPreferences),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();

  const progressLabel = useMemo(
    () => `Step ${step} of ${STEPS.length}`,
    [step],
  );

  function toggleSupport(value: SupportType) {
    setForm((current) => {
      const exists = current.supportTypes.includes(value);
      return {
        ...current,
        supportTypes: exists
          ? current.supportTypes.filter((item) => item !== value)
          : [...current.supportTypes, value],
      };
    });
  }

  function toggleGoal(value: Goal) {
    setForm((current) => {
      const exists = current.goals.includes(value);
      return {
        ...current,
        goals: exists
          ? current.goals.filter((item) => item !== value)
          : [...current.goals, value],
      };
    });
  }

  function validateStep(currentStep: number): FormErrors {
    const nextErrors: FormErrors = {};
    if (currentStep === 1) {
      if (!form.supportTypes.length) {
        nextErrors.supportTypes = "Select at least one kind of support.";
      }
      if (!form.careerStage) {
        nextErrors.careerStage = "Select your career stage.";
      }
    }
    if (currentStep === 2) {
      if (!form.goals.length) {
        nextErrors.goals = "Select at least one topic or goal.";
      }
      if (!form.format) {
        nextErrors.format = "Choose virtual, in-person, or either.";
      }
      if (!form.frequency) {
        nextErrors.frequency = "Select how often you prefer to meet.";
      }
    }
    if (currentStep === 3) {
      if (!form.location.trim()) {
        nextErrors.location = "Enter your city or region.";
      }
    }
    return nextErrors;
  }

  function goNext() {
    const nextErrors = validateStep(step);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep((value) => Math.min(value + 1, STEPS.length));
  }

  function goBack() {
    setErrors({});
    setStep((value) => Math.max(value - 1, 1));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length) {
      setErrors(stepErrors);
      return;
    }

    startTransition(async () => {
      const result = await saveMemberPreferences({
        supportTypes: form.supportTypes,
        careerStage: form.careerStage as CareerStage,
        goals: form.goals,
        format: form.format as MeetingFormat,
        frequency: form.frequency as MeetingFrequency,
        location: form.location,
        availability: form.availability,
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
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <ProgressIndicator steps={STEPS} currentStep={step} />
      <p className="sr-only" aria-live="polite">
        {progressLabel}
      </p>

      {step === 1 ? (
        <section className="space-y-8 animate-fade-in" aria-labelledby="step-1-title">
          <div className="space-y-3">
            <h2 id="step-1-title" className="font-serif text-3xl text-ink">
              What kind of support are you looking for?
            </h2>
            <p className="max-w-2xl text-ink-muted">
              We ask this so we can recommend Circles that feel relevant—not
              just popular. Your answers stay with your demo profile and shape
              a transparent match score.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Support style <span className="text-danger">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SUPPORT_TYPE_OPTIONS.map((option) => (
                <SelectableCard
                  key={option.value}
                  type="checkbox"
                  title={option.label}
                  description={option.description}
                  selected={form.supportTypes.includes(option.value)}
                  onSelect={() => toggleSupport(option.value)}
                  disabled={isPending}
                  value={option.value}
                />
              ))}
            </div>
            {errors.supportTypes ? (
              <p className="text-sm text-danger" role="alert">
                {errors.supportTypes}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Career stage <span className="text-danger">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CAREER_STAGE_OPTIONS.map((option) => (
                <SelectableCard
                  key={option.value}
                  type="radio"
                  name="careerStage"
                  title={option.label}
                  selected={form.careerStage === option.value}
                  onSelect={() =>
                    setForm((current) => ({
                      ...current,
                      careerStage: option.value,
                    }))
                  }
                  disabled={isPending}
                  value={option.value}
                />
              ))}
            </div>
            {errors.careerStage ? (
              <p className="text-sm text-danger" role="alert">
                {errors.careerStage}
              </p>
            ) : null}
          </fieldset>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-8 animate-fade-in" aria-labelledby="step-2-title">
          <div className="space-y-3">
            <h2 id="step-2-title" className="font-serif text-3xl text-ink">
              Topics, goals, and how you want to meet
            </h2>
            <p className="max-w-2xl text-ink-muted">
              Goal overlap carries the most weight in your match score. Format
              and rhythm help us respect your time and energy.
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Topics or goals <span className="text-danger">*</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((option) => (
                <SelectableChip
                  key={option.value}
                  label={option.label}
                  selected={form.goals.includes(option.value)}
                  onToggle={() => toggleGoal(option.value)}
                  disabled={isPending}
                />
              ))}
            </div>
            {errors.goals ? (
              <p className="text-sm text-danger" role="alert">
                {errors.goals}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Meeting format <span className="text-danger">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {FORMAT_OPTIONS.map((option) => (
                <SelectableCard
                  key={option.value}
                  type="radio"
                  name="format"
                  title={option.label}
                  description={option.description}
                  selected={form.format === option.value}
                  onSelect={() =>
                    setForm((current) => ({ ...current, format: option.value }))
                  }
                  disabled={isPending}
                  value={option.value}
                />
              ))}
            </div>
            {errors.format ? (
              <p className="text-sm text-danger" role="alert">
                {errors.format}
              </p>
            ) : null}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-ink">
              Preferred meeting frequency <span className="text-danger">*</span>
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <SelectableCard
                  key={option.value}
                  type="radio"
                  name="frequency"
                  title={option.label}
                  selected={form.frequency === option.value}
                  onSelect={() =>
                    setForm((current) => ({
                      ...current,
                      frequency: option.value,
                    }))
                  }
                  disabled={isPending}
                  value={option.value}
                />
              ))}
            </div>
            {errors.frequency ? (
              <p className="text-sm text-danger" role="alert">
                {errors.frequency}
              </p>
            ) : null}
          </fieldset>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-8 animate-fade-in" aria-labelledby="step-3-title">
          <div className="space-y-3">
            <h2 id="step-3-title" className="font-serif text-3xl text-ink">
              Where should we look?
            </h2>
            <p className="max-w-2xl text-ink-muted">
              Location helps us prioritize nearby in-person Circles while still
              surfacing strong virtual options.
            </p>
          </div>

          <Field
            id="location"
            label="Location"
            hint='City and region work well—for example, "Chicago, IL" or "Virtual · Global".'
            error={errors.location}
          >
            <TextInput
              id="location"
              name="location"
              autoComplete="address-level2"
              placeholder="San Francisco, CA"
              value={form.location}
              error={Boolean(errors.location)}
              disabled={isPending}
              aria-required="true"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
            />
          </Field>

          <Field
            id="availability"
            label="Availability notes"
            optional
            hint="Share days or times that generally work. Circle leaders may use this when reviewing requests."
          >
            <TextArea
              id="availability"
              name="availability"
              placeholder="Weekday evenings after 6pm PT, or Friday mornings."
              value={form.availability}
              disabled={isPending}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  availability: event.target.value,
                }))
              }
            />
          </Field>
        </section>
      ) : null}

      {errors.form ? (
        <p className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {errors.form}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          {step > 1 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              disabled={isPending}
            >
              Back
            </Button>
          ) : null}
        </div>
        <div className="flex gap-3">
          {step < STEPS.length ? (
            <Button type="button" onClick={goNext} disabled={isPending}>
              Continue
            </Button>
          ) : (
            <Button type="submit" loading={isPending}>
              See my Circle matches
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
