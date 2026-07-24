import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-enter">
      <section className="border-b border-ink bg-yellow px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px] space-y-5">
          <p className="type-eyebrow text-ink">Lean In Connect</p>
          <h1 className="type-display max-w-3xl text-ink">Find your people.</h1>
          <p className="measure font-editorial type-lead italic text-plum">
            The right room can change what feels possible.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link href="/match">
              <Button size="lg">Start matching →</Button>
            </Link>
            <Link href="/matches">
              <Button size="lg" variant="secondary">
                View matches
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="community"
        className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10"
      >
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              step: "01",
              title: "Preferences",
              copy: "Share the support you want, your stage, and how you prefer to meet.",
            },
            {
              step: "02",
              title: "Matches",
              copy: "See three ranked Circles with clear reasons—and a featured top match.",
            },
            {
              step: "03",
              title: "Request",
              copy: "Send a note to the Circle leader and keep your pending status after refresh.",
            },
          ].map((item) => (
            <article key={item.step} className="border border-ink bg-surface p-6">
              <p className="type-eyebrow text-ink-muted">{item.step}</p>
              <h2 className="mt-3 type-section text-ink">{item.title}</h2>
              <p className="mt-3 type-body text-ink-soft">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
