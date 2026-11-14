"use client";

import { useState } from "react";
import { MapPin, Hash, CheckCircle2 } from "lucide-react";

const STEPS = [
  {
    Icon: MapPin,
    title: "1. Elige el lugar",
    text: "Toca el lugar de destino al que vas a despachar. Así cargamos sus precios automáticamente.",
  },
  {
    Icon: Hash,
    title: "2. Marca cantidades",
    text: "Usa los botones + y − en cada producto. Lo que marques se resalta en durazno para que lo veas de un vistazo.",
  },
  {
    Icon: CheckCircle2,
    title: "3. Confirma y guarda",
    text: "Revisa el resumen, confirma y listo: queda guardado en el historial, listo para imprimir o compartir.",
  },
];

interface OnboardingGuideProps {
  open: boolean;
  onFinish: () => void;
}

export default function OnboardingGuide({ open, onFinish }: OnboardingGuideProps) {
  const [step, setStep] = useState(0);
  if (!open) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center bg-brown/50 px-5 animate-fade-in">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-7 text-center shadow-card-hover animate-pop-in">
        <button
          type="button"
          onClick={onFinish}
          className="mb-2 ml-auto block text-sm font-bold text-brown-soft active:scale-95"
        >
          Saltar
        </button>

        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-peach-soft text-orange-700">
          <current.Icon size={30} strokeWidth={2} />
        </div>
        <h2 className="font-heading text-lg font-bold text-brown-strong">{current.title}</h2>
        <p className="mt-2 text-sm font-semibold text-brown-soft">{current.text}</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-2 rounded-full transition-all duration-150 ${
                i === step ? "w-6 bg-orange-700" : "w-2 bg-border-soft"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
          className="gradient-btn mt-6 flex h-[52px] w-full items-center justify-center rounded-2xl text-base font-bold text-white shadow-btn active:scale-95"
        >
          {isLast ? "Empezar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
