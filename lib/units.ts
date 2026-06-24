// Dose unit handling. All calculation math works in mg internally; convert at
// the UI boundary so the user can enter and read values in mg or mcg.

export type DoseUnit = "mg" | "mcg";

export function toMg(value: number, unit: DoseUnit): number {
  return unit === "mcg" ? value / 1000 : value;
}

export function fromMg(mg: number, unit: DoseUnit): number {
  return unit === "mcg" ? mg * 1000 : mg;
}

/** Convert a displayed value from one unit to another (keeps the real dose fixed). */
export function convert(value: number, from: DoseUnit, to: DoseUnit): number {
  const v = fromMg(toMg(value, from), to);
  return Number(v.toFixed(to === "mcg" ? 1 : 4));
}

/** Format an mg amount in the requested unit, e.g. 0.25 mg -> "250 mcg". */
export function formatDose(mg: number, unit: DoseUnit): string {
  const v = fromMg(mg, unit);
  return `${Number(v.toFixed(unit === "mcg" ? 1 : 3))} ${unit}`;
}
