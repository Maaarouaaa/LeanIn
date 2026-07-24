import { cn } from "@/lib/cn";
import type { SVGProps } from "react";

/** Decorative door icon that opens on hover/focus-visible of a parent `.group`. */
export function DoorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("door-icon h-8 w-8 shrink-0 text-current", className)}
      {...props}
    >
      {/* Frame */}
      <rect
        x="2.25"
        y="1.25"
        width="13.5"
        height="15.5"
        rx="0.85"
        stroke="currentColor"
        strokeWidth="1.35"
      />
      {/* Door panel — pivots from the hinge (left) */}
      <g className="door-panel">
        <rect
          x="3.5"
          y="2.5"
          width="11"
          height="13"
          fill="currentColor"
          fillOpacity="0.14"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        {/* Handle */}
        <circle cx="12" cy="9" r="1.15" fill="currentColor" />
      </g>
    </svg>
  );
}
