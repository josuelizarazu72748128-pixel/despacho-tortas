"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AppData, CategoryId, DispatchRecord } from "./types";
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

function readFromStorage(): AppData {
  if (typeof window === "undefined") return SERVER_SNAPSHOT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SERVER_SNAPSHOT;
    return JSON.parse(raw) as AppData;
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
  setPrice: (placeId: string, productId: string, price: number) => void;
  setPriceMeta: (placeId: string, label: string) => void;
  addProductToPlace: (
    placeId: string,
    args: { name: string; category: CategoryId; price: number }
  ) => void;
  removeProductFromPlace: (placeId: string, productId: string) => void;
  saveDispatch: (record: Omit<DispatchRecord, "id">) => void;
  deleteDispatch: (id: string) => void;
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

  const saveDispatch = useCallback((record: Omit<DispatchRecord, "id">) => {
    const id = `d-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
    commit((prev) => ({ ...prev, history: [{ ...record, id }, ...prev.history] }));
  }, []);

  const deleteDispatch = useCallback((id: string) => {
    commit((prev) => ({ ...prev, history: prev.history.filter((h) => h.id !== id) }));
  }, []);

  return (
    <DataContext.Provider
      value={{
        data,
        addPlace,
        updatePlace,
        deletePlace,
        setPrice,
        setPriceMeta,
        addProductToPlace,
        removeProductFromPlace,
        saveDispatch,
        deleteDispatch,
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
