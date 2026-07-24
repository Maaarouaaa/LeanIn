"use client";

import { cn } from "@/lib/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/match", label: "Match" },
  { href: "/matches", label: "Circles" },
  { href: "/#community", label: "Community" },
];

export function Masthead({
  dataMode,
}: {
  dataMode: "supabase" | "memory";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showFallbackBanner = dataMode === "memory";

  return (
    <header className="border-b border-ink bg-paper">
      {showFallbackBanner ? (
        <div
          className="border-b border-ink/20 bg-lavender/40 px-4 py-2 text-center type-meta text-ink-soft"
          role="status"
        >
          Development fallback: using in-memory data. Configure Supabase env
          vars for persistent storage.
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center text-xl leading-none"
          >
            ✦
          </span>
          <span className="text-sm font-semibold text-ink">Lean In Connect</span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/#community" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative pb-1 type-meta font-medium text-ink",
                  active &&
                    "font-semibold after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[3px] after:bg-[var(--error)]",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/match"
            className="hidden min-h-11 items-center rounded-full bg-ink px-4 type-meta font-semibold text-white sm:inline-flex"
          >
            My Profile
          </Link>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center border border-ink md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          className="border-t border-ink px-4 py-3 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-2 py-3 text-sm font-medium"
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
  );
}
