"use client";

import Image from "next/image";
import { X, Printer, MessageCircle } from "lucide-react";
import type { DispatchRecord } from "@/lib/types";
import { formatBs, formatDateTime } from "@/lib/format";
import { buildWhatsAppShareUrl } from "@/lib/dispatchText";

interface DispatchNoteProps {
  record: DispatchRecord;
  onClose: () => void;
}

export default function DispatchNote({ record, onClose }: DispatchNoteProps) {
  return (
    <div className="fixed inset-0 z-[160] flex items-start justify-center overflow-y-auto bg-brown/40 px-4 py-6 animate-fade-in print:bg-white print:p-0">
      <div
        id="nota-despacho"
        className="w-full max-w-md rounded-[20px] bg-white p-6 shadow-card-hover animate-pop-in print:shadow-none"
      >
        <div className="mb-4 flex items-start justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-peach-soft">
              <Image src="/logo.png" alt="Gema Pastelería" width={28} height={28} className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="font-heading text-base font-bold text-brown-strong">Nota de despacho</p>
              <p className="text-xs font-bold text-brown-soft">#{record.number}</p>
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

        <div className="hidden items-center gap-3 border-b border-dashed border-border-soft pb-3 print:mb-3 print:flex">
          <Image src="/logo.png" alt="Gema Pastelería" width={36} height={36} className="h-9 w-9 object-contain" />
          <div>
            <p className="font-heading text-lg font-bold text-brown-strong">Gema Pastelería</p>
            <p className="text-xs font-bold text-brown-soft">Nota de despacho #{record.number}</p>
          </div>
        </div>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-brown-soft">Lugar</dt>
            <dd className="text-right font-extrabold text-brown-strong">{record.placeName}</dd>
          </div>
          {record.driverName && (
            <div className="flex justify-between gap-3">
              <dt className="font-bold text-brown-soft">Chofer</dt>
              <dd className="text-right font-extrabold text-brown-strong">{record.driverName}</dd>
            </div>
          )}
          <div className="flex justify-between gap-3">
            <dt className="font-bold text-brown-soft">Fecha y hora</dt>
            <dd className="text-right font-extrabold text-brown-strong">
              {formatDateTime(record.dateISO)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 space-y-1.5 border-t border-dashed border-border-soft pt-3">
          {record.items.map((item) => (
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
          <span className="font-heading text-xl font-extrabold text-terracotta-dark">
            {formatBs(record.total)}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-peach-soft text-base font-bold text-brown-strong active:scale-95"
          >
            <Printer size={18} />
            Imprimir / Descargar PDF
          </button>
          <a
            href={buildWhatsAppShareUrl(record)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-success-bg text-base font-bold text-success-text active:scale-95"
          >
            <MessageCircle size={18} />
            Compartir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
