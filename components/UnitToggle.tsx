"use client";

import { DoseUnit } from "@/lib/units";

interface UnitToggleProps {
  value: DoseUnit;
  onChange: (unit: DoseUnit) => void;
  className?: string;
}

export function UnitToggle({ value, onChange, className }: UnitToggleProps) {
  return (
    <div className={`flex overflow-hidden rounded-lg border border-slate-700 ${className ?? ""}`}>
      {(["mg", "mcg"] as DoseUnit[]).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={`px-3 py-2 text-sm ${
            u === value ? "bg-sky-500/15 text-sky-300" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
