"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/" as const, label: "Home" },
  { href: "/tableau" as const, label: "Tableau" },
  { href: "/map" as const, label: "Carte" },
  { href: "/raw" as const, label: "Brut" },
  { href: "/mock" as const, label: "Mock" }
] as const;

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-white">
          GTFS-RT Reader
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

