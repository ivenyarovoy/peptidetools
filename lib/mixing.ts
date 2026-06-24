import { Syringe, UNITS_PER_ML } from "./syringes";

// Mixing 2+ lyophilized compounds into one vial you draw from once per injection.
//
// Once everything sits in one vial at total volume V, drawing volume v delivers
//   doseᵢ = mgᵢ_in_mix * v / V
// so the per-injection ratio is fixed by the mg ratio in the mix. To hit
// independent target doses we control how many mg of each compound enter the
// mix — reconstituting each vial separately and transferring only the fraction
// needed. The compound that runs out first (smallest vialMg / doseMg) is the
// "anchor": it's used whole and sets the number of injections N.

export interface MixCompound {
  name: string;
  /** mg of powder in this vial. */
  vialMg: number;
  /** Desired dose per injection, in mg. */
  doseMg: number;
}

export interface MixInput {
  compounds: MixCompound[];
  syringe: Syringe;
  /** Max volume the final mixing vial can hold, in mL. */
  volumeLimitMl: number;
  /** Water used to reconstitute each non-anchor vial before transferring, mL. */
  reconstituteMl?: number;
}

export interface MixCompoundPlan {
  name: string;
  vialMg: number;
  doseMg: number;
  isAnchor: boolean;
  /** mg of this compound that end up in the final mix. */
  mgInMix: number;
  /** Fraction of the vial's powder used (1 for the anchor). */
  fraction: number;
  /** Water to reconstitute this vial with before transfer (non-anchor only), mL. */
  reconstituteMl: number | null;
  /** Volume to draw from this vial and inject into the mix (non-anchor only), mL. */
  transferMl: number | null;
  transferUnits: number | null;
  finalConcMgPerMl: number;
}

export interface MixResult {
  ok: boolean;
  injections: number;
  finalVolumeMl: number;
  drawMl: number;
  drawUnits: number;
  /** Water added directly to the anchor/mixing vial, mL. */
  anchorWaterMl: number;
  compounds: MixCompoundPlan[];
  steps: string[];
  warnings: string[];
}

const MIN_MEASURABLE_UNITS = 2; // < 2 units (0.02 mL) is hard to measure accurately.

export function computeMix(input: MixInput): MixResult {
  const { compounds, syringe, volumeLimitMl } = input;
  const reconstituteMl = input.reconstituteMl ?? 1.0;
  const warnings: string[] = [];

  if (compounds.length < 2) {
    return blocked("Add at least two compounds to mix.");
  }
  if (compounds.some((c) => c.vialMg <= 0 || c.doseMg <= 0)) {
    return blocked("Every compound needs a positive vial weight and dose.");
  }
  if (volumeLimitMl <= 0) {
    return blocked("Volume limit must be positive.");
  }

  // Anchor = compound that supports the fewest injections; it's used whole.
  const maxInjections = compounds.map((c) => c.vialMg / c.doseMg);
  const injections = Math.min(...maxInjections);
  const anchorIndex = maxInjections.indexOf(injections);

  // Draw size: largest major-tick draw that fits both the syringe and the
  // volume limit (final volume V = injections * draw must be <= limit).
  const maxUnitsByVolume = (UNITS_PER_ML * volumeLimitMl) / injections;
  const maxUnits = Math.min(syringe.capacityUnits, maxUnitsByVolume);
  const ticks = Math.floor(maxUnits / syringe.majorTickUnits);

  let drawUnits: number;
  if (ticks >= 1) {
    drawUnits = ticks * syringe.majorTickUnits;
  } else {
    // Can't reach even one major tick; fall back to the largest draw that fits.
    drawUnits = maxUnits;
    warnings.push(
      "The per-injection draw is smaller than one major syringe tick. Consider a smaller syringe or a higher volume limit.",
    );
  }

  const drawMl = drawUnits / UNITS_PER_ML;
  const finalVolumeMl = injections * drawMl;

  // Transfer plan per compound.
  const plans: MixCompoundPlan[] = compounds.map((c, i) => {
    const isAnchor = i === anchorIndex;
    const mgInMix = c.doseMg * injections;
    const fraction = mgInMix / c.vialMg;
    const transferMl = isAnchor ? null : fraction * reconstituteMl;
    return {
      name: c.name || `Compound ${i + 1}`,
      vialMg: c.vialMg,
      doseMg: c.doseMg,
      isAnchor,
      mgInMix,
      fraction,
      reconstituteMl: isAnchor ? null : reconstituteMl,
      transferMl,
      transferUnits: transferMl === null ? null : transferMl * UNITS_PER_ML,
      finalConcMgPerMl: mgInMix / finalVolumeMl,
    };
  });

  // Water added straight to the anchor vial = final volume minus transferred liquid.
  const transferredMl = plans.reduce((sum, p) => sum + (p.transferMl ?? 0), 0);
  const anchorWaterMl = finalVolumeMl - transferredMl;

  if (anchorWaterMl < 0) {
    warnings.push(
      "Transfers add up to more than the final volume. Lower the reconstitution volume for each vial.",
    );
  }
  for (const p of plans) {
    if (p.transferUnits !== null && p.transferUnits < MIN_MEASURABLE_UNITS) {
      warnings.push(
        `Transfer for ${p.name} (${p.transferUnits.toFixed(1)} units) is tiny and hard to measure. Increase its reconstitution volume.`,
      );
    }
  }
  if (finalVolumeMl > volumeLimitMl + 1e-9) {
    warnings.push(
      `Final volume (${finalVolumeMl.toFixed(2)} mL) exceeds the ${volumeLimitMl} mL limit.`,
    );
  }

  const steps = buildSteps(plans, anchorWaterMl, finalVolumeMl, drawMl, drawUnits, injections);

  return {
    ok: warnings.length === 0,
    injections,
    finalVolumeMl,
    drawMl,
    drawUnits,
    anchorWaterMl,
    compounds: plans,
    steps,
    warnings,
  };
}

function buildSteps(
  plans: MixCompoundPlan[],
  anchorWaterMl: number,
  finalVolumeMl: number,
  drawMl: number,
  drawUnits: number,
  injections: number,
): string[] {
  const anchor = plans.find((p) => p.isAnchor)!;
  const others = plans.filter((p) => !p.isAnchor);
  const steps: string[] = [];

  steps.push(
    `Reconstitute ${anchor.name} (the mixing vial) with ${fmt(anchorWaterMl)} mL of BAC water.`,
  );
  for (const p of others) {
    steps.push(
      `Reconstitute ${p.name} with ${fmt(p.reconstituteMl!)} mL of BAC water, then draw ${fmt(
        p.transferMl!,
      )} mL (${fmt(p.transferUnits!, 0)} units) and inject it into the ${anchor.name} vial.`,
    );
  }
  steps.push(
    `The mixing vial now holds ${fmt(finalVolumeMl)} mL total. Draw ${fmt(drawMl)} mL (${fmt(
      drawUnits,
      0,
    )} units) per injection — that's ${Math.floor(injections)} injection${
      Math.floor(injections) === 1 ? "" : "s"
    }, each delivering the target dose of every compound.`,
  );
  return steps;
}

function fmt(n: number, decimals = 2): string {
  return Number(n.toFixed(decimals)).toString();
}

function blocked(message: string): MixResult {
  return {
    ok: false,
    injections: 0,
    finalVolumeMl: 0,
    drawMl: 0,
    drawUnits: 0,
    anchorWaterMl: 0,
    compounds: [],
    steps: [],
    warnings: [message],
  };
}
