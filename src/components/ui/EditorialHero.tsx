import { cn } from "@/lib/cn";
import { EditorialImageFrame } from "@/components/ui/EditorialImageFrame";
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
      <div className="relative mx-auto grid max-w-[1440px] overflow-hidden md:grid-cols-[46%_54%]">
        <div className="relative z-10 bg-yellow px-4 pb-8 pt-10 sm:px-8 md:pb-12 lg:px-10 lg:pb-16 lg:pt-20">
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

        <div className="relative z-20 min-w-0 px-4 pb-8 pt-2 sm:px-6 md:-ml-10 md:w-[calc(100%+2.5rem)] md:px-6 md:pb-10 md:pt-12 lg:-ml-20 lg:w-[calc(100%+5rem)] lg:px-8 lg:pt-16 xl:-ml-24 xl:w-[calc(100%+6rem)]">
          {imageSrc ? (
            <EditorialImageFrame variant="hero" className="w-full">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                className="z-0 object-cover object-[50%_35%]"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            </EditorialImageFrame>
          ) : (
            <div
              className="flex min-h-48 w-full items-center justify-center type-meta text-ink-muted"
              role="img"
              aria-label={imageAlt || "Circle photography unavailable"}
            >
              Image unavailable
            </div>
          )}
          {badge ? (
            <span className="absolute bottom-6 right-6 z-10 bg-ink px-3 py-1.5 type-meta font-medium text-white lg:bottom-12 lg:right-10">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
