"use client";

import { X, ClipboardCheck } from "lucide-react";
import type { DispatchItem } from "@/lib/types";
import { formatBs, formatDateTime } from "@/lib/format";

interface DispatchSummaryModalProps {
  open: boolean;
  number: number;
  placeName: string;
  driverName: string;
  dateISO: string;
  items: DispatchItem[];
  total: number;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DispatchSummaryModal({
  open,
  number,
  placeName,
  driverName,
  dateISO,
  items,
  total,
  onConfirm,
  onClose,
}: DispatchSummaryModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-start justify-center overflow-y-auto bg-brown/40 px-4 py-6 animate-fade-in">
      <div className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-card-hover animate-pop-in">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-soft text-orange-700">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <p className="font-heading text-base font-bold text-brown-strong">Resumen del despacho</p>
              <p className="text-xs font-bold text-brown-soft">Despacho #{number}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-peach-soft text-brown-strong active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-brown-soft">Lugar</dt>
            <dd className="text-right font-extrabold text-brown-strong">{placeName}</dd>
          </div>
          {driverName && (
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-brown-soft">Chofer</dt>
              <dd className="text-right font-extrabold text-brown-strong">{driverName}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-brown-soft">Fecha y hora</dt>
            <dd className="text-right font-extrabold text-brown-strong">{formatDateTime(dateISO)}</dd>
          </div>
        </dl>

        <div className="mt-4 max-h-[40vh] space-y-1.5 overflow-y-auto border-t border-dashed border-border-soft pt-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 text-brown">
                {item.qty} × {item.name}
              </span>
              <span className="shrink-0 font-bold text-terracotta">{formatBs(item.subtotal)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-peach-soft px-4 py-3">
          <span className="font-heading text-sm font-bold text-terracotta-dark">Total</span>
          <span className="font-heading text-xl font-extrabold text-terracotta-dark">{formatBs(total)}</span>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="gradient-btn flex h-[52px] items-center justify-center rounded-2xl text-base font-bold text-white shadow-btn active:scale-95"
          >
            Confirmar y guardar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[52px] items-center justify-center rounded-2xl bg-peach-soft text-base font-bold text-brown-strong active:scale-95"
          >
            Seguir editando
          </button>
        </div>
      </div>
    </div>
  );
}
