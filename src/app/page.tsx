"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Receipt, Package, Truck, TrendingUp } from "lucide-react";
import { useData } from "@/lib/storage";
import { formatBs } from "@/lib/format";
import OnboardingGuide from "@/components/OnboardingGuide";

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export default function InicioPage() {
  const { data, setOnboarded } = useData();

  // La fecha de hoy es un valor no determinista: se lee recién en el
  // cliente (no durante el prerender) para no "congelar" el día del build.
  const [todayKey, setTodayKey] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTodayKey(localDateKey(new Date()));
  }, []);

  const todayRecords = useMemo(() => {
    if (!todayKey) return [];
    return data.history.filter((h) => localDateKey(new Date(h.dateISO)) === todayKey);
  }, [data.history, todayKey]);

  const totalToday = todayRecords.reduce((sum, h) => sum + h.total, 0);
  const unitsToday = todayRecords.reduce(
    (sum, h) => sum + h.items.reduce((s, it) => s + it.qty, 0),
    0
  );

  const placeNames = [...new Set(todayRecords.map((h) => h.placeId))];
  const byPlace = placeNames
    .map((placeId) => {
      const records = todayRecords.filter((h) => h.placeId === placeId);
      return {
        name: records[0].placeName,
        total: records.reduce((sum, h) => sum + h.total, 0),
      };
    })
    .sort((a, b) => b.total - a.total);

  const maxTotal = Math.max(1, ...byPlace.map((b) => b.total));

  return (
    <div className="flex-1 space-y-5 px-4 py-5 sm:px-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-brown-strong">Panel del día</h2>
        <p className="text-sm font-semibold text-brown-soft">
          Resumen de los despachos registrados hoy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard icon={Receipt} label="Total despachado hoy" value={formatBs(totalToday)} />
        <StatCard icon={Truck} label="Despachos de hoy" value={String(todayRecords.length)} />
        <StatCard icon={Package} label="Unidades enviadas" value={String(unitsToday)} />
      </div>

      <section className="rounded-[20px] bg-white p-5 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-heading text-base font-bold text-brown-strong">
          <TrendingUp size={18} className="text-orange-700" />
          Total por lugar — hoy
        </h3>

        {byPlace.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm font-semibold text-brown-soft">
              Todavía no se registran despachos hoy.
            </p>
            <Link
              href="/despacho"
              className="gradient-btn mt-4 inline-flex h-[48px] items-center justify-center rounded-2xl px-6 text-sm font-bold text-white shadow-btn active:scale-95"
            >
              Ir a Despacho
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {byPlace.map((b) => (
              <div key={b.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="truncate font-bold text-brown-strong">{b.name}</span>
                  <span className="shrink-0 font-bold text-terracotta">{formatBs(b.total)}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-cream-soft">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(6, (b.total / maxTotal) * 100)}%`,
                      background: "linear-gradient(90deg, var(--color-orange-500), var(--color-orange-600))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <OnboardingGuide open={!data.onboarded} onFinish={setOnboarded} />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Receipt;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[20px] bg-white p-4 shadow-card">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-peach-soft text-orange-700">
        <Icon size={19} />
      </div>
      <p className="text-xs font-extrabold uppercase tracking-wide text-brown-soft">{label}</p>
      <p className="mt-0.5 font-heading text-xl font-extrabold text-brown-strong">{value}</p>
    </div>
  );
}
