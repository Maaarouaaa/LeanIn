import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-ink/10", className)}
      aria-hidden="true"
    />
  );
}

export function CircleCardSkeleton() {
  return (
    <div className="overflow-hidden border border-ink bg-surface">
      <Skeleton className="h-48 w-full" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
