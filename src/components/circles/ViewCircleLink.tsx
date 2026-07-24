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
 * Shared Circle card action: door is the primary affordance; “View” clarifies.
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
        "group inline-flex min-h-11 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4",
        tone === "dark" && "focus-visible:outline-white",
        (tone === "light" || tone === "yellow") && "focus-visible:outline-ink",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "text-[12px] font-medium",
          tone === "dark" ? "text-white/70" : "text-ink/70",
        )}
      >
        View
      </span>
      <span
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center",
          tone === "yellow" &&
            "rounded-full border border-ink bg-yellow text-ink",
          tone === "dark" && "text-white",
          tone === "light" && "text-ink",
        )}
      >
        <DoorIcon className="h-8 w-8" />
      </span>
    </Link>
  );
}
