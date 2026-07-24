import { cn } from "@/lib/cn";
import type { SVGProps } from "react";

/** Decorative door icon that opens on hover/focus-visible of a parent `.group`. */
export function DoorIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 18 18"
      width="18"
      height="18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("door-icon shrink-0 text-current", className)}
      {...props}
    >
      {/* Frame */}
      <rect
        x="2.5"
        y="1.5"
        width="13"
        height="15"
        rx="0.75"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      {/* Door panel — pivots from the hinge (left) */}
      <g className="door-panel">
        <rect
          x="3.75"
          y="2.75"
          width="10.5"
          height="12.5"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1"
        />
        {/* Handle */}
        <circle cx="11.75" cy="9" r="1" fill="currentColor" />
      </g>
    </svg>
  );
}
