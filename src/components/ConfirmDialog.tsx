"use client";

import type { ReactNode } from "react";

export interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}

interface ConfirmDialogProps {
  open: boolean;
  icon?: ReactNode;
  title: string;
  message?: string;
  actions: ModalAction[];
}

const VARIANT_CLASSES: Record<NonNullable<ModalAction["variant"]>, string> = {
  primary: "gradient-btn text-white shadow-btn",
  secondary: "bg-peach-soft text-brown-strong",
  danger: "bg-danger-text text-white",
};

export default function ConfirmDialog({ open, icon, title, message, actions }: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-brown/40 px-4 animate-fade-in">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-card-hover animate-pop-in">
        {icon && (
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-peach-soft text-orange-700">
            {icon}
          </div>
        )}
        <h3 className="font-heading text-lg font-bold text-brown-strong">{title}</h3>
        {message && <p className="mt-1.5 text-sm font-semibold text-brown-soft">{message}</p>}
        <div className="mt-5 flex flex-col gap-2">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`h-[52px] rounded-2xl text-base font-bold transition-transform duration-150 active:scale-95 ${VARIANT_CLASSES[action.variant ?? "secondary"]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
