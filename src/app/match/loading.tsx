export default function MatchLoading() {
  return (
    <div aria-busy="true" aria-label="Loading preferences">
      <div className="h-72 animate-pulse bg-yellow" />
      <div className="mx-auto max-w-[1440px] space-y-4 px-4 py-10">
        <div className="h-8 w-2/3 animate-pulse bg-ink/10" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse border border-ink/20 bg-ink/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
