import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-enter grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
      <section className="space-y-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-burgundy">
          Lean In Connect
        </p>
        <h1 className="max-w-xl font-serif text-5xl leading-[1.05] text-ink sm:text-6xl">
          Circle Match
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Shorten the distance between joining Lean In Connect and finding a
          Circle that feels like yours—based on the support you want, your
          career stage, and how you prefer to meet.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/match">
            <Button size="lg" className="w-full sm:w-auto">
              Start matching
            </Button>
          </Link>
          <Link href="/matches">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              View matches
            </Button>
          </Link>
        </div>
      </section>

      <aside className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#922A3A] via-[#a64554] to-[#e7c9c4] p-8 text-white min-h-72">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
        <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative space-y-4">
          <p className="text-xs uppercase tracking-[0.18em] text-white/75">
            Activation moment
          </p>
          <h2 className="font-serif text-3xl leading-tight">
            From welcome email to a community that fits.
          </h2>
          <p className="text-sm text-white/85">
            Answer a few thoughtful questions. See three ranked Circles with
            clear reasons. Request to join—and keep your pending status after
            refresh.
          </p>
        </div>
      </aside>
    </div>
  );
}
