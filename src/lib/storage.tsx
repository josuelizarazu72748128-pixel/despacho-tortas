"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AppData, CategoryId, DispatchRecord, Place, PriceListMeta } from "./types";
import { createInitialData } from "./seed";

const STORAGE_KEY = "despacho-tortas:data:v1";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "lugar"
  );
}

// Store externo (localStorage) compartido entre componentes vía useSyncExternalStore,
// para no tener que sincronizar estado de React con el storage dentro de un useEffect.
const SERVER_SNAPSHOT: AppData = createInitialData();
let cachedSnapshot: AppData | null = null;
const listeners = new Set<() => void>();

// Productos descontinuados: si quedan guardados en localStorage de una
// instalación previa, se quitan del catálogo y de las listas de precios.
const DISCONTINUED_PRODUCT_IDS = new Set(["vaso-20", "vaso-25"]);

// Rellena campos nuevos que puedan faltar en datos guardados por una versión
// anterior de la app, sin tocar ni perder nada de lo que ya existía.
function migrate(raw: Partial<AppData> | null | undefined): AppData {
  const base = createInitialData();
  if (!raw) return base;
  const history = (raw.history ?? []).map((h, idx) => ({
    ...h,
    number: h.number ?? (raw.history!.length - idx),
    driverName: h.driverName ?? "",
  }));
  const maxNumber = history.reduce((max, h) => Math.max(max, h.number ?? 0), 0);

  const catalog = (raw.catalog ?? base.catalog)
    .filter((p) => !DISCONTINUED_PRODUCT_IDS.has(p.id))
    .map((p) => (p.id === "vaso" ? { ...p, name: "Torta en vaso" } : p));

  const prices: AppData["prices"] = {};
  for (const [placeId, placePrices] of Object.entries(raw.prices ?? base.prices)) {
    const cleaned = { ...placePrices };
    DISCONTINUED_PRODUCT_IDS.forEach((id) => delete cleaned[id]);
    prices[placeId] = cleaned;
  }

  return {
    catalog,
    places: raw.places ?? base.places,
    prices,
    priceMeta: raw.priceMeta ?? base.priceMeta,
    history,
    drivers: raw.drivers ?? base.drivers,
    dispatchSeq: raw.dispatchSeq ?? maxNumber,
    onboarded: raw.onboarded ?? false,
  };
}

function readFromStorage(): AppData {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    return migrate(JSON.parse(raw) as Partial<AppData>);
  } catch {
    return SERVER_SNAPSHOT;
  }
}

function getSnapshot(): AppData {
  if (cachedSnapshot === null) cachedSnapshot = readFromStorage();
  return cachedSnapshot;
}

function getServerSnapshot(): AppData {
  return SERVER_SNAPSHOT;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(updater: (prev: AppData) => AppData) {
  const next = updater(getSnapshot());
  cachedSnapshot = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // almacenamiento lleno o no disponible: se ignora en esta demo
    }
  }
  listeners.forEach((l) => l());
}

