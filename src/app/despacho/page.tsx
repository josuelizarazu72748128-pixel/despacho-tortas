"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, ArrowLeftRight, Search, Eraser, UserRound, Plus } from "lucide-react";
import { useData } from "@/lib/storage";
import { CATEGORIES, TORTA_MOLDES } from "@/lib/seed";
import { CATEGORY_ICONS } from "@/lib/categoryIcons";
import { formatBs } from "@/lib/format";
import Stepper from "@/components/Stepper";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast, { type ToastData } from "@/components/Toast";
import DispatchSummaryModal from "@/components/DispatchSummaryModal";
import DispatchNote from "@/components/DispatchNote";
import type { CategoryId, DispatchItem, DispatchRecord, Product } from "@/lib/types";

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export default function DespachoPage() {
  const { data, saveDispatch, addDriver } = useData();

  const [placeId, setPlaceId] = useState<string | null>(null);
  const [showPlaceConfirm, setShowPlaceConfirm] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [addingDriver, setAddingDriver] = useState(false);
  const [newDriverText, setNewDriverText] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [search, setSearch] = useState("");
  const [qty, setQty] = useState<Record<string, number>>({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDate, setSummaryDate] = useState("");
  const [savedRecord, setSavedRecord] = useState<DispatchRecord | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);
  const qtySnapshotRef = useRef<Record<string, number>>({});

  const place = data.places.find((p) => p.id === placeId) ?? null;
  const placePrices = useMemo(
    () => (placeId ? data.prices[placeId] ?? {} : {}),
    [data.prices, placeId]
  );

  const hasQty = Object.values(qty).some((q) => q > 0);

  const groups = useMemo(() => {
    const cats = category === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === category);
    const term = search.trim().toLowerCase();
    return cats
      .map((cat) => {
        const products = data.catalog
          .filter(
            (p) =>
              p.category === cat.id &&
              placePrices[p.id] !== undefined &&
              (!term || p.name.toLowerCase().includes(term))
          )
          .sort((a, b) => a.order - b.order);
        return { cat, products };
      })
      .filter((g) => g.products.length > 0);
  }, [data.catalog, placePrices, category, search]);

  const { total, unitCount, items } = useMemo(() => {
    let sum = 0;
    let units = 0;
    const list: DispatchItem[] = [];
    for (const p of data.catalog) {
      const q = qty[p.id] ?? 0;
      const price = placePrices[p.id];
      if (q > 0 && price !== undefined) {
        const subtotal = round(price * q);
        sum += subtotal;
        units += q;
        list.push({ productId: p.id, name: p.name, category: p.category, qty: q, unitPrice: price, subtotal });
      }
    }
    return { total: round(sum), unitCount: units, items: list };
  }, [data.catalog, placePrices, qty]);

  function setProductQty(productId: string, value: number) {
    setQty((prev) => ({ ...prev, [productId]: value }));
  }

  function requestChangePlace() {
    if (hasQty) {
      setShowPlaceConfirm(true);
    } else {
      setPlaceId(null);
    }
  }

  function handleClearQuantities() {
    qtySnapshotRef.current = qty;
    setQty({});
    setToast({
      message: "Cantidades borradas",
      actionLabel: "Deshacer",
      onAction: () => setQty(qtySnapshotRef.current),
    });
  }

  function handleConfirmSave() {
    if (!place) return;
    const record = saveDispatch({
      placeId: place.id,
      placeName: place.name,
      driverName: driverName.trim(),
      dateISO: summaryDate || new Date().toISOString(),
      items,
      total,
    });
    setQty({});
    setShowSummary(false);
    setSavedRecord(record);
    setToast({ message: "Despacho guardado en el historial" });
  }

  function handleAddDriver() {
    const name = newDriverText.trim();
    if (!name) return;
    addDriver(name);
    setDriverName(name);
    setNewDriverText("");
    setAddingDriver(false);
  }

  if (data.places.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <MapPin size={40} className="text-orange-700" />
        <p className="font-heading text-lg font-bold text-brown-strong">
          Todavía no hay lugares creados
        </p>
        <p className="text-sm font-semibold text-brown-soft">
          Crea un lugar de destino para empezar a registrar despachos.
        </p>
        <Link
          href="/lugares"
          className="gradient-btn mt-2 flex h-[52px] items-center justify-center rounded-2xl px-6 text-base font-bold text-white shadow-btn active:scale-95"
        >
          Ir a Lugares
        </Link>
      </div>
    );
  }

  // --- Paso 1: elegir lugar ---
  if (!place) {
    return (
      <div className="flex-1 px-4 py-5 sm:px-6">
        <p className="mb-1 text-sm font-extrabold uppercase tracking-wide text-orange-700">
          Paso 1 de 3
        </p>
        <h2 className="mb-4 font-heading text-xl font-bold text-brown-strong">
          ¿A qué lugar vas a despachar?
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {data.places.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlaceId(p.id)}
              className="flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-[20px] bg-white p-4 text-center shadow-card transition-transform duration-150 active:scale-95"
            >
              <MapPin size={24} className="text-orange-700" />
              <span className="font-heading text-sm font-bold text-brown-strong">{p.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col" style={{ paddingBottom: hasQty ? "96px" : "0" }}>
      <div className="px-4 pt-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-peach-soft px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wide text-orange-700">Destino</p>
            <p className="truncate font-heading text-base font-bold text-brown-strong">{place.name}</p>
          </div>
          <button
            type="button"
            onClick={requestChangePlace}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-bold text-orange-700 shadow-card active:scale-95"
          >
            <ArrowLeftRight size={16} />
            Cambiar
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-sm font-bold text-brown-soft">
            <UserRound size={16} /> Chofer (opcional)
          </p>
          {hasQty && (
            <button
              type="button"
              onClick={handleClearQuantities}
              className="flex items-center gap-1 text-sm font-bold text-danger-text active:scale-95"
            >
              <Eraser size={14} /> Limpiar
            </button>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {data.drivers.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDriverName(driverName === d ? "" : d)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition-colors duration-150 active:scale-95 ${
                driverName === d
                  ? "gradient-btn text-white shadow-btn"
                  : "bg-white text-brown-strong shadow-card"
              }`}
            >
              {d}
            </button>
          ))}
          {!addingDriver ? (
            <button
              type="button"
              onClick={() => setAddingDriver(true)}
              className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-brown-soft shadow-card active:scale-95"
            >
              <Plus size={14} /> Nuevo
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={newDriverText}
                onChange={(e) => setNewDriverText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDriver()}
                placeholder="Nombre del chofer"
                className="h-10 w-36 rounded-full border-2 border-border-soft bg-white px-3 text-sm font-semibold focus:border-orange-700 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDriver}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-700 text-white active:scale-90"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="relative mt-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brown-soft" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="h-12 w-full rounded-2xl border-2 border-border-soft bg-white pl-11 pr-4 text-base font-semibold text-foreground focus:border-orange-700 focus:outline-none"
          />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-150 active:scale-95 ${
              category === "all"
                ? "gradient-btn text-white shadow-btn"
                : "bg-white text-brown-strong shadow-card"
            }`}
          >
            Todos
          </button>
          {CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition-colors duration-150 active:scale-95 ${
                  active ? "gradient-btn text-white shadow-btn" : "bg-white text-brown-strong shadow-card"
                }`}
              >
                <Icon size={16} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 space-y-4 px-4 py-4 sm:px-6">
        {groups.length === 0 && (
          <p className="py-10 text-center text-sm font-semibold text-brown-soft">
            {search
              ? "No encontramos productos con ese nombre."
              : "Este lugar no tiene precios cargados todavía. Ve a Precios para configurarlos."}
          </p>
        )}

        {groups.map(({ cat, products }) =>
          cat.id === "tortas" ? (
            <TortaMoldeSection
              key={cat.id}
              label={cat.label}
              products={products}
              placePrices={placePrices}
              qty={qty}
              onQtyChange={setProductQty}
            />
          ) : (
            <GenericCategorySection
              key={cat.id}
              label={cat.label}
              products={products}
              placePrices={placePrices}
              qty={qty}
              onQtyChange={setProductQty}
            />
          )
        )}
      </div>

      {hasQty && (
        <div className="fixed inset-x-0 bottom-16 z-40 border-t border-border-soft bg-white shadow-[0_-8px_24px_rgba(46,42,38,0.1)] md:bottom-0">
          <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="leading-tight">
              <span className="block text-xs font-extrabold uppercase tracking-wide text-brown-soft">
                {unitCount} unidades
              </span>
              <strong className="font-heading text-xl font-extrabold text-terracotta-dark">
                {formatBs(total)}
              </strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setSummaryDate(new Date().toISOString());
                setShowSummary(true);
              }}
              className="gradient-btn flex h-[52px] items-center justify-center rounded-2xl px-6 text-base font-bold text-white shadow-btn active:scale-95"
            >
              Ver resumen
            </button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showPlaceConfirm}
        icon={<ArrowLeftRight size={20} />}
        title="¿Qué hacemos con las cantidades?"
        message="Ya marcaste cantidades para este lugar. Puedes mantenerlas o empezar de nuevo."
        actions={[
          {
            label: "Mantener cantidades",
            variant: "primary",
            onClick: () => {
              setShowPlaceConfirm(false);
              setPlaceId(null);
            },
          },
          {
            label: "Limpiar y cambiar",
            variant: "danger",
            onClick: () => {
              setQty({});
              setShowPlaceConfirm(false);
              setPlaceId(null);
            },
          },
          {
            label: "Cancelar",
            variant: "secondary",
            onClick: () => setShowPlaceConfirm(false),
          },
        ]}
      />

      <DispatchSummaryModal
        open={showSummary}
        number={data.dispatchSeq + 1}
        placeName={place.name}
        driverName={driverName.trim()}
        dateISO={summaryDate}
        items={items}
        total={total}
        onConfirm={handleConfirmSave}
        onClose={() => setShowSummary(false)}
      />

      {savedRecord && <DispatchNote record={savedRecord} onClose={() => setSavedRecord(null)} />}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

function TortaMoldeSection({
  label,
  products,
  placePrices,
  qty,
  onQtyChange,
}: {
  label: string;
  products: Product[];
  placePrices: Record<string, number>;
  qty: Record<string, number>;
  onQtyChange: (productId: string, value: number) => void;
}) {
  const presentIds = useMemo(() => new Set(products.map((p) => p.id)), [products]);
  const moldes = useMemo(
    () =>
      TORTA_MOLDES.map((molde) => ({
        ...molde,
        variants: molde.variants.filter((v) => presentIds.has(v.productId)),
      })).filter((m) => m.variants.length > 0),
    [presentIds]
  );

  if (moldes.length === 0) return null;

  return (
    <section>
      <h2 className="mb-2 px-1 font-heading text-base font-bold text-brown-strong">{label}</h2>
      <div className="space-y-3">
        {moldes.map((molde) => (
          <div key={molde.id} className="rounded-[20px] bg-white p-4 shadow-card">
            <h3 className="mb-3 font-heading text-sm font-bold text-brown-strong">{molde.label}</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {molde.variants.map((variant) => {
                const price = placePrices[variant.productId] ?? 0;
                const q = qty[variant.productId] ?? 0;
                const active = q > 0;
                return (
                  <div
                    key={variant.productId}
                    className={`rounded-2xl p-3 transition-colors duration-150 ${
                      active ? "bg-peach-soft" : "bg-cream-soft"
                    }`}
                  >
                    <p className="text-sm font-bold text-brown-strong">{variant.label}</p>
                    <p className="mb-2.5 text-xs font-bold text-terracotta">
                      {formatBs(price)} c/u
                      {q > 0 && <span> · {formatBs(round(price * q))}</span>}
                    </p>
                    <Stepper value={q} onChange={(val) => onQtyChange(variant.productId, val)} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function GenericCategorySection({
  label,
  products,
  placePrices,
  qty,
  onQtyChange,
}: {
  label: string;
  products: Product[];
  placePrices: Record<string, number>;
  qty: Record<string, number>;
  onQtyChange: (productId: string, value: number) => void;
}) {
  return (
    <section>
      <h2 className="mb-2 px-1 font-heading text-base font-bold text-brown-strong">{label}</h2>
      <div className="space-y-2">
        {products.map((p) => {
          const price = placePrices[p.id] ?? 0;
          const q = qty[p.id] ?? 0;
          const active = q > 0;
          return (
            <div
              key={p.id}
              className={`flex flex-col gap-3 rounded-2xl p-3.5 shadow-card transition-colors duration-150 sm:flex-row sm:items-center sm:justify-between ${
                active ? "bg-peach-soft" : "bg-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-brown-strong">{p.name}</p>
                <p className="text-sm font-bold text-terracotta">
                  {formatBs(price)} c/u
                  {q > 0 && <span> · {formatBs(round(price * q))}</span>}
                </p>
              </div>
              <Stepper value={q} onChange={(val) => onQtyChange(p.id, val)} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
