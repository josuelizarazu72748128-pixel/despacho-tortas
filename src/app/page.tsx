"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/storage";
import { CATEGORIES } from "@/lib/seed";
import { formatBs } from "@/lib/format";
import Stepper from "@/components/Stepper";
import type { DispatchItem } from "@/lib/types";

export default function DespachoPage() {
  const { data, saveDispatch } = useData();
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>("");
  const placeId = selectedPlaceId || data.places[0]?.id || "";
  const [qty, setQty] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<string | null>(null);

  const placePrices = useMemo(
    () => data.prices[placeId] ?? {},
    [data.prices, placeId]
  );

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const products = data.catalog
        .filter((p) => p.category === cat.id && placePrices[p.id] !== undefined)
        .sort((a, b) => a.order - b.order);
      return { cat, products };
    }).filter((g) => g.products.length > 0);
  }, [data.catalog, placePrices]);

  const total = useMemo(() => {
    let sum = 0;
    for (const [productId, q] of Object.entries(qty)) {
      const price = placePrices[productId];
      if (price !== undefined) sum += price * q;
    }
    return sum;
  }, [qty, placePrices]);

  const itemCount = Object.values(qty).filter((q) => q > 0).length;

  function handleClear() {
    setQty({});
    setMessage(null);
  }

  function handleSave() {
    const place = data.places.find((p) => p.id === placeId);
    if (!place) return;
    const items: DispatchItem[] = data.catalog
      .filter((p) => (qty[p.id] ?? 0) > 0 && placePrices[p.id] !== undefined)
      .map((p) => ({
        productId: p.id,
        name: p.name,
        category: p.category,
        qty: qty[p.id],
        unitPrice: placePrices[p.id],
        subtotal: Math.round(placePrices[p.id] * qty[p.id] * 100) / 100,
      }));

    if (items.length === 0) {
      setMessage("Agrega al menos una cantidad antes de guardar.");
      return;
    }

    saveDispatch({
      placeId: place.id,
      placeName: place.name,
      dateISO: new Date().toISOString(),
      items,
      total: Math.round(total * 100) / 100,
    });
    setQty({});
    setMessage("Despacho guardado en el historial.");
    setTimeout(() => setMessage(null), 3500);
  }

  if (data.places.length === 0) {
    return (
      <div className="p-6 text-center text-orange-strong-700">
        No hay lugares creados todavía. Ve a la pestaña{" "}
        <span className="font-semibold">Lugares</span> para crear uno.
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pb-28">
      <div className="px-4 pt-4 sm:px-6">
        <label className="mb-1 block text-sm font-semibold text-orange-strong-700">
          Lugar de destino
        </label>
        <select
          value={placeId}
          onChange={(e) => {
            setSelectedPlaceId(e.target.value);
            setQty({});
            setMessage(null);
          }}
          className="h-14 w-full rounded-2xl border-2 border-peach-300 bg-white px-4 text-lg font-semibold text-foreground shadow-sm"
        >
          {data.places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className="mx-4 mt-3 rounded-xl bg-peach-200 px-4 py-2 text-sm font-medium text-orange-strong-700 sm:mx-6">
          {message}
        </div>
      )}

      <div className="flex-1 space-y-5 px-4 py-4 sm:px-6">
        {groups.length === 0 && (
          <p className="text-center text-sm text-orange-strong-700/80">
            Este lugar no tiene precios cargados. Ve a{" "}
            <span className="font-semibold">Precios</span> para configurarlos.
          </p>
        )}

        {groups.map(({ cat, products }) => (
          <section key={cat.id} className="rounded-2xl bg-peach-100 p-3 shadow-sm sm:p-4">
            <h2 className="mb-2 px-1 text-base font-bold text-orange-strong-700 sm:text-lg">
              {cat.label}
            </h2>
            <div className="space-y-2">
              {products.map((p) => {
                const price = placePrices[p.id] ?? 0;
                const q = qty[p.id] ?? 0;
                const subtotal = Math.round(price * q * 100) / 100;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{p.name}</p>
                      <p className="text-sm text-orange-strong-700/80">
                        {formatBs(price)} c/u
                        {q > 0 && (
                          <span className="ml-2 font-semibold text-orange-strong-700">
                            = {formatBs(subtotal)}
                          </span>
                        )}
                      </p>
                    </div>
                    <Stepper
                      value={q}
                      onChange={(val) => setQty((prev) => ({ ...prev, [p.id]: val }))}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-orange-strong-600 bg-orange-strong-500 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-baseline justify-between sm:block">
            <span className="text-sm font-medium text-white/90">
              Total {itemCount > 0 ? `(${itemCount} productos)` : ""}
            </span>
            <span className="text-2xl font-extrabold text-white sm:ml-3 sm:text-3xl">
              {formatBs(total)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="h-12 flex-1 rounded-xl bg-white/20 px-4 font-semibold text-white active:scale-95 active:bg-white/30 sm:flex-none"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-12 flex-1 rounded-xl bg-white px-5 font-bold text-orange-strong-700 shadow active:scale-95 sm:flex-none"
            >
              Guardar despacho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
