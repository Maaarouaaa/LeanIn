export default function MatchLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6" aria-busy="true" aria-label="Loading form">
      <div className="h-3 w-40 animate-pulse rounded bg-border/70" />
      <div className="h-12 w-3/4 animate-pulse rounded bg-border/70" />
      <div className="h-4 w-full animate-pulse rounded bg-border/70" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-lg bg-border/70" />
        <div className="h-24 animate-pulse rounded-lg bg-border/70" />
        <div className="h-24 animate-pulse rounded-lg bg-border/70" />
        <div className="h-24 animate-pulse rounded-lg bg-border/70" />
      </div>
    </div>
  );
}
