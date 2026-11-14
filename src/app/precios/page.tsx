"use client";

import { useMemo, useState } from "react";
import { Tag, Clock, X, Save } from "lucide-react";
import { useData } from "@/lib/storage";
import { CATEGORIES, TORTA_MOLDES } from "@/lib/seed";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { formatDateTime } from "@/lib/format";
import Toast, { type ToastData } from "@/components/Toast";
import type { CategoryId, Product } from "@/lib/types";

export default function PreciosPage() {
  const { data, setPrice, setPriceMeta, addProductToPlace, removeProductFromPlace } = useData();
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const placeId = selectedPlaceId || data.places[0]?.id || "";
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<CategoryId>(CATEGORIES[0].id);
  const [newPrice, setNewPrice] = useState("");

  const placePrices = useMemo(() => data.prices[placeId] ?? {}, [data.prices, placeId]);
  const meta = data.priceMeta[placeId];

  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const products = data.catalog
        .filter((p) => p.category === cat.id && placePrices[p.id] !== undefined)
        .sort((a, b) => a.order - b.order);
      return { cat, products };
    }).filter((g) => g.products.length > 0);
  }, [data.catalog, placePrices]);

  function handleSaveLabel() {
    if (!placeId) return;
    setPriceMeta(placeId, labelDraft.trim() || "Lista de precios");
    setEditingLabel(false);
    setToast({ message: "Lista de precios actualizada" });
  }

  function handleAddProduct() {
    const name = newName.trim();
    const price = parseFloat(newPrice.replace(",", "."));
    if (!placeId || !name || !Number.isFinite(price) || price < 0) return;
    addProductToPlace(placeId, { name, category: newCategory, price });
    setNewName("");
    setNewPrice("");
    setToast({ message: `"${name}" agregado` });
  }

  function handleRemove(p: Product) {
    const price = placePrices[p.id];
    removeProductFromPlace(placeId, p.id);
    setToast({
      message: `"${p.name}" quitado`,
      actionLabel: "Deshacer",
      onAction: () => addProductToPlace(placeId, { name: p.name, category: p.category, price }),
    });
  }

  if (data.places.length === 0) {
    return (
      <div className="p-6 text-center font-semibold text-brown-soft">
        No hay lugares creados todavía. Ve a{" "}
        <span className="font-bold text-orange-700">Lugares</span> para crear uno.
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 px-4 py-5 sm:px-6">
      <section className="rounded-[20px] bg-white p-5 shadow-card">
        <label className="mb-1.5 block text-sm font-bold text-brown-soft">Lugar</label>
        <select
          value={placeId}
          onChange={(e) => {
            setSelectedPlaceId(e.target.value);
            setEditingLabel(false);
          }}
          className="h-[52px] w-full rounded-2xl border-2 border-border-soft bg-white px-4 text-base font-bold text-brown-strong focus:border-orange-700 focus:outline-none"
        >
          {data.places.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="mt-4 flex items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-sm font-bold text-brown-soft">
            <Tag size={15} /> Etiqueta de esta lista de precios
          </label>
        </div>
        {editingLabel ? (
          <div className="mt-1.5 flex gap-2">
            <input
              autoFocus
              type="text"
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              className="h-12 flex-1 rounded-2xl border-2 border-border-soft bg-white px-4 text-base font-semibold focus:border-orange-700 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSaveLabel}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-700 text-white active:scale-90"
            >
              <Save size={18} />
            </button>
            <button
              type="button"
              onClick={() => setEditingLabel(false)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-peach-soft text-brown-strong active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setLabelDraft(meta?.label ?? "");
              setEditingLabel(true);
            }}
            className="mt-1.5 flex w-full items-center justify-between rounded-2xl bg-peach-soft px-4 py-3 text-left active:scale-95"
          >
            <span className="font-bold text-brown-strong">{meta?.label ?? "Sin etiqueta"}</span>
            <span className="text-sm font-bold text-orange-700">Editar</span>
          </button>
        )}
        {meta && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-brown-soft">
            <Clock size={13} /> Última actualización: {formatDateTime(meta.updatedAt)}
          </p>
        )}
      </section>

      <section className="space-y-4">
        {groups.map(({ cat, products }) =>
          cat.id === "tortas" ? (
            <TortaMoldePrices
              key={cat.id}
              label={cat.label}
              products={products}
              placePrices={placePrices}
              onChangePrice={(productId, price) => setPrice(placeId, productId, price)}
              onRemove={handleRemove}
            />
          ) : (
            <div key={cat.id} className="rounded-[20px] bg-white p-4 shadow-card">
              <h2 className="mb-2 flex items-center gap-2 px-1 font-heading text-base font-bold text-brown-strong">
                <CategoryIcon id={cat.id} />
                {cat.label}
              </h2>
              <div className="space-y-2">
                {products.map((p) => (
                  <PriceRow
                    key={p.id}
                    name={p.name}
                    price={placePrices[p.id]}
                    onChangePrice={(price) => setPrice(placeId, p.id, price)}
                    onRemove={() => handleRemove(p)}
                  />
                ))}
              </div>
            </div>
          )
        )}
      </section>

      <section className="rounded-[20px] bg-white p-5 shadow-card">
        <h2 className="mb-3 font-heading text-lg font-bold text-brown-strong">Agregar producto</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nombre del producto"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-[52px] w-full rounded-2xl border-2 border-border-soft bg-white px-4 text-base font-semibold focus:border-orange-700 focus:outline-none"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as CategoryId)}
            className="h-[52px] w-full rounded-2xl border-2 border-border-soft bg-white px-3 text-base font-semibold focus:border-orange-700 focus:outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <div className="flex h-[52px] flex-1 items-center rounded-2xl border-2 border-border-soft bg-white px-4">
              <span className="mr-1 text-sm font-bold text-brown-soft">Bs</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="w-full text-base font-semibold focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleAddProduct}
              disabled={!newName.trim() || !newPrice.trim()}
              className="gradient-btn flex h-[52px] items-center justify-center rounded-2xl px-6 font-bold text-white shadow-btn active:scale-95 disabled:opacity-40"
            >
              Agregar
            </button>
          </div>
        </div>
      </section>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function CategoryIcon({ id }: { id: CategoryId }) {
  const Icon = CATEGORY_ICONS[id];
  return <Icon size={16} className="text-orange-700" />;
}

