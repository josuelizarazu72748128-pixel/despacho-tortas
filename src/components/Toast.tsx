"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

export interface ToastData {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const delay = toast.onAction ? 5000 : 3000;
    const timer = setTimeout(onDismiss, delay);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      key={toast.message}
      className="fixed top-4 left-1/2 z-[200] w-[92%] max-w-sm -translate-x-1/2 animate-toast-in"
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl bg-success-bg px-5 py-3.5 text-success-text shadow-card-hover">
        <span className="flex items-center gap-2 text-sm font-extrabold">
          <CheckCircle2 size={18} />
          {toast.message}
        </span>
        {toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
            className="shrink-0 rounded-full bg-success-text/10 px-3 py-1.5 text-sm font-extrabold underline-offset-2 active:scale-95"
          >
            {toast.actionLabel ?? "Deshacer"}
          </button>
        )}
      </div>
    </div>
  );
}
