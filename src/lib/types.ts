export type CategoryId =
  | "tortas"
  | "minis"
  | "pays"
  | "brazos"
  | "masas"
  | "vasos"
  | "otros";

export interface CategoryDef {
  id: CategoryId;
  label: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  category: CategoryId;
  order: number;
  unit?: string;
}

export interface Place {
  id: string;
  name: string;
  createdAt: string;
}

export interface PriceListMeta {
  label: string;
  updatedAt: string;
}

export interface DispatchItem {
  productId: string;
  name: string;
  category: CategoryId;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

export interface DispatchRecord {
  id: string;
  number: number;
  placeId: string;
  placeName: string;
  driverName: string;
  dateISO: string;
  items: DispatchItem[];
  total: number;
}

export interface AppData {
  catalog: Product[];
  places: Place[];
  prices: Record<string, Record<string, number>>;
  priceMeta: Record<string, PriceListMeta>;
  history: DispatchRecord[];
  drivers: string[];
  dispatchSeq: number;
  onboarded: boolean;
}
