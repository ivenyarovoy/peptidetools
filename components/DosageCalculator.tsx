"use client";

import { useMemo, useState } from "react";
import { NumberField } from "./NumberField";
import { SyringeGraphic } from "./SyringeGraphic";
import { DisclaimerBanner } from "./Disclaimer";
import { UnitToggle } from "./UnitToggle";
import { SYRINGE_LIST, SYRINGES, SyringeId } from "@/lib/syringes";
import { computeDosage, DosageResult, dosageWarning, suggestWater } from "@/lib/dosage";
import { convert, DoseUnit, formatDose, toMg } from "@/lib/units";

type WaterMode = "auto" | "manual";
type Num = number | "";

const WATER_PRESETS = [0.5, 1, 1.5, 2, 2.5, 3];

function buildReconstitutionSteps({
  vialMg,
  waterMl,
  doseLabel,
  dosage,
}: {
  vialMg: number;
  waterMl: number;
  doseLabel: string;
  dosage: DosageResult;
}): string[] {
  return [
    `Draw ${waterMl.toFixed(2)} mL of bacteriostatic (BAC) water into a syringe.`,
    `Inject the water slowly into the ${vialMg} mg vial, aiming it down the inside wall — not directly onto the powder.`,
    "Swirl gently (do not shake) until the solution is completely clear.",
    `This gives ${dosage.concentrationMgPerMl.toFixed(2)} mg/mL. For a ${doseLabel} dose, draw ${dosage.drawUnits.toFixed(
      1,
    )} units (${dosage.drawMl.toFixed(3)} mL) on the syringe.`,
    `The vial holds about ${Math.floor(dosage.dosesPerVial)} doses at this dose size.`,
  ];
}

