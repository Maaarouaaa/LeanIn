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
        "relative overflow-hidden border-b border-ink",
        className,
      )}
    >
      <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative bg-yellow px-4 pb-10 pt-10 sm:px-8 lg:px-10 lg:pb-16 lg:pt-20">
          {outlineWord ? (
            <span className="outline-word absolute left-2 top-8 text-[22vw] leading-none lg:text-[8.5rem]">
              {outlineWord}
            </span>
          ) : null}
          <div className="relative z-10 max-w-xl space-y-4">
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

        <div className="relative min-h-64 bg-paper-deep lg:min-h-full">
          {imageSrc ? (
            <div className="absolute inset-3 overflow-hidden rounded-2xl sm:inset-5">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                className="object-cover object-[50%_35%]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          ) : null}
          {badge ? (
            <span className="absolute bottom-6 right-6 z-10 bg-ink px-3 py-1.5 type-meta font-medium text-white">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
