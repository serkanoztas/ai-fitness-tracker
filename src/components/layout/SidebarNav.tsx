"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

/** Masaüstü yan menü linkleri (aktif link için usePathname gerektiği için client). */
export function SidebarNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Ana menü" className="mt-2 flex-1 space-y-1.5 px-4">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:scale-[0.98] ${
                            isActive
                                ? "border-brand-500/25 bg-brand-500/10 text-brand-400 shadow-inner-glow"
                                : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                        <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px] neon-glow" : "stroke-2"}`} aria-hidden="true" />
                        {item.name}
                    </Link>
                );
            })}
        </nav>
    );
}
