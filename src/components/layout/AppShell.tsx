"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/match", label: "Circle Match" },
  { href: "/matches", label: "Your matches" },
];

export function AppShell({
  children,
  dataMode,
}: {
  children: React.ReactNode;
  dataMode: "supabase" | "memory";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-atmosphere flex min-h-full flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>

      {dataMode === "memory" ? (
        <div
          className="border-b border-border bg-blush px-4 py-2 text-center text-xs text-ink-muted sm:text-sm"
          role="status"
        >
          Development fallback: using in-memory data. Configure Supabase env
          vars for persistent storage.
        </div>
      ) : null}

      <header className="border-b border-border/80 bg-surface/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-serif text-2xl tracking-tight text-burgundy">
              Lean In Connect
            </span>
            <span className="hidden text-xs uppercase tracking-[0.18em] text-ink-subtle sm:inline">
              Circle Match
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-burgundy-soft text-burgundy"
                      : "text-ink-muted hover:text-burgundy",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true" className="text-lg leading-none">
              {open ? "×" : "☰"}
            </span>
          </button>
        </div>

        {open ? (
          <nav
            id="mobile-nav"
            className="border-t border-border px-4 py-3 md:hidden"
            aria-label="Mobile"
          >
            <ul className="space-y-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-3 text-sm text-ink"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {children}
      </main>

      <footer className="border-t border-border/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Circle Match helps new members find a Circle that fits.</p>
          <p className="text-ink-subtle">Demo profile · Amina Okonkwo</p>
        </div>
      </footer>
    </div>
  );
}
