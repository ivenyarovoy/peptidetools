import type { Metadata } from "next";
import { DisclaimerBanner } from "@/components/Disclaimer";

export const metadata: Metadata = {
  title: "Trusted Partners",
  description: "Vetted suppliers and research resources — coming soon to PeptideUtils.",
};

export default function PartnersPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Trusted Partners</h1>
        <p className="text-slate-400">
          We&apos;re curating a short list of vetted suppliers and research resources. Check back
          soon.
        </p>
      </header>

      <DisclaimerBanner />

      <section className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 text-sm text-slate-600"
          >
            Partner slot — coming soon
          </div>
        ))}
      </section>
    </div>
  );
}
