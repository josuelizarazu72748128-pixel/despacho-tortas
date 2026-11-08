"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/storage";
import { formatBs, formatDateTime } from "@/lib/format";

export default function HistorialPage() {
  const { data, deleteDispatch } = useData();
  const [placeFilter, setPlaceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

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

  return (
    <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
      <section className="flex flex-col gap-3 rounded-2xl bg-peach-100 p-4 shadow-sm sm:flex-row">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-semibold text-orange-strong-700">
            Lugar
          </label>
          <select
            value={placeFilter}
            onChange={(e) => setPlaceFilter(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-3 text-base"
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
          <label className="mb-1 block text-sm font-semibold text-orange-strong-700">
            Fecha
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-3 text-base"
          />
        </div>
        {(placeFilter || dateFilter) && (
          <button
            type="button"
            onClick={() => {
              setPlaceFilter("");
              setDateFilter("");
            }}
            className="h-12 rounded-xl bg-peach-200 px-4 font-semibold text-orange-strong-700 active:scale-95 sm:self-end"
          >
            Quitar filtros
          </button>
        )}
      </section>

      <div className="flex items-center justify-between px-1">
        <p className="font-semibold text-orange-strong-700">
          {filtered.length} despacho{filtered.length === 1 ? "" : "s"}
        </p>
        <p className="font-bold text-orange-strong-700">
          Total: {formatBs(grandTotal)}
        </p>
      </div>

      <div className="space-y-3">
        {filtered.map((h) => {
          const expanded = expandedId === h.id;
          return (
            <div key={h.id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : h.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left active:bg-peach-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-foreground">{h.placeName}</p>
                  <p className="text-sm text-orange-strong-700/80">
                    {formatDateTime(h.dateISO)} · {h.items.length} producto
                    {h.items.length === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-lg font-extrabold text-orange-strong-600">
                    {formatBs(h.total)}
                  </span>
                  <span className="text-orange-strong-500">{expanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded && (
                <div className="border-t border-peach-100 p-4">
                  <div className="space-y-1.5">
                    {h.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">
                          {item.qty} × {item.name}
                        </span>
                        <span className="font-semibold text-orange-strong-700">
                          {formatBs(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {confirmingId === h.id ? (
                    <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-peach-100 p-3">
                      <span className="text-sm font-medium text-foreground">
                        ¿Eliminar este despacho del historial?
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            deleteDispatch(h.id);
                            setConfirmingId(null);
                          }}
                          className="h-10 rounded-lg bg-red-500 px-3 font-semibold text-white active:scale-95"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          className="h-10 rounded-lg bg-white px-3 font-semibold text-orange-strong-700 active:scale-95"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmingId(h.id)}
                      className="mt-4 h-10 rounded-lg bg-peach-100 px-4 text-sm font-semibold text-red-500 active:scale-95"
                    >
                      Eliminar despacho
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-orange-strong-700/80">
            No hay despachos guardados todavía.
          </p>
        )}
      </div>
    </div>
  );
}
