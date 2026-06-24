"use client";

import { useMemo, useState } from "react";
import { NumberField } from "./NumberField";
import { UnitToggle } from "./UnitToggle";
import { DisclaimerBanner } from "./Disclaimer";
import { SYRINGE_LIST, SYRINGES, SyringeId } from "@/lib/syringes";
import { computeMix } from "@/lib/mixing";
import { convert, DoseUnit, formatDose, toMg } from "@/lib/units";

type Num = number | "";
interface Row {
  name: string;
  vialMg: Num;
  dose: Num;
  doseUnit: DoseUnit;
}

const START: Row[] = [
  { name: "Compound A", vialMg: 10, dose: 0.25, doseUnit: "mg" },
  { name: "Compound B", vialMg: 10, dose: 0.5, doseUnit: "mg" },
];

export function MixingCalculator() {
  const [rows, setRows] = useState<Row[]>(START);
  const [syringeId, setSyringeId] = useState<SyringeId>("0.5");
  const [volumeLimit, setVolumeLimit] = useState<Num>(3);

  const syringe = SYRINGES[syringeId];

  function update(i: number, patch: Partial<Row>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function changeRowUnit(i: number, unit: DoseUnit) {
    setRows((prev) =>
      prev.map((r, idx) =>
        idx === i ? { ...r, doseUnit: unit, dose: r.dose === "" ? "" : convert(r.dose, r.doseUnit, unit) } : r,
      ),
    );
  }
  function addRow() {
    setRows((prev) => [
      ...prev,
      { name: `Compound ${String.fromCharCode(65 + prev.length)}`, vialMg: 5, dose: 0.25, doseUnit: "mg" },
    ]);
  }
  function removeRow(i: number) {
    setRows((prev) => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));
  }

  const result = useMemo(() => {
    const ready = rows.every((r) => r.vialMg !== "" && r.dose !== "" && r.vialMg > 0 && r.dose > 0);
    if (!ready || volumeLimit === "" || volumeLimit <= 0) return null;
    return computeMix({
      compounds: rows.map((r) => ({
        name: r.name,
        vialMg: r.vialMg as number,
        doseMg: toMg(r.dose as number, r.doseUnit),
      })),
      syringe,
      volumeLimitMl: volumeLimit,
    });
  }, [rows, syringe, volumeLimit]);

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      {/* Inputs */}
      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.9fr_1.4fr_auto] sm:items-end">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-400">Name</span>
                <input
                  value={row.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-sky-500"
                />
              </label>
              <NumberField label="Vial weight" value={row.vialMg} onChange={(v) => update(i, { vialMg: v })} unit="mg" step={0.5} />
              <div>
                <span className="mb-1 block text-xs font-medium text-slate-400">Dose / inj</span>
                <div className="flex gap-1">
                  <div className="flex-1">
                    <NumberField
                      label=""
                      value={row.dose}
                      onChange={(v) => update(i, { dose: v })}
                      step={row.doseUnit === "mcg" ? 50 : 0.05}
                    />
                  </div>
                  <UnitToggle value={row.doseUnit} onChange={(u) => changeRowUnit(i, u)} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeRow(i)}
                disabled={rows.length <= 2}
                className="h-10 rounded-lg border border-slate-700 px-3 text-sm text-slate-400 hover:border-rose-500 hover:text-rose-300 disabled:opacity-30"
                aria-label={`Remove ${row.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addRow}
          className="rounded-lg border border-dashed border-slate-600 px-4 py-2 text-sm text-slate-300 hover:border-sky-500 hover:text-sky-300"
        >
          + Add compound
        </button>

        <div className="grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-300">Syringe size</span>
            <div className="flex gap-2">
              {SYRINGE_LIST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSyringeId(s.id)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-xs ${
                    s.id === syringeId
                      ? "border-sky-500 bg-sky-500/15 text-sky-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <NumberField
            label="Final vial volume limit"
            value={volumeLimit}
            onChange={setVolumeLimit}
            unit="mL"
            step={0.5}
            hint="Max the mixing vial can hold (typically ~3 mL)."
          />
        </div>
      </div>

      {/* Output */}
      {result && result.steps.length > 0 ? (
        <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="grid grid-cols-3 gap-3 text-sm">
            <Stat label="Injections" value={`${Math.floor(result.injections)}`} />
            <Stat label="Final volume" value={`${result.finalVolumeMl.toFixed(2)} mL`} />
            <Stat label="Draw / inj" value={`${result.drawUnits.toFixed(1)} u`} />
          </div>

          <ol className="space-y-2">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Compound</th>
                  <th className="py-2 pr-4">Vial used</th>
                  <th className="py-2 pr-4">In mix</th>
                  <th className="py-2 pr-4">Final conc.</th>
                  <th className="py-2">Dose / inj</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {result.compounds.map((c, i) => (
                  <tr key={c.name} className="border-t border-slate-800">
                    <td className="py-2 pr-4 font-medium text-slate-200">
                      {c.name} {c.isAnchor ? <span className="text-xs text-sky-400">(whole)</span> : null}
                    </td>
                    <td className="py-2 pr-4">{(c.fraction * 100).toFixed(0)}%</td>
                    <td className="py-2 pr-4">{c.mgInMix.toFixed(2)} mg</td>
                    <td className="py-2 pr-4">{c.finalConcMgPerMl.toFixed(2)} mg/mL</td>
                    <td className="py-2">{formatDose(c.finalConcMgPerMl * result.drawMl, rows[i].doseUnit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.warnings.map((w, i) => (
            <p key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {w}
            </p>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <p className="text-sm text-slate-400">
            {result?.warnings[0] ?? "Enter at least two compounds with positive vial weights and doses."}
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800/50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-200">{value}</p>
    </div>
  );
}
