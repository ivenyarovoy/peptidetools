import Link from "next/link";
import { DisclaimerBanner } from "@/components/Disclaimer";

const TOOLS = [
  {
    href: "/dosage",
    title: "Dosage Calculator",
    blurb:
      "Enter your vial weight and target dose, pick a syringe, and get the BAC water to add — with the draw shown live on a syringe.",
  },
  {
    href: "/mixing",
    title: "Mixing Calculator",
    blurb:
      "Combine two or more compounds into a single vial. We work out the exact transfers so every injection hits each target dose.",
  },
  {
    href: "/partners",
    title: "Trusted Partners",
    blurb: "Vetted suppliers and resources — coming soon.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-100 sm:text-4xl">
          Peptide reconstitution & mixing calculators
        </h1>
        <p className="max-w-2xl text-slate-400">
          Simple, accurate tools for working out BAC water amounts, syringe units, and how to
          combine multiple compounds into one vial. Built for research reference.
        </p>
      </section>

      <DisclaimerBanner />

      <section className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-sky-500/50 hover:bg-slate-900"
          >
            <h2 className="text-lg font-semibold text-slate-100 group-hover:text-sky-400">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm text-slate-400">{tool.blurb}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
