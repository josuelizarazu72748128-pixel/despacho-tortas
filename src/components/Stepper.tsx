"use client";

import { useState } from "react";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
}

export default function Stepper({ value, onChange, step = 1 }: StepperProps) {
  // Mientras el usuario edita el campo, "draft" manda; al perder el foco se
  // confirma y volvemos a reflejar el valor real (prop) en el input.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(value);

  function commit(raw: string) {
    const parsed = parseFloat(raw.replace(",", "."));
    const safe = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    onChange(safe);
    setDraft(null);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Restar"
        onClick={() => onChange(Math.max(0, Math.round((value - step) * 100) / 100))}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-peach-200 text-2xl font-bold text-orange-strong-700 active:scale-90 active:bg-peach-300 sm:h-12 sm:w-12"
      >
        −
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={text}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="h-11 w-14 rounded-lg border border-peach-300 bg-white text-center text-base font-semibold text-foreground sm:h-12 sm:w-16 sm:text-lg"
      />
      <button
        type="button"
        aria-label="Sumar"
        onClick={() => onChange(Math.round((value + step) * 100) / 100)}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-strong-500 text-2xl font-bold text-white active:scale-90 active:bg-orange-strong-600 sm:h-12 sm:w-12"
      >
        +
      </button>
    </div>
  );
}