export function DosageCalculator() {
  const [syringeId, setSyringeId] = useState<SyringeId>("0.5");
  const [vialMg, setVialMg] = useState<Num>(5);
  const [dose, setDose] = useState<Num>(0.25);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>("mg");
  const [volumeLimit, setVolumeLimit] = useState<Num>(3);
  const [mode, setMode] = useState<WaterMode>("manual");
  const [manualWater, setManualWater] = useState<Num>(2);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const syringe = SYRINGES[syringeId];

  function changeDoseUnit(unit: DoseUnit) {
    if (dose !== "") setDose(convert(dose, doseUnit, unit));
    setDoseUnit(unit);
  }

  const result = useMemo(() => {
    if (vialMg === "" || dose === "" || vialMg <= 0 || dose <= 0) return null;
    const doseMg = toMg(dose, doseUnit);

    let waterMl: number | null;
    let suggestionWarning: string | null = null;

    if (mode === "auto") {
      const limit = volumeLimit === "" ? syringe.capacityMl * 100 : volumeLimit;
      const s = suggestWater({ vialMg, doseMg, syringe, volumeLimitMl: limit });
      waterMl = s.waterMl;
      suggestionWarning = s.warning;
    } else {
      waterMl = manualWater === "" || manualWater <= 0 ? null : manualWater;
      if (waterMl === null) suggestionWarning = "Enter a water amount above 0.";
    }

    if (waterMl === null) {
      return { waterMl: null, dosage: null, warning: suggestionWarning };
    }

    const dosage = computeDosage({ vialMg, doseMg, waterMl });
    return { waterMl, dosage, warning: dosageWarning(dosage, syringe) };
  }, [vialMg, dose, doseUnit, syringe, mode, volumeLimit, manualWater]);

  // One dose won't fit the syringe: a hard error, not a soft warning.
  const overCapacity =
    result?.dosage != null && result.dosage.drawUnits > syringe.capacityUnits;

  return (
    <div className="space-y-6">
      <DisclaimerBanner />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-300">Syringe size</span>
            {/* Photo + label in one button (drop images in public/syringes — see README). */}
            <div className="grid grid-cols-3 gap-2">
              {SYRINGE_LIST.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSyringeId(s.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2 ${
                    s.id === syringeId
                      ? "border-sky-500 bg-sky-500/15 text-sky-300"
                      : "border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <span className="relative h-14 w-full overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.photo}
                      alt={`${s.label} syringe`}
                      className="absolute inset-0 h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </span>
                  <span className="text-xs">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <NumberField
            label="Vial weight (powder in the vial)"
            value={vialMg}
            onChange={setVialMg}
            unit="mg"
            step={0.5}
          />

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-300">Desired dose</span>
            <div className="flex gap-2">
              <div className="flex-1">
                <NumberField label="" value={dose} onChange={setDose} step={doseUnit === "mcg" ? 50 : 0.05} />
              </div>
              <UnitToggle value={doseUnit} onChange={changeDoseUnit} />
            </div>
          </div>

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-300">BAC water to add</span>
            <div className="mb-2 flex overflow-hidden rounded-lg border border-slate-700 text-sm">
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex-1 px-3 py-1.5 ${mode === "manual" ? "bg-sky-500/15 text-sky-300" : "text-slate-400"}`}
              >
                Enter manually
              </button>
              <button
                type="button"
                onClick={() => setMode("auto")}
                className={`flex-1 px-3 py-1.5 ${mode === "auto" ? "bg-sky-500/15 text-sky-300" : "text-slate-400"}`}
              >
                Pick for me
              </button>
            </div>
            {mode === "manual" ? (
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-1 overflow-hidden rounded-lg border border-slate-700">
                  {WATER_PRESETS.map((ml) => (
                    <button
                      key={ml}
                      type="button"
                      onClick={() => setManualWater(ml)}
                      className={`py-1.5 text-xs ${
                        manualWater === ml
                          ? "bg-sky-500/15 text-sky-300"
                          : "text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {ml}
                    </button>
                  ))}
                </div>
                <NumberField
                  label=""
                  value={manualWater}
                  onChange={setManualWater}
                  unit="mL"
                  step={0.25}
                  hint="The syringe shows the resulting injection dose."
                />
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  We&apos;ll suggest a round water amount that lands each dose on a clean syringe
                  mark.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAdvanced((v) => !v)}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  {showAdvanced ? "▾" : "▸"} Advanced: change vial volume
                </button>
                {showAdvanced ? (
                  <NumberField
                    label="Vial volume limit"
                    value={volumeLimit}
                    onChange={setVolumeLimit}
                    unit="mL"
                    step={0.5}
                    hint="Max water the vial can hold (typically ~3 mL)."
                  />
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Output */}
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          {result?.waterMl != null && result.dosage ? (
            <>
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-4 text-center">
                <p className="text-sm font-medium text-slate-300">Add this much BAC water</p>
                <p className="text-4xl font-bold text-sky-300">{result.waterMl.toFixed(2)} mL</p>
              </div>

              {overCapacity ? (
                <ErrorBox text={result.warning ?? "This dose won't fit the selected syringe."} />
              ) : (
                <>
                  <SyringeGraphic syringe={syringe} drawUnits={result.dosage.drawUnits} />
                  <p className="text-center text-sm text-slate-400">
                    Injection dose:{" "}
                    <span className="font-semibold text-slate-200">
                      {result.dosage.drawUnits.toFixed(1)} units
                    </span>{" "}
                    ({result.dosage.drawMl.toFixed(3)} mL)
                  </p>
                </>
              )}

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Concentration" value={`${result.dosage.concentrationMgPerMl.toFixed(2)} mg/mL`} />
                <Stat label="Doses per vial" value={`${Math.floor(result.dosage.dosesPerVial)}`} />
              </dl>

              {!overCapacity && result.warning ? <Warning text={result.warning} /> : null}
            </>
          ) : (
            <Warning text={result?.warning ?? "Enter your vial weight and dose to begin."} />
          )}
        </div>
      </div>

      {/* Step-by-step reconstitution guide with the computed amounts. */}
      {result?.waterMl != null && result.dosage && !overCapacity ? (
        <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5">
          <h3 className="text-lg font-semibold text-slate-100">Reconstitution guide</h3>
          <ol className="space-y-3">
            {buildReconstitutionSteps({
              vialMg: vialMg as number,
              waterMl: result.waterMl,
              doseLabel: formatDose(toMg(dose as number, doseUnit), doseUnit),
              dosage: result.dosage,
            }).map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-xs font-semibold text-sky-300">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="text-xs text-slate-500">
            Use sterile technique. Swirl, never shake. Store the reconstituted vial as directed for
            the compound (usually refrigerated).
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-800/50 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-200">{value}</dd>
    </div>
  );
}

function Warning({ text }: { text: string }) {
  return (
    <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
      {text}
    </p>
  );
}

function ErrorBox({ text }: { text: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border-2 border-red-500 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-200"
    >
      <span aria-hidden className="text-lg leading-none">
        ⚠
      </span>
      <span>{text}</span>
    </div>
  );
}
