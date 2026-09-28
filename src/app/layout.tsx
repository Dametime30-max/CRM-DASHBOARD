import type { Metadata } from "next";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Wills Matter Dashboard", template: "%s · Wills Matter Dashboard" },
  description: "Internal workflow tool for Wills and estate-planning matters.",
  robots: { index: false, follow: false },
};

// All pages read live data from the local database.
export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="bg-brand-900 flex shrink-0 items-center justify-between gap-4 px-4 py-3 lg:sticky lg:top-0 lg:h-screen lg:w-60 lg:flex-col lg:items-stretch lg:justify-start lg:px-3 lg:py-5">
            <Link href="/" className="flex items-center gap-2.5 px-2 lg:mb-8">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-sm font-semibold text-white">W</span>
              <span className="leading-tight">
                <span className="block text-sm font-semibold text-white">Wills Matters</span>
                <span className="text-brand-200 hidden text-xs lg:block">Estate planning workflow</span>
              </span>
            </Link>
            <AppNav />
            <div className="text-brand-200/70 mt-auto hidden px-2 text-[11px] leading-relaxed lg:block">
              Local prototype. Data is stored only on this computer.
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-1.5 text-center text-xs text-amber-900">
              <strong className="font-semibold">Prototype</strong> — use fictional/test data only. Not approved for confidential client information.
            </div>
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
            <footer className="border-t border-slate-200 px-6 py-4 text-center text-xs text-slate-500">
              Internal workflow tool only. Checklist items are prompts, not legal advice, and do not replace the firm&apos;s precedents,
              procedures or supervision.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
