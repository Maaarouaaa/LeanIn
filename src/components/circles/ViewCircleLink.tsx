import { ArrowRightIcon } from "@/components/ui/ArrowRightIcon";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface ViewCircleLinkProps {
  slug: string;
  name: string;
  className?: string;
  /** Visual tone for dark featured cards vs light secondary cards. */
  tone?: "light" | "dark" | "yellow";
  /**
   * `top-right` — standard / community cards
   * `featured` — lower-right of the full featured card
   */
  placement?: "top-right" | "featured";
  /** Optional source route for detail-page back navigation. */
  from?: "matches" | "community";
}

/**
 * Shared Circle-card action: arrow-only control.
 * Accessible name is always “View [Circle name]”.
 */
export function ViewCircleLink({
  slug,
  name,
  className,
  tone = "light",
  placement = "top-right",
  from,
}: ViewCircleLinkProps) {
  const href = from
    ? `/circles/${slug}?from=${from}`
    : `/circles/${slug}`;

  return (
    <Link
      href={href}
      aria-label={`View ${name}`}
      className={cn(
        "view-circle-arrow absolute z-30 inline-flex items-center justify-center rounded-full border transition-colors motion-safe-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        placement === "top-right" && "right-5 top-5 h-11 w-11",
        placement === "featured" && "bottom-7 right-7 h-12 w-12",
        tone === "dark" &&
          "border-white/80 bg-ink/40 text-white hover:bg-white hover:text-ink focus-visible:outline-white",
        tone === "light" &&
          "border-ink bg-paper text-ink hover:bg-ink hover:text-white focus-visible:outline-ink",
        tone === "yellow" &&
          "border-ink bg-yellow text-ink hover:bg-ink hover:text-yellow focus-visible:outline-ink",
        className,
      )}
    >
      <ArrowRightIcon className="view-circle-arrow-icon h-5 w-5" />
    </Link>
  );
}
