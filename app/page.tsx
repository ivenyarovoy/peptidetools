import Link from "next/link";
import { DisclaimerBanner } from "@/components/Disclaimer";

const TOOLS = [
  {
    href: "/dosage",
    title: "Dosage Calculator",
    blurb:
      "Vial weight + target dose → how much BAC water to add, shown live on an insulin syringe, with a step-by-step reconstitution guide.",
    icon: <SyringeIcon />,
    cta: "Calculate a dose",
  },
  {
    href: "/mixing",
    title: "Mixing Calculator",
    blurb:
      "Combine two or more compounds into one vial. We work out the exact transfers so every injection delivers each target dose.",
    icon: <VialsIcon />,
    cta: "Mix compounds",
  },
  {
    href: "/partners",
    title: "Trusted Partners",
    blurb: "A short, vetted list of suppliers and research resources — coming soon.",
    icon: <HandshakeIcon />,
    cta: "See partners",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="space-y-5 pt-4 text-center sm:pt-8">
        <span className="inline-block rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
          Research use only
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-5xl">
          Peptide reconstitution &amp; mixing,{" "}
          <span className="text-sky-400">done right</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-slate-400 sm:text-lg">
          Free, accurate calculators for BAC water amounts, syringe units, and combining multiple
          compounds into a single vial — with the math you can check.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/dosage"
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Dosage calculator
          </Link>
          <Link
            href="/mixing"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-500/60 hover:text-sky-300"
          >
            Mixing calculator
          </Link>
        </div>
      </section>

      <DisclaimerBanner />

      {/* Tool cards */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Tools</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group flex flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-sky-500/50 hover:bg-slate-900"
            >
              <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                {tool.icon}
              </span>
              <h3 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400">
                {tool.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-slate-400">{tool.blurb}</p>
              <span className="mt-4 text-sm font-medium text-sky-400">{tool.cta} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SyringeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 2 4 4" />
      <path d="m17 7 3-3" />
      <path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-1.4.7l-2.6.3.3-2.6a2.4 2.4 0 0 1 .7-1.4L16 6" />
      <path d="m9 11 2 2" />
      <path d="m13 7 2 2" />
      <path d="m5 19-3 3" />
    </svg>
  );
}

function VialsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3v13a3 3 0 0 0 6 0V3" />
      <path d="M5 3h10" />
      <path d="M7 9h6" />
      <path d="M17 8v8a3 3 0 0 0 4 0V8" />
      <path d="M16 8h6" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-6 w-6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m11 17 2 2a1 1 0 1 0 3-3" />
      <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.9-3.9a2 2 0 0 0-2.8 0l-1.5 1.5a1 1 0 1 1-3-3l2.1-2.1a4 4 0 0 1 5.7 0l.7.7" />
      <path d="m21 4-5 5" />
      <path d="m3 20 5-5" />
    </svg>
  );
}
