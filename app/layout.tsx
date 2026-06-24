import type { Metadata } from "next";
import Link from "next/link";
import { DisclaimerFooter } from "@/components/Disclaimer";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

const SITE_URL = "https://peptideutils.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PeptideUtils — Peptide Reconstitution & Mixing Calculators",
    template: "%s | PeptideUtils",
  },
  description:
    "Free research-use calculators for peptide reconstitution: work out BAC water amounts, syringe units, and how to combine multiple compounds into one vial.",
  keywords: [
    "peptide calculator",
    "reconstitution calculator",
    "BAC water calculator",
    "peptide mixing calculator",
    "research peptides",
  ],
  openGraph: {
    title: "PeptideUtils — Peptide Calculators",
    description: "Research-use peptide reconstitution and multi-compound mixing calculators.",
    url: SITE_URL,
    siteName: "PeptideUtils",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold tracking-tight text-slate-100">
              Peptide<span className="text-sky-400">Utils</span>
            </Link>
            <SiteNav />
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>

        <footer className="mt-16 border-t border-slate-800">
          <div className="mx-auto max-w-4xl space-y-3 px-4 py-8">
            <DisclaimerFooter />
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} PeptideUtils. Research use only.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
