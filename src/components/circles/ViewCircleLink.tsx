import { DoorIcon } from "@/components/ui/DoorIcon";
import { cn } from "@/lib/cn";
import Link from "next/link";

interface ViewCircleLinkProps {
  slug: string;
  name: string;
  className?: string;
  /** Tone for dark featured cards vs light secondary cards. */
  tone?: "light" | "dark" | "yellow";
}

/**
 * Shared Circle card action: “View” + animated door icon.
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
        "group inline-flex min-h-11 items-center gap-2 font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        tone === "dark" && "text-white focus-visible:outline-white",
        tone === "light" && "text-ink focus-visible:outline-ink",
        tone === "yellow" &&
          "rounded-full border border-ink bg-yellow px-5 text-ink focus-visible:outline-ink",
        className,
      )}
    >
      <span aria-hidden="true">View</span>
      <DoorIcon />
    </Link>
  );
}
