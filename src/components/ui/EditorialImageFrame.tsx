import { cn } from "@/lib/cn";
import type { CSSProperties, ReactNode } from "react";

export type EditorialImageVariant = "hero" | "feature" | "card" | "detail";

const FRAME_STYLES: Record<
  EditorialImageVariant,
  { aspectRatio: string; borderRadius: string }
> = {
  hero: {
    aspectRatio: "16 / 10",
    borderRadius: "34% 10% 28% 14% / 16% 30% 12% 38%",
  },
  feature: {
    aspectRatio: "16 / 9",
    borderRadius: "12% 28% 10% 32% / 18% 12% 30% 16%",
  },
  card: {
    aspectRatio: "4 / 3",
    borderRadius: "18% 6% 20% 8% / 10% 22% 8% 18%",
  },
  detail: {
    aspectRatio: "16 / 10",
    borderRadius: "33% 11% 29% 13% / 17% 29% 13% 37%",
  },
};

interface EditorialImageFrameProps {
  children: ReactNode;
  variant?: EditorialImageVariant;
  className?: string;
  style?: CSSProperties;
}

/**
 * Soft asymmetric editorial cutout for content photography.
 * Sized with aspect-ratio so Next.js `Image fill` always has a real box.
 * Do not use for avatars, leader identity portraits, logos, or icons.
 */
export function EditorialImageFrame({
  children,
  variant = "hero",
  className,
  style,
}: EditorialImageFrameProps) {
  const frame = FRAME_STYLES[variant];

  return (
    <div
      data-editorial-image={variant}
      className={cn(
        "relative isolate w-full min-w-0 overflow-hidden bg-paper-deep",
        className,
      )}
      style={{
        aspectRatio: frame.aspectRatio,
        borderRadius: frame.borderRadius,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
