import { cn } from "@/lib/cn";
import type { Circle } from "@/lib/types";

const TONE_STYLES: Record<
  Circle["imageTone"],
  { gradient: string; accent: string }
> = {
  burgundy: {
    gradient: "from-[#922A3A] via-[#a64554] to-[#d9b4b8]",
    accent: "bg-white/15",
  },
  blush: {
    gradient: "from-[#c9898a] via-[#e7c9c4] to-[#f6ebe8]",
    accent: "bg-[#922A3A]/10",
  },
  sage: {
    gradient: "from-[#5f7a66] via-[#9bb09f] to-[#e7f0ea]",
    accent: "bg-white/20",
  },
  sand: {
    gradient: "from-[#b08968] via-[#d8c3ad] to-[#f4ebe3]",
    accent: "bg-[#1B1716]/10",
  },
  slate: {
    gradient: "from-[#4f5b66] via-[#8a96a1] to-[#e4e8eb]",
    accent: "bg-white/15",
  },
  rose: {
    gradient: "from-[#9b4d5a] via-[#c98993] to-[#f3e6e8]",
    accent: "bg-white/15",
  },
};

export function CircleVisual({
  circle,
  className,
  compact = false,
}: {
  circle: Pick<Circle, "name" | "category" | "imageTone">;
  className?: string;
  compact?: boolean;
}) {
  const tone = TONE_STYLES[circle.imageTone];

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br",
        tone.gradient,
        compact ? "h-28" : "h-44 sm:h-52",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 opacity-30">
        <div className={cn("absolute -right-8 -top-8 h-40 w-40 rounded-full", tone.accent)} />
        <div className={cn("absolute bottom-4 left-6 h-24 w-24 rounded-full", tone.accent)} />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_20%,rgba(27,23,22,0.28))]" />
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <p className="text-xs uppercase tracking-[0.16em] text-white/80">
          {circle.category}
        </p>
        {!compact ? (
          <p className="mt-1 font-serif text-xl leading-tight">{circle.name}</p>
        ) : null}
      </div>
    </div>
  );
}
