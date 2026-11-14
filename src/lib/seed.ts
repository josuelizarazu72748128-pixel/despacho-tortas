import type {
  AppData,
  CategoryDef,
  Product,
  Place,
} from "./types";

export const CATEGORIES: CategoryDef[] = [
  { id: "tortas", label: "Tortas por molde", order: 1 },
  { id: "minis", label: "Mini tortas", order: 2 },
  { id: "pays", label: "Pays", order: 3 },
  { id: "brazos", label: "Brazos", order: 4 },
  { id: "masas", label: "Masas", order: 5 },
  { id: "vasos", label: "Vasos", order: 6 },
  { id: "otros", label: "Otros", order: 7 },
];

const MOLDE_SIZES: { id: string; label: string }[] = [
  { id: "8", label: "Molde 8" },
  { id: "10", label: "Molde 10" },
  { id: "15", label: "Molde 15" },
  { id: "20", label: "Molde 20" },
  { id: "25", label: "Molde 25" },
  { id: "30", label: "Molde 30" },
  { id: "40", label: "Molde 40" },
  { id: "50", label: "Molde 50" },
  { id: "terclarga", label: "Tercera larga" },
];

// [normal, especial, semi especial]
const MOLDE_PRICES: Record<string, [number, number, number]> = {
  "8": [27, 52, 35],
  "10": [31, 75, 38],
  "15": [41, 104, 52],
  "20": [52, 116, 64],
  "25": [75, 128, 87],
  "30": [104, 220, 116],
  "40": [116, 244, 128],
  "50": [151, 290, 162],
  terclarga: [162, 302, 168],
};

const VARIANTS: { suffix: string; label: string }[] = [
  { suffix: "normal", label: "Normal" },
  { suffix: "especial", label: "Especial" },
  { suffix: "semi", label: "Semi especial" },
];

interface SeedProduct {
  id: string;
  name: string;
  category: Product["category"];
  price: number;
}

function buildTortas(): SeedProduct[] {
  const items: SeedProduct[] = [];
  MOLDE_SIZES.forEach((size) => {
    VARIANTS.forEach((variant, variantIdx) => {
      items.push({
        id: `torta-${size.id}-${variant.suffix}`,
        name: `${size.label} - ${variant.label}`,
        category: "tortas",
        price: MOLDE_PRICES[size.id][variantIdx],
      });
    });
  });
  return items;
}

const OTHER_PRODUCTS: SeedProduct[] = [
  { id: "mini-normal", name: "Mini normal", category: "minis", price: 17 },
  { id: "mini-especial", name: "Mini especial", category: "minis", price: 19 },

  { id: "pay-grande", name: "Pay grande", category: "pays", price: 70 },
  { id: "pay-grande-limon", name: "Pay grande de limón", category: "pays", price: 75 },
  { id: "pay-pequeno", name: "Pay pequeño", category: "pays", price: 35 },
  { id: "pay-pequeno-limon", name: "Pay pequeño de limón", category: "pays", price: 40 },
  { id: "pay-mush-grande", name: "Pay mush grande", category: "pays", price: 75 },
  { id: "pay-mush-pequeno", name: "Pay mush pequeño", category: "pays", price: 41 },

  { id: "brazo-grande", name: "Brazo grande", category: "brazos", price: 81 },
  { id: "brazo-pequeno", name: "Brazo pequeño", category: "brazos", price: 44 },

  { id: "masas", name: "Masas", category: "masas", price: 2.9 },
  { id: "masas-especiales", name: "Masas especiales", category: "masas", price: 3.5 },

  { id: "vaso", name: "Torta en vaso", category: "vasos", price: 12 },

  { id: "diseno", name: "Diseño", category: "otros", price: 35 },
  { id: "brownie", name: "Brownie", category: "otros", price: 5.8 },
];

export interface TortaMoldeVariant {
  key: "normal" | "especial" | "semi";
  label: string;
  productId: string;
}

export interface TortaMolde {
  id: string;
  label: string;
  variants: TortaMoldeVariant[];
}

export const TORTA_MOLDES: TortaMolde[] = MOLDE_SIZES.map((size) => ({
  id: size.id,
  label: size.label,
  variants: VARIANTS.map((variant) => ({
    key: variant.suffix as TortaMoldeVariant["key"],
    label: variant.label,
    productId: `torta-${size.id}-${variant.suffix}`,
  })),
}));

export const DEFAULT_DRIVERS: string[] = [];

const ALL_SEED_PRODUCTS: SeedProduct[] = [...buildTortas(), ...OTHER_PRODUCTS];

export const CATALOG: Product[] = ALL_SEED_PRODUCTS.map((p, idx) => ({
  id: p.id,
  name: p.name,
  category: p.category,
  order: idx,
}));

const SEED_DATE = "2026-01-01T00:00:00.000Z";

export const DEFAULT_PLACE_ID = "sacaba-blanca-heladeria";

export const DEFAULT_PLACE: Place = {
  id: DEFAULT_PLACE_ID,
  name: "Sacaba - Blanca - Heladería",
  createdAt: SEED_DATE,
};

const DEFAULT_PRICES: Record<string, number> = {};
ALL_SEED_PRODUCTS.forEach((p) => {
  DEFAULT_PRICES[p.id] = p.price;
});

export function createInitialData(): AppData {
  return {
    catalog: CATALOG,
    places: [DEFAULT_PLACE],
    prices: {
      [DEFAULT_PLACE_ID]: { ...DEFAULT_PRICES },
    },
    priceMeta: {
      [DEFAULT_PLACE_ID]: {
        label: "Precios enero 2026",
        updatedAt: SEED_DATE,
      },
    },
    history: [],
    drivers: DEFAULT_DRIVERS,
    dispatchSeq: 0,
    onboarded: false,
  };
}
