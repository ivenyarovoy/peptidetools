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

      {/* Call to action for prospective partners. */}
      <section className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-100">Want to become a partner?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">
          If you run a vetted supplier or research resource and want to be featured here, get in
          touch — we&apos;d love to hear from you.
        </p>
        <a
          href="mailto:crocodileburpcloth@proton.me?subject=PeptideUtils%20partnership"
          className="mt-4 inline-block rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
        >
          Email us about partnering
        </a>
        <p className="mt-3 text-xs text-slate-400">crocodileburpcloth@proton.me</p>
      </section>
    </div>
  );
}
