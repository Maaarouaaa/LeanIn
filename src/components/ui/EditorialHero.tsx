import { cn } from "@/lib/cn";
import Image from "next/image";
import type { ReactNode } from "react";

interface EditorialHeroProps {
  eyebrow?: string;
  title: string;
  editorial?: string;
  outlineWord?: string;
  imageSrc?: string;
  imageAlt?: string;
  badge?: string;
  actions?: ReactNode;
  tone?: "split" | "yellow" | "detail";
  className?: string;
  children?: ReactNode;
}

/**
 * Flower-petal yellow edge overlapping the photograph — soft scalloped
 * petal tips (~70–110px into the image), like the outline of petals.
 */
const HERO_YELLOW_PATH =
  "M0 0 H75 C88 0 100 6 100 12.5 C100 19 88 25 75 25 C88 25 100 31 100 37.5 C100 44 88 50 75 50 C88 50 100 56 100 62.5 C100 69 88 75 75 75 C88 75 100 81 100 87.5 C100 94 88 100 75 100 H0 Z";

export function EditorialHero({
  eyebrow,
  title,
  editorial,
  outlineWord,
  imageSrc,
  imageAlt,
  badge,
  actions,
  tone = "split",
  className,
  children,
}: EditorialHeroProps) {
  if (tone === "yellow") {
    return (
      <section
        className={cn(
          "relative overflow-hidden border-b border-ink bg-yellow px-4 py-10 sm:px-6 lg:px-10 lg:py-14",
          className,
        )}
      >
        {outlineWord ? (
          <span className="outline-word absolute -right-4 top-4 text-[18vw] leading-none opacity-70 lg:text-[9rem]">
            {outlineWord}
          </span>
        ) : null}
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6 pt-2 lg:flex-row lg:items-end lg:justify-between lg:pt-8">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="type-eyebrow text-ink">{eyebrow}</p>
            ) : null}
            <h1 className="type-page text-ink">{title}</h1>
            {editorial ? (
              <p className="measure font-editorial type-lead italic text-plum">
                {editorial}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
        </div>
        {children}
      </section>
    );
  }

  return (
    <section
      className={cn(
        "relative overflow-hidden border-b border-ink bg-yellow",
        className,
      )}
      data-editorial-hero="split"
    >
      <div className="relative mx-auto max-w-[1440px]">
        {/* Hero copy — width keeps text clear of the rounded overlap */}
        <div className="relative z-20 px-4 pb-6 pt-10 sm:px-8 md:w-[48%] md:pb-14 md:pt-16 lg:w-[46%] lg:px-10 lg:pb-16 lg:pt-20">
          {outlineWord ? (
            <span className="outline-word absolute left-2 top-8 text-[22vw] leading-none lg:text-[8.5rem]">
              {outlineWord}
            </span>
          ) : null}
          <div className="relative max-w-xl space-y-4">
            {eyebrow ? (
              <p className="type-eyebrow text-ink">{eyebrow}</p>
            ) : null}
            <h1 className="type-display text-ink">{title}</h1>
            {editorial ? (
              <p className="measure font-editorial type-lead italic text-plum">
                {editorial}
              </p>
            ) : null}
            {actions}
          </div>
        </div>

        {/*
          Photograph: ~50% desktop width, reduced height, rectangular with
          subtle top-right rounding. Under the rounded yellow overlay.
        */}
        <div className="relative z-10 px-4 pb-8 pt-2 sm:px-6 md:absolute md:right-0 md:top-1/2 md:w-[50%] md:-translate-y-1/2 md:px-0 md:pb-0 md:pt-0">
          <div
            data-hero-photo=""
            className="relative aspect-[5/4] max-h-[17rem] w-full overflow-hidden rounded-tr-2xl bg-paper-deep sm:max-h-[19rem] md:max-h-[20rem] lg:max-h-[22rem] xl:max-h-[24rem]"
          >
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                className="object-cover object-[48%_18%]"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center type-meta text-ink-muted"
                role="img"
                aria-label={imageAlt || "Circle photography unavailable"}
              >
                Image unavailable
              </div>
            )}
          </div>
          {badge ? (
            <span className="absolute bottom-3 right-3 z-10 bg-ink px-3 py-1.5 type-meta font-medium text-white md:bottom-2 md:right-2">
              {badge}
            </span>
          ) : null}
        </div>

        {/* Decorative yellow shape — flower-petal scallops over the photo */}
        <svg
          aria-hidden="true"
          data-hero-yellow-overlap=""
          className="pointer-events-none absolute inset-y-0 left-0 z-[15] hidden h-full w-[calc(50%+5.5rem)] md:block lg:w-[calc(50%+6.5rem)]"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path fill="var(--yellow)" d={HERO_YELLOW_PATH} />
        </svg>
      </div>
      {children}
    </section>
  );
}
