// Insulin syringe specifications (all U-100: 1 mL = 100 units).
// `majorTickUnits` is the spacing of the labeled gradations we aim doses to land on.

export type SyringeId = "0.3" | "0.5" | "1.0";

export interface Syringe {
  id: SyringeId;
  /** Capacity in mL. */
  capacityMl: number;
  /** Capacity in U-100 units. */
  capacityUnits: number;
  /** Spacing of the major (labeled) tick marks, in units. */
  majorTickUnits: number;
  label: string;
  /** Path to a photo of this syringe under /public (drop the file there). */
  photo: string;
}

export const SYRINGES: Record<SyringeId, Syringe> = {
  "0.3": {
    id: "0.3",
    capacityMl: 0.3,
    capacityUnits: 30,
    majorTickUnits: 5,
    label: "0.3 mL (30 units)",
    photo: "/syringes/0.3ml.jpg",
  },
  "0.5": {
    id: "0.5",
    capacityMl: 0.5,
    capacityUnits: 50,
    majorTickUnits: 5,
    label: "0.5 mL (50 units)",
    photo: "/syringes/0.5ml.jpg",
  },
  "1.0": {
    id: "1.0",
    capacityMl: 1.0,
    capacityUnits: 100,
    majorTickUnits: 10,
    label: "1 mL (100 units)",
    photo: "/syringes/1ml.jpg",
  },
};

export const SYRINGE_LIST: Syringe[] = [SYRINGES["0.3"], SYRINGES["0.5"], SYRINGES["1.0"]];

/** U-100 scale: 1 mL = 100 units. */
export const UNITS_PER_ML = 100;

export function mlToUnits(ml: number): number {
  return ml * UNITS_PER_ML;
}

export function unitsToMl(units: number): number {
  return units / UNITS_PER_ML;
}
