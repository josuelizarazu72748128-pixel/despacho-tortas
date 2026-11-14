import { CakeSlice, Cake, PieChart, Disc, Cookie, CupSoda, Package, type LucideIcon } from "lucide-react";
import type { CategoryId } from "./types";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  tortas: CakeSlice,
  minis: Cake,
  pays: PieChart,
  brazos: Disc,
  masas: Cookie,
  vasos: CupSoda,
  otros: Package,
};
