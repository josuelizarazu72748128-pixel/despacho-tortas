"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Despacho", icon: "🧁" },
  { href: "/lugares", label: "Lugares", icon: "📍" },
  { href: "/precios", label: "Precios", icon: "💲" },
  { href: "/historial", label: "Historial", icon: "🗂️" },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-30 border-b border-peach-200 bg-peach-50/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-stretch gap-1 overflow-x-auto px-2 py-2 sm:gap-2 sm:px-4">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex min-w-[80px] flex-1 flex-col items-center gap-1 rounded-xl px-3 py-2 text-center transition-colors active:scale-95 ${
                active
                  ? "bg-orange-strong-500 text-white shadow-md"
                  : "text-orange-strong-700 hover:bg-peach-100"
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-xs font-semibold sm:text-sm">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
