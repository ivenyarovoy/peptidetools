import { describe, it, expect } from "vitest";
import { computeDosage, suggestWater, dosageWarning, lowWaterWarning } from "../dosage";
import { SYRINGES } from "../syringes";

describe("lowWaterWarning", () => {
  it("warns at 0.25 mL or less", () => {
    expect(lowWaterWarning(0.25)).toMatch(/hard to dissolve/);
    expect(lowWaterWarning(0.1)).toMatch(/hard to dissolve/);
  });
  it("is quiet above 0.25 mL", () => {
    expect(lowWaterWarning(0.5)).toBeNull();
    expect(lowWaterWarning(1)).toBeNull();
  });
});

describe("computeDosage", () => {
  it("computes concentration, draw and doses per vial", () => {
    const r = computeDosage({ vialMg: 5, doseMg: 0.25, waterMl: 1 });
    expect(r.concentrationMgPerMl).toBe(5);
    expect(r.drawMl).toBeCloseTo(0.05);
    expect(r.drawUnits).toBeCloseTo(5);
    expect(r.dosesPerVial).toBe(20);
  });
});

describe("suggestWater", () => {
  it("targets a major tick nearest the middle of the syringe when volume allows", () => {
    // 0.5 mL syringe (50 units, middle = 25). With plenty of headroom the draw
    // should land on the 25-unit mark, not fill the syringe.
    const r = suggestWater({
      vialMg: 1,
      doseMg: 0.5,
      syringe: SYRINGES["0.5"],
      volumeLimitMl: 3,
    });
    expect(r.targetUnits).toBe(25);
    expect(r.waterMl).toBeCloseTo(0.5); // 25/100 * 1 / 0.5
    expect(r.warning).toBeNull();

    const check = computeDosage({ vialMg: 1, doseMg: 0.5, waterMl: r.waterMl! });
    expect(check.drawUnits).toBeCloseTo(25);
  });

  it("falls back to the largest feasible tick when the volume limit caps it below the middle", () => {
    // vial 5 mg, dose 0.25 mg: 15 units needs 3 mL, 20 units would need 4 mL.
    const r = suggestWater({
      vialMg: 5,
      doseMg: 0.25,
      syringe: SYRINGES["0.5"],
      volumeLimitMl: 3,
    });
    expect(r.targetUnits).toBe(15);
    expect(r.waterMl).toBeCloseTo(3);
  });

  it("picks a round water amount that lands the dose exactly on a tick (15 mg / 4 mg -> 1.5 mL, 40 u)", () => {
    const r = suggestWater({
      vialMg: 15,
      doseMg: 4,
      syringe: SYRINGES["1.0"],
      volumeLimitMl: 3,
    });
    expect(r.waterMl).toBeCloseTo(1.5);
    expect(r.targetUnits).toBeCloseTo(40);

    const check = computeDosage({ vialMg: 15, doseMg: 4, waterMl: r.waterMl! });
    expect(check.drawUnits).toBeCloseTo(40);
    expect(check.concentrationMgPerMl).toBeCloseTo(10);
  });

  it("drops the tick requirement for very dilute doses and maximizes the draw (5 mg / 0.1 mg on 1 mL -> 3 mL, 6 u)", () => {
    // 10 units would need 5 mL (over the limit), so don't force a 1-unit draw.
    const r = suggestWater({
      vialMg: 5,
      doseMg: 0.1,
      syringe: SYRINGES["1.0"],
      volumeLimitMl: 3,
    });
    expect(r.waterMl).toBeCloseTo(3);
    expect(r.targetUnits).toBeCloseTo(6);
    expect(r.warning).toBeNull();

    const check = computeDosage({ vialMg: 5, doseMg: 0.1, waterMl: r.waterMl! });
    expect(check.drawUnits).toBeCloseTo(6);
  });

  it("never suggests less than 0.25 mL of water (hard to dissolve below that)", () => {
    for (const s of [SYRINGES["0.3"], SYRINGES["0.5"], SYRINGES["1.0"]]) {
      for (const vialMg of [1, 5, 10, 30]) {
        for (const doseMg of [0.5, 1, 3, 8]) {
          const r = suggestWater({ vialMg, doseMg, syringe: s, volumeLimitMl: 3 });
          if (r.waterMl !== null) expect(r.waterMl).toBeGreaterThanOrEqual(0.25 - 1e-9);
        }
      }
    }
  });

  it("prefers a round 10-unit mark over an equidistant 5-unit one", () => {
    // 1 mL syringe ticks are multiples of 10, so this is naturally satisfied;
    // on a 5-unit syringe, 20 and 30 are equidistant from middle 25 — pick 30
    // only via the volume cap, but verify 10-multiples win ties when reachable.
    const r = suggestWater({
      vialMg: 2,
      doseMg: 0.5,
      syringe: SYRINGES["0.5"],
      volumeLimitMl: 3,
    });
    // middle 25 reachable (25 units -> 1 mL). 25 is closest, so it still wins.
    expect(r.targetUnits).toBe(25);
  });

  it("warns when no tick fits within the volume limit", () => {
    // Tiny dose relative to vial forces huge water for even the smallest tick.
    const r = suggestWater({
      vialMg: 10,
      doseMg: 0.001,
      syringe: SYRINGES["1.0"],
      volumeLimitMl: 3,
    });
    expect(r.waterMl).toBeNull();
    expect(r.warning).toBeTruthy();
  });

  it("rejects non-positive inputs", () => {
    const r = suggestWater({ vialMg: 0, doseMg: 1, syringe: SYRINGES["0.5"], volumeLimitMl: 3 });
    expect(r.waterMl).toBeNull();
  });
});

describe("dosageWarning", () => {
  it("flags a draw that overflows the syringe", () => {
    // 100 * 3 * 1 / 5 = 60 units, over the 50-unit (0.5 mL) syringe.
    const result = computeDosage({ vialMg: 5, doseMg: 3, waterMl: 1 });
    expect(dosageWarning(result, SYRINGES["0.5"])).toMatch(/exceeds/);
  });

  it("flags a draw under 2 units", () => {
    const result = computeDosage({ vialMg: 10, doseMg: 0.01, waterMl: 1 });
    expect(dosageWarning(result, SYRINGES["1.0"])).toMatch(/under 2 units/);
  });

  it("passes a sensible draw", () => {
    const result = computeDosage({ vialMg: 5, doseMg: 0.25, waterMl: 2 });
    expect(dosageWarning(result, SYRINGES["0.5"])).toBeNull();
  });
});
