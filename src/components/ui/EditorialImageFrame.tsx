import { cn } from "@/lib/cn";
import type { CSSProperties, ReactNode } from "react";

export type EditorialImageVariant = "hero" | "featured" | "card" | "detail";

const VARIANT_RADIUS: Record<EditorialImageVariant, string> = {
  // Broad curved top, exaggerated corner, scooped lower-left, asymmetric lower-right.
  hero: "34% 10% 28% 14% / 16% 30% 12% 38%",
  featured: "32% 12% 30% 11% / 18% 28% 14% 36%",
  card: "30% 14% 26% 12% / 20% 26% 16% 34%",
  detail: "33% 11% 29% 13% / 17% 29% 13% 37%",
};

interface EditorialImageFrameProps {
  children: ReactNode;
  variant?: EditorialImageVariant;
  /** CSS object-position value applied via a CSS variable for the image child. */
  focalPoint?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Soft asymmetric editorial cutout for content photography.
 * Do not use for avatars, leader identity portraits, logos, or icons.
 */
export function EditorialImageFrame({
  children,
  variant = "hero",
  focalPoint = "50% 35%",
  className,
  style,
}: EditorialImageFrameProps) {
  return (
    <div
      data-editorial-image={variant}
      className={cn("editorial-image-frame relative overflow-hidden", className)}
      style={
        {
          "--editorial-radius": VARIANT_RADIUS[variant],
          "--editorial-focal": focalPoint,
          borderRadius: "var(--editorial-radius)",
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
