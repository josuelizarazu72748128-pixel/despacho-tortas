"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, FileText, Trash2 } from "lucide-react";
import { useData } from "@/lib/storage";
import { formatBs, formatDateTime } from "@/lib/format";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast, { type ToastData } from "@/components/Toast";
import DispatchNote from "@/components/DispatchNote";
import type { DispatchRecord } from "@/lib/types";

export default function HistorialPage() {
  const { data, deleteDispatch, restoreDispatch } = useData();
  const [placeFilter, setPlaceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [noteRecord, setNoteRecord] = useState<DispatchRecord | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const filtered = useMemo(() => {
    return data.history.filter((h) => {
      if (placeFilter && h.placeId !== placeFilter) return false;
      if (dateFilter) {
        const recordDate = h.dateISO.slice(0, 10);
        if (recordDate !== dateFilter) return false;
      }
      return true;
    });
  }, [data.history, placeFilter, dateFilter]);

  const grandTotal = filtered.reduce((sum, h) => sum + h.total, 0);

  function handleDelete(record: DispatchRecord) {
    deleteDispatch(record.id);
    setConfirmingId(null);
    setToast({
      message: `Despacho #${record.number} eliminado`,
      actionLabel: "Deshacer",
      onAction: () => restoreDispatch(record),
    });
  }

  return (
    <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
      <section className="flex flex-col gap-3 rounded-[20px] bg-white p-4 shadow-card sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-bold text-brown-soft">Lugar</label>
          <select
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
            className="h-12 w-full rounded-2xl border-2 border-border-soft bg-white px-3 text-base font-semibold focus:border-orange-700 focus:outline-none"
          >
            <option value="">Todos los lugares</option>
            {data.places.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-sm font-bold text-brown-soft">Fecha</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-12 w-full rounded-2xl border-2 border-border-soft bg-white px-3 text-base font-semibold focus:border-orange-700 focus:outline-none"
          />
        </div>
        {(placeFilter || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setPlaceFilter("");
              setDateFilter("");
            }}
            className="h-12 rounded-2xl bg-peach-soft px-4 font-bold text-brown-strong active:scale-95 sm:self-end"
          >
            Quitar filtros
          </button>
        )}
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="font-bold text-brown-strong">
          {filtered.length} despacho{filtered.length === 1 ? "" : "s"}
        </p>
        <p className="font-heading font-extrabold text-terracotta-dark">Total: {formatBs(grandTotal)}</p>
      </div>

      <div className="space-y-3">
        {filtered.map((h) => {
          const expanded = expandedId === h.id;
          return (
            <div key={h.id} className="overflow-hidden rounded-[20px] bg-white shadow-card">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : h.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left active:bg-cream-soft"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading font-bold text-brown-strong">
                    #{h.number} · {h.placeName}
                  </p>
                  <p className="text-sm font-semibold text-brown-soft">
                    {formatDateTime(h.dateISO)} · {h.items.length} producto
                    {h.items.length === 1 ? "" : "s"}
                    {h.driverName ? ` · ${h.driverName}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-heading text-lg font-extrabold text-terracotta-dark">
                    {formatBs(h.total)}
                  </span>
                  {expanded ? (
                    <ChevronUp size={18} className="text-orange-700" />
                  ) : (
                    <ChevronDown size={18} className="text-orange-700" />
                  )}
                </div>
              </button>

              {expanded && (
                <div className="border-t border-border-soft p-4">
                  <div className="space-y-1.5">
                    {h.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between text-sm">
                        <span className="text-brown">
                          {item.qty} × {item.name}
                        </span>
                        <span className="font-bold text-terracotta">{formatBs(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNoteRecord(h)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-peach-soft text-sm font-bold text-brown-strong active:scale-95"
                    >
                      <FileText size={16} /> Ver nota
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(h.id)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-peach-light text-sm font-bold text-danger-text active:scale-95"
                    >
                      <Trash2 size={16} /> Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm font-semibold text-brown-soft">
            No hay despachos guardados todavía.
          </p>
        )}
      </div>

      <ConfirmDialog
        open={confirmingId !== null}
        icon={<Trash2 size={20} />}
        title="¿Eliminar este despacho?"
        message="Podrás deshacerlo justo después de eliminar."
        actions={[
          {
            label: "Sí, eliminar",
            variant: "danger",
            onClick: () => {
              const record = data.history.find((h) => h.id === confirmingId);
              if (record) handleDelete(record);
            },
          },
          { label: "Cancelar", variant: "secondary", onClick: () => setConfirmingId(null) },
        ]}
      />

      {noteRecord && <DispatchNote record={noteRecord} onClose={() => setNoteRecord(null)} />}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
