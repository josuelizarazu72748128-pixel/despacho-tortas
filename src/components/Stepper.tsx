"use client";

import { useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { tapFeedback } from "@/lib/haptics";

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
}

const HOLD_DELAY = 420;
const HOLD_INTERVAL = 100;

export default function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 9999,
}: StepperProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? String(value);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdFiredRef = useRef(false);

  function clamp(n: number) {
    return Math.min(max, Math.max(min, n));
  }

  function apply(delta: number) {
    tapFeedback();
    onChange(clamp(Math.round((value + delta) * 100) / 100));
  }

  function startHold(delta: number) {
    stopHold();
    holdFiredRef.current = false;
    timeoutRef.current = setTimeout(() => {
      holdFiredRef.current = true;
      apply(delta);
      intervalRef.current = setInterval(() => apply(delta), HOLD_INTERVAL);
    }, HOLD_DELAY);
  }

  function stopHold() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }

  function handleClick(delta: number) {
    if (holdFiredRef.current) {
      holdFiredRef.current = false;
      return;
    }
    apply(delta);
  }

  function commit(raw: string) {
    const parsed = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    const safe = Number.isFinite(parsed) ? clamp(parsed) : value;
    onChange(safe);
    setDraft(null);
  }

  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        aria-label="Restar"
        disabled={value <= min}
        onPointerDown={() => startHold(-step)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={() => handleClick(-step)}
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-peach-soft text-terracotta-dark shadow-card transition-transform duration-150 active:scale-90 disabled:opacity-35"
      >
        <Minus size={24} strokeWidth={2.75} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onFocus={(e) => e.target.select()}
        className="h-14 w-16 rounded-2xl border-2 border-border-soft bg-white text-center text-lg font-extrabold text-foreground focus:border-orange-700 focus:outline-none"
      />
      <button
        type="button"
        aria-label="Sumar"
        onPointerDown={() => startHold(step)}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onPointerCancel={stopHold}
        onClick={() => handleClick(step)}
        className="gradient-btn flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-btn transition-transform duration-150 active:scale-90"
      >
        <Plus size={24} strokeWidth={2.75} />
      </button>
    </div>
  );
}
