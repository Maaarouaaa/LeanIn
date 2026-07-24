import type { Metadata } from "next";
import { Barlow_Condensed, Newsreader, IBM_Plex_Sans } from "next/font/google";
import { connection } from "next/server";
import { Masthead } from "@/components/layout/Masthead";
import { ToastProvider } from "@/components/ui/Toast";
import { getDataMode } from "@/lib/data/store";
import "./globals.css";

const productSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-product",
  display: "swap",
});

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const editorial = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
  display: "swap",
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Circle Match · Lean In Connect",
    template: "%s · Lean In Connect",
  },
  description:
    "Find and request to join the Lean In Circles that fit your goals, stage, and schedule.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Ensure request-time rendering so data mode reflects current env.
  await connection();
  const dataMode = await getDataMode();

  return (
    <html
      lang="en"
      className={`${productSans.variable} ${display.variable} ${editorial.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ToastProvider>
          <div className="flex min-h-full flex-col bg-paper">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-yellow focus:px-3 focus:py-2 focus:text-sm"
            >
              Skip to content
            </a>
            <Masthead dataMode={dataMode} />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <footer className="border-t border-ink">
              <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-4 py-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
                <p>Circle Match helps new members find a Circle that fits.</p>
                <p>Lean In Connect</p>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
