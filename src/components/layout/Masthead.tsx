"use client";

import { UserRound } from "@/components/icons/UserRound";
import { cn } from "@/lib/cn";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/match", label: "Match" },
  { href: "/matches", label: "Circles" },
  { href: "/community", label: "Community" },
];

function isActive(pathname: string, href: string) {
  if (href === "/community") return pathname.startsWith("/community");
  if (href === "/matches")
    return pathname === "/matches" || pathname.startsWith("/matches/");
  if (href === "/match")
    return pathname === "/match" || pathname.startsWith("/match/");
  return pathname === href;
}

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

      <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center justify-self-start py-1"
        >
          <Image
            src="/assets/brand/lean-in-wordmark.svg"
            alt="Lean In"
            width={160}
            height={36}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <nav
          className="hidden items-center gap-8 justify-self-center md:flex"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
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

        <div className="flex items-center justify-end gap-2 justify-self-end">
          <Link
            href="/match"
            aria-label="My profile"
            title="My profile"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-yellow hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink active:bg-yellow-deep active:text-ink"
          >
            <UserRound aria-hidden="true" className="h-5 w-5" />
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-ink md:hidden"
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
