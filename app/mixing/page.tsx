import type { Metadata } from "next";
import { MixingCalculator } from "@/components/MixingCalculator";

export const metadata: Metadata = {
  title: "Peptide Mixing Calculator — Combine Compounds in One Vial",
  description:
    "Combine two or more peptides into a single vial. Get exact reconstitution and transfer steps so every injection delivers each compound's target dose.",
};

export default function MixingPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Mixing Calculator</h1>
        <p className="text-slate-400">
          Want one vial you draw from once per injection? Enter each compound&apos;s vial weight and
          target dose. We work out how to reconstitute and transfer them — including partial
          transfers — so a single draw delivers every dose exactly.
        </p>
      </header>

      <MixingCalculator />

      <section className="space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-400">
        <h2 className="text-lg font-semibold text-slate-200">How it works</h2>
        <p>
          Once everything is in one vial, a single draw delivers each compound in proportion to how
          much of it is in the mix — so the per-injection ratio is fixed by the milligrams you put
          in. The calculator picks the compound that runs out first as the &quot;anchor&quot; (used
          whole), then for every other compound it reconstitutes the vial and tells you to transfer
          only the fraction needed. That&apos;s why you might reconstitute one vial and move just
          half of it into another.
        </p>
        <p className="text-slate-500">
          Tip: keep transfers measurable on your syringe. If a transfer is tiny, increase that
          vial&apos;s reconstitution volume.
        </p>
      </section>
    </div>
  );
}