interface DataContextValue {
  data: AppData;
  addPlace: (name: string, copyFromPlaceId?: string) => string;
  updatePlace: (id: string, name: string) => void;
  deletePlace: (id: string) => void;
  restorePlace: (
    place: Place,
    prices: Record<string, number>,
    meta: PriceListMeta | undefined
  ) => void;
  setPrice: (placeId: string, productId: string, price: number) => void;
  setPriceMeta: (placeId: string, label: string) => void;
  addProductToPlace: (
    placeId: string,
    args: { name: string; category: CategoryId; price: number }
  ) => void;
  removeProductFromPlace: (placeId: string, productId: string) => void;
  saveDispatch: (record: Omit<DispatchRecord, "id" | "number">) => DispatchRecord;
  deleteDispatch: (id: string) => void;
  restoreDispatch: (record: DispatchRecord) => void;
  addDriver: (name: string) => void;
  setOnboarded: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addPlace = useCallback((name: string, copyFromPlaceId?: string) => {
    const id = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
    commit((prev) => {
      const copiedPrices = copyFromPlaceId
        ? { ...(prev.prices[copyFromPlaceId] ?? {}) }
        : {};
      const copiedMeta = copyFromPlaceId ? prev.priceMeta[copyFromPlaceId] : undefined;
      return {
        ...prev,
        places: [...prev.places, { id, name, createdAt: new Date().toISOString() }],
        prices: { ...prev.prices, [id]: copiedPrices },
        priceMeta: {
          ...prev.priceMeta,
          [id]: {
            label: copiedMeta ? `${copiedMeta.label} (copiado)` : "Precios iniciales",
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
    return id;
  }, []);

  const updatePlace = useCallback((id: string, name: string) => {
    commit((prev) => ({
      ...prev,
      places: prev.places.map((p) => (p.id === id ? { ...p, name } : p)),
    }));
  }, []);

  const deletePlace = useCallback((id: string) => {
    commit((prev) => {
      const restPrices = { ...prev.prices };
      delete restPrices[id];
      const restMeta = { ...prev.priceMeta };
      delete restMeta[id];
      return {
        ...prev,
        places: prev.places.filter((p) => p.id !== id),
        prices: restPrices,
        priceMeta: restMeta,
      };
    });
  }, []);

  const restorePlace = useCallback(
    (place: Place, prices: Record<string, number>, meta: PriceListMeta | undefined) => {
      commit((prev) => ({
        ...prev,
        places: [...prev.places, place],
        prices: { ...prev.prices, [place.id]: prices },
        priceMeta: meta
          ? { ...prev.priceMeta, [place.id]: meta }
          : prev.priceMeta,
      }));
    },
    []
  );

  const setPrice = useCallback((placeId: string, productId: string, price: number) => {
    commit((prev) => ({
      ...prev,
      prices: {
        ...prev.prices,
        [placeId]: { ...(prev.prices[placeId] ?? {}), [productId]: price },
      },
    }));
  }, []);

  const setPriceMeta = useCallback((placeId: string, label: string) => {
    commit((prev) => ({
      ...prev,
      priceMeta: {
        ...prev.priceMeta,
        [placeId]: { label, updatedAt: new Date().toISOString() },
      },
    }));
  }, []);

  const addProductToPlace = useCallback(
    (placeId: string, args: { name: string; category: CategoryId; price: number }) => {
      commit((prev) => {
        const existing = prev.catalog.find(
          (p) =>
            p.name.trim().toLowerCase() === args.name.trim().toLowerCase() &&
            p.category === args.category
        );
        const product = existing ?? {
          id: `${slugify(args.name)}-${Math.random().toString(36).slice(2, 7)}`,
          name: args.name,
          category: args.category,
          order: prev.catalog.length,
        };
        const catalog = existing ? prev.catalog : [...prev.catalog, product];
        return {
          ...prev,
          catalog,
          prices: {
            ...prev.prices,
            [placeId]: { ...(prev.prices[placeId] ?? {}), [product.id]: args.price },
          },
        };
      });
    },
    []
  );

  const removeProductFromPlace = useCallback((placeId: string, productId: string) => {
    commit((prev) => {
      const placePrices = { ...(prev.prices[placeId] ?? {}) };
      delete placePrices[productId];
      return { ...prev, prices: { ...prev.prices, [placeId]: placePrices } };
    });
  }, []);

  const saveDispatch = useCallback((record: Omit<DispatchRecord, "id" | "number">) => {
    const id = `d-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    let saved: DispatchRecord = { ...record, id, number: 1 };
    commit((prev) => {
      const number = prev.dispatchSeq + 1;
      saved = { ...record, id, number };
      return {
        ...prev,
        history: [saved, ...prev.history],
        dispatchSeq: number,
      };
    });
    return saved;
  }, []);

  const deleteDispatch = useCallback((id: string) => {
    commit((prev) => ({ ...prev, history: prev.history.filter((h) => h.id !== id) }));
  }, []);

  const restoreDispatch = useCallback((record: DispatchRecord) => {
    commit((prev) => ({
      ...prev,
      history: prev.history.some((h) => h.id === record.id)
        ? prev.history
        : [record, ...prev.history].sort((a, b) => b.number - a.number),
    }));
  }, []);

  const addDriver = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    commit((prev) =>
      prev.drivers.some((d) => d.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : { ...prev, drivers: [...prev.drivers, trimmed] }
    );
  }, []);

  const setOnboarded = useCallback(() => {
    commit((prev) => ({ ...prev, onboarded: true }));
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        addPlace,
        updatePlace,
        deletePlace,
        restorePlace,
        setPrice,
        setPriceMeta,
        addProductToPlace,
        removeProductFromPlace,
        saveDispatch,
        deleteDispatch,
        restoreDispatch,
        addDriver,
        setOnboarded,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de DataProvider");
  return ctx;
}
