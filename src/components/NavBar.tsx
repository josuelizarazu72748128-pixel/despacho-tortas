"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Truck, MapPin, Tag, History } from "lucide-react";
import Header from "./Header";

const TABS = [
  { href: "/", label: "Inicio", Icon: Home },
  { href: "/despacho", label: "Despacho", Icon: Truck },
  { href: "/lugares", label: "Lugares", Icon: MapPin },
  { href: "/precios", label: "Precios", Icon: Tag },
  { href: "/historial", label: "Historial", Icon: History },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      <Header />

      {/* Tablet / escritorio: pestañas arriba, al alcance de la vista */}
      <nav className="sticky top-0 z-30 hidden border-b border-border-soft bg-cream-soft/95 backdrop-blur md:block">
        <div className="mx-auto flex max-w-4xl items-stretch gap-2 px-6 py-2.5">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors duration-150 active:scale-95 ${
                  active
                    ? "gradient-btn text-white shadow-btn"
                    : "text-brown-strong hover:bg-peach-soft"
                }`}
              >
                <tab.Icon size={18} strokeWidth={2.25} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Celular: barra inferior, al alcance del pulgar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 h-16 border-t border-border-soft bg-white shadow-[0_-8px_24px_rgba(46,42,38,0.1)] md:hidden">
        <div className="mx-auto flex h-full max-w-4xl items-stretch">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:scale-95 ${
                  active ? "text-orange-700" : "text-brown-soft"
                }`}
              >
                <tab.Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[0.68rem] font-bold">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
