import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="page-enter mx-auto max-w-lg px-4 py-20 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink-muted">
        404
      </p>
      <h1 className="mt-3 font-display text-5xl text-ink">Circle not found</h1>
      <p className="mt-3 text-ink-muted">
        That Circle may have moved, or the link might be incomplete.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/matches">
          <Button>Back to matches</Button>
        </Link>
        <Link href="/match">
          <Button variant="secondary">Edit preferences</Button>
        </Link>
      </div>
    </div>
  );
}
