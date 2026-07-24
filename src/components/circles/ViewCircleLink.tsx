import { ArrowRightIcon } from "@/components/ui/ArrowRightIcon";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface ViewCircleLinkProps {
  slug: string;
  name: string;
  className?: string;
  /** Visual tone for dark featured cards vs light secondary cards. */
  tone?: "light" | "dark" | "yellow";
}

/**
 * Shared Circle-card action: arrow-only control in the lower-right.
 * Accessible name is always “View [Circle name]”.
 */
export function ViewCircleLink({
  slug,
  name,
  className,
  tone = "light",
}: ViewCircleLinkProps) {
  return (
    <Link
      href={`/circles/${slug}`}
      aria-label={`View ${name}`}
      className={cn(
        "view-circle-arrow absolute bottom-5 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors motion-safe-transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        tone === "dark" &&
          "border-white/80 bg-ink/40 text-white hover:bg-white hover:text-ink focus-visible:outline-white",
        tone === "light" &&
          "border-ink bg-surface text-ink hover:bg-ink hover:text-white focus-visible:outline-ink",
        tone === "yellow" &&
          "border-ink bg-yellow text-ink hover:bg-ink hover:text-yellow focus-visible:outline-ink",
        className,
      )}
    >
      <ArrowRightIcon className="view-circle-arrow-icon h-5 w-5" />
    </Link>
  );
}
