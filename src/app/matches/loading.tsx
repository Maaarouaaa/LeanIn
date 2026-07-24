import { CircleCardSkeleton } from "@/components/ui/Skeleton";

export default function MatchesLoading() {
  return (
    <div className="space-y-8 px-4 py-10 sm:px-6 lg:px-10" aria-busy="true" aria-label="Loading matches">
      <div className="h-40 animate-pulse bg-yellow" />
      <CircleCardSkeleton />
      <div className="grid gap-5 lg:grid-cols-2">
        <CircleCardSkeleton />
        <CircleCardSkeleton />
      </div>
    </div>
  );
}
