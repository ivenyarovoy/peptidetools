import { Syringe, UNITS_PER_ML } from "./syringes";

// Reconstitution math, U-100 scale.
//
//   concentration (mg/mL) = vialMg / waterMl
//   drawMl                 = doseMg / concentration = doseMg * waterMl / vialMg
//   drawUnits              = drawMl * 100
//
// vialMg + doseMg alone don't determine waterMl: the amount of water you add
// changes the draw size (units) but not the delivered dose. We resolve the free
// variable by choosing water so the draw lands on a major syringe tick.

export interface DosageInput {
  /** mg of lyophilized powder in the vial. */
  vialMg: number;
  /** Desired dose per injection, in mg. */
  doseMg: number;
  /** BAC water added, in mL. */
  waterMl: number;
}

export interface DosageResult {
  concentrationMgPerMl: number;
  drawMl: number;
  drawUnits: number;
  /** Whole doses available from the vial (ignores residual/dead volume). */
  dosesPerVial: number;
}

export function computeDosage({ vialMg, doseMg, waterMl }: DosageInput): DosageResult {
  const concentrationMgPerMl = vialMg / waterMl;
  const drawMl = doseMg / concentrationMgPerMl;
  return {
    concentrationMgPerMl,
    drawMl,
    drawUnits: drawMl * UNITS_PER_ML,
    dosesPerVial: vialMg / doseMg,
  };
}

export interface SmartWaterInput {
  vialMg: number;
  doseMg: number;
  syringe: Syringe;
  /** Max water the vial can hold, in mL (cap). */
  volumeLimitMl: number;
}

export interface SmartWaterResult {
  /** Suggested BAC water in mL, or null if no tick fits within the limits. */
  waterMl: number | null;
  /** The draw size we targeted, in units (a multiple of the major tick). */
  targetUnits: number | null;
  warning: string | null;
}

/** Round BAC water increments the suggestion is allowed to pick (mL). */
const WATER_STEP_ML = 0.25;
/** Never suggest less than this — too little water is hard to dissolve in the vial. */
const MIN_WATER_ML = 0.25;
const EPS = 1e-6;

/** A draw smaller than this is hard to measure, so we avoid suggesting it. */
const MIN_DRAW_UNITS = 2;

/**
 * Suggest a ROUND BAC water amount (a multiple of 0.25 mL) for one dose.
 *
 * Preferred: a draw that lands exactly on a major syringe tick, chosen nearest
 * the middle of the syringe (and on a whole mL of water when tied).
 *
 * If the dose is so dilute that no tick is reachable within the volume limit
 * (e.g. 5 mg vial, 0.1 mg dose on a 1 mL syringe — 10 units would need 5 mL),
 * we drop the tick requirement and just use the most water (biggest, most
 * measurable draw) instead of forcing a tiny 1-unit draw onto a tick.
 */
export function suggestWater({
  vialMg,
  doseMg,
  syringe,
  volumeLimitMl,
}: SmartWaterInput): SmartWaterResult {
  if (vialMg <= 0 || doseMg <= 0 || volumeLimitMl <= 0) {
    return { waterMl: null, targetUnits: null, warning: "Enter positive vial, dose and volume values." };
  }

  const { majorTickUnits, capacityUnits } = syringe;
  const middle = capacityUnits / 2;

  let tickBest: { water: number; units: number } | null = null;
  let tickScore: [number, number] | null = null;
  let biggestDraw: { water: number; units: number } | null = null;

  for (let water = MIN_WATER_ML; water <= volumeLimitMl + EPS; water += WATER_STEP_ML) {
    const units = (UNITS_PER_ML * doseMg * water) / vialMg; // 100 * dose * water / vial
    if (units < 1 || units > capacityUnits + EPS) continue;

    // Fallback candidate: the largest measurable draw within the limits.
    if (units >= MIN_DRAW_UNITS && (biggestDraw === null || units > biggestDraw.units + EPS)) {
      biggestDraw = { water, units };
    }

    // Preferred: lands exactly on a major tick.
    const nearestTick = Math.round(units / majorTickUnits) * majorTickUnits;
    if (Math.abs(units - nearestTick) <= EPS && nearestTick >= majorTickUnits) {
      const score: [number, number] = [
        Math.abs(nearestTick - middle), // nearest the middle of the syringe
        Math.abs(water - Math.round(water)) < EPS ? 0 : 1, // prefer whole mL over half
      ];
      if (!tickScore || lexLess(score, tickScore)) {
        tickScore = score;
        tickBest = { water, units };
      }
    }
  }

  const best = tickBest ?? biggestDraw;
  if (!best) {
    return {
      waterMl: null,
      targetUnits: null,
      warning:
        "This dose is too dilute to draw measurably on the selected syringe within the volume " +
        "limit. Try a different syringe, raise the volume limit, or enter the water amount manually.",
    };
  }

  return { waterMl: best.water, targetUnits: best.units, warning: null };
}

function lexLess(a: number[], b: number[]): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i] - EPS) return true;
    if (a[i] > b[i] + EPS) return false;
  }
  return false;
}

/** Warn when a manually entered water amount yields an unusable draw. */
export function dosageWarning(result: DosageResult, syringe: Syringe): string | null {
  if (!isFinite(result.drawUnits) || result.drawUnits <= 0) {
    return "Check your inputs — the draw volume is not a valid number.";
  }
  if (result.drawUnits > syringe.capacityUnits) {
    return `One dose (${result.drawUnits.toFixed(1)} units) exceeds this syringe's ${syringe.capacityUnits}-unit capacity. Use a larger syringe or add more water.`;
  }
  if (result.drawUnits < 2) {
    return "One dose is under 2 units — hard to measure accurately. Consider adding more water.";
  }
  return null;
}

/** Warn when so little water is added that the powder is hard to dissolve/measure. */
export function lowWaterWarning(waterMl: number): string | null {
  if (waterMl <= MIN_WATER_ML + EPS) {
    return `Only ${waterMl.toFixed(2)} mL of BAC water — that little is hard to dissolve and measure accurately. Add more if you can.`;
  }
  return null;
}
