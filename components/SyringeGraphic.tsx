import { Syringe } from "@/lib/syringes";

interface SyringeGraphicProps {
  syringe: Syringe;
  /** Volume drawn for one dose, in units. */
  drawUnits: number;
}

// Horizontal insulin syringe. Liquid fills the barrel from the needle (right)
// side; the plunger is on the left. Tick marks come from the syringe spec.
export function SyringeGraphic({ syringe, drawUnits }: SyringeGraphicProps) {
  const W = 380;
  const H = 90;
  const barrelLeft = 56;
  const barrelRight = 320;
  const barrelWidth = barrelRight - barrelLeft;
  const barrelTop = 30;
  const barrelHeight = 30;

  const cap = syringe.capacityUnits;
  const fraction = Math.max(0, Math.min(1, drawUnits / cap));
  const fillWidth = fraction * barrelWidth;
  const fillLeft = barrelRight - fillWidth; // fill from the needle end

  // Numbering runs backwards: 0 at the needle tip (right), max at the plunger
  // (left), matching how an insulin syringe is actually read.
  const minorStep = syringe.id === "1.0" ? 2 : 1;
  const ticks: { x: number; units: number; major: boolean }[] = [];
  for (let u = 0; u <= cap; u += minorStep) {
    ticks.push({
      x: barrelRight - (u / cap) * barrelWidth,
      units: u,
      major: u % syringe.majorTickUnits === 0,
    });
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${syringe.label} syringe drawn to ${drawUnits.toFixed(1)} units`}
      className="w-full"
    >
      {/* needle */}
      <line x1={barrelRight} y1={barrelTop + barrelHeight / 2} x2={W - 8} y2={barrelTop + barrelHeight / 2} stroke="#64748b" strokeWidth={2} />
      {/* plunger rod + thumb rest */}
      <line x1={20} y1={barrelTop + barrelHeight / 2} x2={barrelLeft} y2={barrelTop + barrelHeight / 2} stroke="#64748b" strokeWidth={3} />
      <line x1={20} y1={barrelTop - 4} x2={20} y2={barrelTop + barrelHeight + 4} stroke="#64748b" strokeWidth={4} strokeLinecap="round" />

      {/* fill */}
      {fillWidth > 0 ? (
        <rect x={fillLeft} y={barrelTop} width={fillWidth} height={barrelHeight} fill="#38bdf8" fillOpacity={0.55} />
      ) : null}

      {/* barrel outline */}
      <rect x={barrelLeft} y={barrelTop} width={barrelWidth} height={barrelHeight} fill="none" stroke="#94a3b8" strokeWidth={2} rx={3} />

      {/* ticks + labels */}
      {ticks.map((t) => (
        <g key={t.units}>
          <line
            x1={t.x}
            y1={barrelTop}
            x2={t.x}
            y2={barrelTop + (t.major ? 10 : 6)}
            stroke="#94a3b8"
            strokeWidth={t.major ? 1.5 : 0.75}
          />
          {t.major ? (
            <text x={t.x} y={barrelTop + 24} textAnchor="middle" fontSize={9} fill="#cbd5e1">
              {t.units}
            </text>
          ) : null}
        </g>
      ))}

      <text x={barrelLeft} y={barrelTop - 8} fontSize={10} fill="#94a3b8">
        units
      </text>
    </svg>
  );
}
