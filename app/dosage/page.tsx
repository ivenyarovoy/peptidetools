import type { Metadata } from "next";
import { DosageCalculator } from "@/components/DosageCalculator";

export const metadata: Metadata = {
  title: "Peptide Dosage & Reconstitution Calculator",
  description:
    "Work out how much BAC water to add to a peptide vial for your target dose, and see the draw in syringe units on the correct insulin syringe.",
};

export default function DosagePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Dosage Calculator</h1>
        <p className="text-slate-400">
          Enter your vial weight and target dose, choose a syringe, and we&apos;ll suggest how much
          bacteriostatic (BAC) water to add so each dose lands on a clean syringe marking.
        </p>
      </header>

      <DosageCalculator />

      <section className="space-y-3 border-t border-slate-800 pt-6 text-sm text-slate-400">
        <h2 className="text-lg font-semibold text-slate-200">How it works</h2>
        <p>
          The dose you draw depends on the concentration, which is set by how much water you add:
          <span className="text-slate-300"> concentration = vial mg ÷ water mL</span>. Vial weight
          and dose alone don&apos;t fix the water amount, so the &quot;Pick for me&quot; option picks a
          round water volume that makes one dose land on a clean syringe mark (and stays within your
          vial volume limit). Prefer your own number? Switch to manual and we&apos;ll show the
          resulting draw.
        </p>
        <h2 className="text-lg font-semibold text-slate-200">FAQ</h2>
        <p>
          <span className="text-slate-300">What is BAC water?</span> Bacteriostatic water — sterile
          water with 0.9% benzyl alcohol used to reconstitute lyophilized (freeze-dried) powder.
        </p>
        <p>
          <span className="text-slate-300">What are &quot;units&quot;?</span> On a U-100 insulin
          syringe, 100 units = 1 mL, so 10 units = 0.1 mL.
        </p>
      </section>
    </div>
  );
}
