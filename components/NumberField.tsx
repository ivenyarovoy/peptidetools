"use client";

interface NumberFieldProps {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  unit?: string;
  step?: number;
  min?: number;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  unit,
  step = 0.01,
  min = 0,
  placeholder,
  hint,
  disabled,
}: NumberFieldProps) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-sm font-medium text-slate-300">{label}</span>
      ) : null}
      <div className="flex items-stretch overflow-hidden rounded-lg border border-slate-700 bg-slate-900 focus-within:border-sky-500">
        <input
          type="number"
          inputMode="decimal"
          className="w-full bg-transparent px-3 py-2 text-slate-100 outline-none disabled:opacity-50"
          value={value}
          step={step}
          min={min}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
        />
        {unit ? (
          <span className="flex items-center border-l border-slate-700 bg-slate-800 px-3 text-sm text-slate-400">
            {unit}
          </span>
        ) : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
