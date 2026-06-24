import { describe, it, expect } from "vitest";
import { computeMix, MixCompound } from "../mixing";
import { SYRINGES } from "../syringes";

const syringe = SYRINGES["0.5"];

describe("computeMix", () => {
  it("combines two whole vials when doses already match the vial ratio", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, syringe, volumeLimitMl: 3 });

    expect(r.injections).toBe(20);
    // Both vials fully used.
    expect(r.compounds.every((c) => c.fraction === 1)).toBe(true);
    // Each draw delivers exactly the target dose of each compound.
    for (const c of r.compounds) {
      expect(c.finalConcMgPerMl * r.drawMl).toBeCloseTo(c.doseMg);
    }
    expect(r.warnings).toEqual([]);
  });

  it("uses a partial transfer when the desired dose ratio differs (transfer half of A)", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 10, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, syringe, volumeLimitMl: 3 });

    expect(r.injections).toBe(20); // limited by B
    const a = r.compounds.find((c) => c.name === "A")!;
    const b = r.compounds.find((c) => c.name === "B")!;

    expect(b.isAnchor).toBe(true);
    expect(b.fraction).toBe(1);
    expect(a.fraction).toBeCloseTo(0.5); // transfer half of vial A
    expect(a.transferMl).toBeCloseTo(0.5); // reconstitute in 1 mL, draw 0.5 mL

    // Doses still exact.
    expect(a.finalConcMgPerMl * r.drawMl).toBeCloseTo(0.25);
    expect(b.finalConcMgPerMl * r.drawMl).toBeCloseTo(0.5);
  });

  it("keeps the final volume within the limit and water non-negative", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, syringe, volumeLimitMl: 3 });
    expect(r.finalVolumeMl).toBeLessThanOrEqual(3 + 1e-9);
    expect(r.anchorWaterMl).toBeGreaterThanOrEqual(0);
    // Transfers + anchor water reconstruct the final volume.
    const transfers = r.compounds.reduce((s, c) => s + (c.transferMl ?? 0), 0);
    expect(transfers + r.anchorWaterMl).toBeCloseTo(r.finalVolumeMl);
  });

  it("warns when the per-injection draw can't reach one major tick", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 100, doseMg: 0.1 },
      { name: "B", vialMg: 10, doseMg: 0.01 },
    ];
    const r = computeMix({ compounds, syringe, volumeLimitMl: 3 });
    expect(r.injections).toBe(1000);
    expect(r.warnings.join(" ")).toMatch(/major syringe tick/);
  });

  it("blocks with fewer than two compounds", () => {
    const r = computeMix({
      compounds: [{ name: "A", vialMg: 5, doseMg: 0.25 }],
      syringe,
      volumeLimitMl: 3,
    });
    expect(r.ok).toBe(false);
    expect(r.warnings[0]).toMatch(/at least two/);
  });

  it("produces human-readable steps", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 10, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, syringe, volumeLimitMl: 3 });
    expect(r.steps.length).toBeGreaterThanOrEqual(3);
    expect(r.steps.join(" ")).toMatch(/inject it into the B vial/);
  });
});
