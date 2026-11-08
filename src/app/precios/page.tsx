"use client";

import { useMemo, useState } from "react";
import { useData } from "@/lib/storage";
import { CATEGORIES } from "@/lib/seed";
import { formatDateTime } from "@/lib/format";
import type { CategoryId } from "@/lib/types";

function LabelEditor({
  initialLabel,
  onSave,
}: {
  initialLabel: string;
  onSave: (label: string) => void;
}) {
  const [label, setLabel] = useState(initialLabel);

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="h-12 flex-1 rounded-xl border-2 border-peach-300 bg-white px-4 text-base"
      />
      <button
        type="button"
        onClick={() => onSave(label)}
        className="h-12 rounded-xl bg-orange-strong-500 px-5 font-bold text-white active:scale-95 sm:w-auto"
      >
        Guardar
      </button>
    </div>
  );
}

export default function PreciosPage() {
  const { data, setPrice, setPriceMeta, addProductToPlace, removeProductFromPlace } =
    useData();
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const placeId = selectedPlaceId || data.places[0]?.id || "";
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [newPrice, setNewPrice] = useState("");

  const placePrices = useMemo(
    () => data.prices[placeId] ?? {},
    [data.prices, placeId]
  );
  const meta = data.priceMeta[placeId];

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const products = data.catalog
        .filter((p) => p.category === cat.id && placePrices[p.id] !== undefined)
        .sort((a, b) => a.order - b.order);
      return { cat, products };
    }).filter((g) => g.products.length > 0);
  }, [data.catalog, placePrices]);

  function handleSaveLabel(label: string) {
    if (!placeId) return;
    setPriceMeta(placeId, label.trim() || "Lista de precios");
    setSavedMsg("Lista de precios guardada.");
    setTimeout(() => setSavedMsg(null), 3000);
  }

  function handleAddProduct() {
    const name = newName.trim();
    const price = parseFloat(newPrice.replace(",", "."));
    if (!placeId || !name || !Number.isFinite(price) || price < 0) return;
    addProductToPlace(placeId, { name, category: newCategory, price });
    setNewName("");
    setNewPrice("");
  }

  if (data.places.length === 0) {
    return (
      <div className="p-6 text-center text-orange-strong-700">
        No hay lugares creados todavía. Ve a <span className="font-semibold">Lugares</span>{" "}
        para crear uno.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-6">
      <section className="rounded-2xl bg-peach-100 p-4 shadow-sm">
        <label className="mb-1 block text-sm font-semibold text-orange-strong-700">
          Lugar
        </label>
        <select
          value={placeId}
          onChange={(e) => setSelectedPlaceId(e.target.value)}
          className="h-14 w-full rounded-2xl border-2 border-peach-300 bg-white px-4 text-lg font-semibold"
        >
          {data.places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <label className="mt-4 mb-1 block text-sm font-semibold text-orange-strong-700">
          Etiqueta de esta lista (ej. &ldquo;Precios enero 2026&rdquo;)
        </label>
        <LabelEditor
          key={placeId}
          initialLabel={meta?.label ?? ""}
          onSave={handleSaveLabel}
        />
        {meta && (
          <p className="mt-2 text-xs text-orange-strong-700/70">
            Última actualización: {formatDateTime(meta.updatedAt)}
          </p>
        )}
        {savedMsg && (
          <p className="mt-2 rounded-lg bg-peach-200 px-3 py-1.5 text-sm font-medium text-orange-strong-700">
            {savedMsg}
          </p>
        )}
      </section>

      <section className="space-y-4">
        {groups.map(({ cat, products }) => (
          <div key={cat.id} className="rounded-2xl bg-white p-3 shadow-sm sm:p-4">
            <h2 className="mb-2 px-1 text-base font-bold text-orange-strong-700 sm:text-lg">
              {cat.label}
            </h2>
            <div className="space-y-2">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-peach-50 p-3"
                >
                  <p className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-orange-strong-700/70">
                      Bs
                    </span>
                    <input
                      key={`${placeId}-${p.id}`}
                      type="text"
                      inputMode="decimal"
                      defaultValue={placePrices[p.id]}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value.replace(",", "."));
                        if (Number.isFinite(v) && v >= 0) setPrice(placeId, p.id, v);
                        else e.target.value = String(placePrices[p.id]);
                      }}
                      className="h-11 w-24 rounded-lg border-2 border-peach-300 bg-white px-2 text-right text-base font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => removeProductFromPlace(placeId, p.id)}
                      aria-label={`Quitar ${p.name}`}
                      className="h-11 w-11 shrink-0 rounded-lg bg-peach-100 text-lg font-bold text-red-500 active:scale-95"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-peach-100 p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-orange-strong-700">
          Agregar producto
        </h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-4 text-base"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as CategoryId)}
            className="h-12 w-full rounded-xl border-2 border-peach-300 bg-white px-3 text-base"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <div className="flex h-12 flex-1 items-center rounded-xl border-2 border-peach-300 bg-white px-3">
              <span className="mr-1 text-sm font-semibold text-orange-strong-700/70">
                Bs
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full text-base"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={!newName.trim() || !newPrice.trim()}
              className="h-12 rounded-xl bg-orange-strong-500 px-5 font-bold text-white active:scale-95 disabled:opacity-40"
            >
              Agregar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
