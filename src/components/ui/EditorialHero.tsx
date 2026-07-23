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
  progress?: ReactNode;
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
  progress,
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
        <div className="relative z-10 mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-5xl leading-[0.9] text-ink sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            {editorial ? (
              <p className="font-editorial text-xl italic text-plum sm:text-2xl">
                {editorial}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {progress}
            {actions}
          </div>
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
        <div className="relative bg-yellow px-4 py-10 sm:px-8 lg:px-10 lg:py-16">
          {outlineWord ? (
            <span className="outline-word absolute left-2 top-8 text-[22vw] leading-none lg:text-[8.5rem]">
              {outlineWord}
            </span>
          ) : null}
          <div className="relative z-10 max-w-xl space-y-4">
            {eyebrow ? (
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-5xl leading-[0.88] text-ink sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            {editorial ? (
              <p className="font-editorial text-xl italic text-plum sm:text-2xl">
                {editorial}
              </p>
            ) : null}
            {actions}
          </div>
          {progress ? (
            <div className="absolute right-4 top-4 z-20 sm:right-8">
              {progress}
            </div>
          ) : null}
        </div>

        <div className="relative min-h-64 bg-paper-deep lg:min-h-full">
          {imageSrc ? (
            <div className="absolute inset-3 overflow-hidden organic-mask-wide sm:inset-5">
              <Image
                src={imageSrc}
                alt={imageAlt ?? ""}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          ) : null}
          {badge ? (
            <span className="absolute bottom-6 right-6 z-10 bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              {badge}
            </span>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}
