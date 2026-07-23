import type { Metadata } from "next";
import { DM_Sans, Newsreader } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";
import { getDataMode } from "@/lib/data/store";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dataMode = getDataMode();

  return (
    <html lang="en" className={`${dmSans.variable} ${newsreader.variable} h-full`}>
      <body className="min-h-full antialiased">
        <ToastProvider>
          <AppShell dataMode={dataMode}>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
