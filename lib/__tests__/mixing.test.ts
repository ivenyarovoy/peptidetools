import { describe, it, expect } from "vitest";
import { computeMix, MixCompound } from "../mixing";

// Representative mixes, including ones whose transfer fractions are large.
const SCENARIOS: { name: string; compounds: MixCompound[] }[] = [
  {
    name: "two compounds, matching ratio",
    compounds: [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ],
  },
  {
    name: "five compounds with large fractions",
    compounds: [
      { name: "A", vialMg: 33, doseMg: 1 },
      { name: "B", vialMg: 11, doseMg: 1 },
      { name: "C", vialMg: 100, doseMg: 1 },
      { name: "D", vialMg: 18, doseMg: 1 },
      { name: "E", vialMg: 18, doseMg: 1 },
    ],
  },
  {
    name: "mixed dose scales",
    compounds: [
      { name: "X", vialMg: 5, doseMg: 0.25 },
      { name: "Y", vialMg: 10, doseMg: 0.5 },
      { name: "Z", vialMg: 2, doseMg: 0.1 },
    ],
  },
];

describe("computeMix", () => {
  it("combines two whole vials when doses already match the vial ratio", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, injectionUnits: 10, volumeLimitMl: 3 });

    expect(r.injections).toBe(20);
    expect(r.drawUnits).toBe(10); // exactly what the user asked for
    expect(r.compounds.every((c) => c.fraction === 1)).toBe(true);
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
    const r = computeMix({ compounds, injectionUnits: 10, volumeLimitMl: 3 });

    expect(r.injections).toBe(20); // limited by B
    const a = r.compounds.find((c) => c.name === "A")!;
    const b = r.compounds.find((c) => c.name === "B")!;

    expect(b.isAnchor).toBe(true);
    expect(b.fraction).toBe(1);
    expect(a.fraction).toBeCloseTo(0.5); // transfer half of vial A
    expect(a.transferMl).toBeCloseTo(0.5); // reconstitute in 1 mL, draw 0.5 mL

    expect(a.finalConcMgPerMl * r.drawMl).toBeCloseTo(0.25);
    expect(b.finalConcMgPerMl * r.drawMl).toBeCloseTo(0.5);
  });

  it("uses the requested injection size verbatim regardless of the doses", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r25 = computeMix({ compounds, injectionUnits: 25, volumeLimitMl: 5 });
    const r10 = computeMix({ compounds, injectionUnits: 10, volumeLimitMl: 5 });
    expect(r25.drawUnits).toBe(25);
    expect(r10.drawUnits).toBe(10);
    // Same delivered dose either way — only the final volume differs.
    for (const c of r25.compounds) {
      expect(c.finalConcMgPerMl * r25.drawMl).toBeCloseTo(c.doseMg);
    }
  });

  it("caps the final volume at the limit and reduces the injection size to fit", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 5, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    // 20 injections x 0.5 mL would be 10 mL; capped to the 3 mL limit.
    const r = computeMix({ compounds, injectionUnits: 50, volumeLimitMl: 3 });
    expect(r.finalVolumeMl).toBeLessThanOrEqual(3 + 1e-9);
    expect(r.drawUnits).toBeLessThan(50);
    expect(r.warnings.join(" ")).toMatch(/reduced/);
    // Doses are still exact after the cap.
    for (const c of r.compounds) {
      expect(c.finalConcMgPerMl * r.drawMl).toBeCloseTo(c.doseMg, 6);
    }
  });

  it("never lets the final volume exceed the limit, across many injection sizes", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 33, doseMg: 1 },
      { name: "B", vialMg: 11, doseMg: 1 },
      { name: "C", vialMg: 18, doseMg: 1 },
    ];
    for (const injectionUnits of [5, 20, 50, 100, 500]) {
      for (const volumeLimitMl of [1, 2, 3]) {
        const r = computeMix({ compounds, injectionUnits, volumeLimitMl });
        expect(r.finalVolumeMl).toBeLessThanOrEqual(volumeLimitMl + 1e-9);
      }
    }
  });

  it("blocks with fewer than two compounds", () => {
    const r = computeMix({
      compounds: [{ name: "A", vialMg: 5, doseMg: 0.25 }],
      injectionUnits: 20,
      volumeLimitMl: 3,
    });
    expect(r.ok).toBe(false);
    expect(r.warnings[0]).toMatch(/at least two/);
  });

  it("blocks a non-positive injection size", () => {
    const r = computeMix({
      compounds: [
        { name: "A", vialMg: 5, doseMg: 0.25 },
        { name: "B", vialMg: 10, doseMg: 0.5 },
      ],
      injectionUnits: 0,
      volumeLimitMl: 3,
    });
    expect(r.ok).toBe(false);
    expect(r.warnings[0]).toMatch(/Injection size/);
  });

  it("produces human-readable steps", () => {
    const compounds: MixCompound[] = [
      { name: "A", vialMg: 10, doseMg: 0.25 },
      { name: "B", vialMg: 10, doseMg: 0.5 },
    ];
    const r = computeMix({ compounds, injectionUnits: 10, volumeLimitMl: 3 });
    expect(r.steps.length).toBeGreaterThanOrEqual(3);
    expect(r.steps.join(" ")).toMatch(/inject it into the B vial/);
  });
});

// Safety net: whatever the injection size, nobody should ever get a wrong dose
// or a transfer they can't draw with a 1 mL syringe.
describe("computeMix dose-safety invariants", () => {
  const injectionSizes = [5, 10, 20, 50];

  for (const scenario of SCENARIOS) {
    for (const injectionUnits of injectionSizes) {
      it(`${scenario.name} @ ${injectionUnits} units: every injection delivers each target dose exactly`, () => {
        const r = computeMix({ compounds: scenario.compounds, injectionUnits, volumeLimitMl: 100 });

        for (const c of r.compounds) {
          const original = scenario.compounds.find((x) => x.name === c.name)!;
          // THE critical property: a single draw delivers the target dose.
          expect(c.finalConcMgPerMl * r.drawMl).toBeCloseTo(original.doseMg, 6);
          expect(c.mgInMix).toBeCloseTo(original.doseMg * r.injections, 6);
        }
      });

      it(`${scenario.name} @ ${injectionUnits} units: every transfer is drawable and carries the right mg`, () => {
        const r = computeMix({ compounds: scenario.compounds, injectionUnits, volumeLimitMl: 100 });

        for (const c of r.compounds) {
          if (c.isAnchor) {
            expect(c.transferMl).toBeNull();
            continue;
          }
          // Drawable on a standard 1 mL syringe.
          expect(c.transferMl!).toBeLessThanOrEqual(1 + 1e-9);
          // The drawn volume carries exactly the mg destined for the mix.
          const mgDrawn = c.transferMl! * (c.vialMg / c.reconstituteMl!);
          expect(mgDrawn).toBeCloseTo(c.mgInMix, 6);
        }
      });

      it(`${scenario.name} @ ${injectionUnits} units: volumes reconcile`, () => {
        const r = computeMix({ compounds: scenario.compounds, injectionUnits, volumeLimitMl: 100 });
        const transfers = r.compounds.reduce((sum, c) => sum + (c.transferMl ?? 0), 0);
        expect(transfers + r.anchorWaterMl).toBeCloseTo(r.finalVolumeMl, 6);
        expect(r.anchorWaterMl).toBeGreaterThanOrEqual(-1e-9);
      });
    }
  }
});
