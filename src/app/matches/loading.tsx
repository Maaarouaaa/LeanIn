import { CircleCardSkeleton } from "@/components/ui/Skeleton";

export default function MatchesLoading() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading matches">
      <div className="space-y-3">
        <div className="h-3 w-40 animate-pulse rounded bg-border/70" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded bg-border/70" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-border/70" />
      </div>
      <CircleCardSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <CircleCardSkeleton />
        <CircleCardSkeleton />
      </div>
    </div>
  );
}