function PriceRow({
  name,
  price,
  onChangePrice,
  onRemove,
}: {
  name: string;
  price: number;
  onChangePrice: (price: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-cream-soft p-3">
      <p className="min-w-0 flex-1 truncate font-semibold text-brown-strong">{name}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-brown-soft">Bs</span>
        <input
          key={`${name}-${price}`}
          type="text"
          inputMode="decimal"
          defaultValue={price}
          onBlur={(e) => {
            const v = parseFloat(e.target.value.replace(",", "."));
            if (Number.isFinite(v) && v >= 0) onChangePrice(v);
            else e.target.value = String(price);
          }}
          className="h-11 w-24 rounded-xl border-2 border-border-soft bg-white px-2 text-right text-base font-bold focus:border-orange-700 focus:outline-none"
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Quitar ${name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-peach-light text-lg font-bold text-danger-text active:scale-90"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function TortaMoldePrices({
  label,
  products,
  placePrices,
  onChangePrice,
  onRemove,
}: {
  label: string;
  products: Product[];
  placePrices: Record<string, number>;
  onChangePrice: (productId: string, price: number) => void;
  onRemove: (p: Product) => void;
}) {
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const moldes = useMemo(
    () =>
      TORTA_MOLDES.map((molde) => ({
        ...molde,
        variants: molde.variants.filter((v) => byId.has(v.productId)),
      })).filter((m) => m.variants.length > 0),
    [byId]
  );

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-card">
      <h2 className="mb-3 px-1 font-heading text-base font-bold text-brown-strong">{label}</h2>
      <div className="space-y-3">
        {moldes.map((molde) => (
          <div key={molde.id} className="rounded-2xl bg-cream-soft p-3">
            <h3 className="mb-2 text-sm font-bold text-brown-strong">{molde.label}</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {molde.variants.map((variant) => (
                <div key={variant.productId} className="rounded-xl bg-white p-2.5 shadow-card">
                  <p className="mb-1.5 text-xs font-bold text-brown-soft">{variant.label}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-brown-soft">Bs</span>
                    <input
                      key={`${variant.productId}-${placePrices[variant.productId]}`}
                      type="text"
                      inputMode="decimal"
                      defaultValue={placePrices[variant.productId]}
                      onBlur={(e) => {
                        const v = parseFloat(e.target.value.replace(",", "."));
                        if (Number.isFinite(v) && v >= 0) onChangePrice(variant.productId, v);
                        else e.target.value = String(placePrices[variant.productId]);
                      }}
                      className="h-10 w-full rounded-lg border-2 border-border-soft bg-white px-2 text-right text-sm font-bold focus:border-orange-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const p = byId.get(variant.productId);
                        if (p) onRemove(p);
                      }}
                      aria-label={`Quitar ${variant.label}`}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-peach-light text-danger-text active:scale-90"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
