"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useProfileImage } from "@/hooks/useProfileImage";
import { NAV_ITEMS } from "./nav-items";

// Alt dock'ta "Antrenman" sekmesi yerine ortadaki neon + butonu (yeni antrenman) bulunur.
const FAB_HREF = "/workout/new";
const DOCK_ITEMS = NAV_ITEMS.filter((item) => item.href !== FAB_HREF);
const LEFT_ITEMS = DOCK_ITEMS.slice(0, 2);
const RIGHT_ITEMS = DOCK_ITEMS.slice(2);

const TAB_CLASS =
    "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50";

/** Mobil alt dock: sekmeler + ortada parlayan "yeni antrenman" butonu. */
export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const image = useProfileImage();

    const userName = session?.user?.name || "Şampiyon";
    const userInitial = userName.charAt(0).toUpperCase();

    const renderTab = (item: (typeof NAV_ITEMS)[number]) => {
        const isActive = pathname === item.href;
        return (
            <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`${TAB_CLASS} ${isActive ? "text-brand-400" : "text-gray-500 hover:text-gray-300"}`}
            >
                <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px] neon-glow" : "stroke-2"}`} aria-hidden="true" />
                <span className={`max-w-full truncate text-[10px] ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
            </Link>
        );
    };

    const isProfileActive = pathname === "/profile";

    return (
        <nav
            aria-label="Ana menü"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-[#111218]/90 px-3 pt-2 backdrop-blur-xl md:hidden"
            style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
        >
            <div className="relative mx-auto flex max-w-[430px] items-center">
                {LEFT_ITEMS.map(renderTab)}

                {/* Ortadaki parlayan eylem butonu */}
                <div className="relative -top-5 px-2">
                    <Link
                        href={FAB_HREF}
                        aria-label="Yeni antrenman"
                        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-coral text-white shadow-glow-coral transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-95"
                    >
                        <Plus className="h-6 w-6 stroke-[2.5px]" aria-hidden="true" />
                    </Link>
                </div>

                {RIGHT_ITEMS.map(renderTab)}

                <Link
                    href="/profile"
                    aria-current={isProfileActive ? "page" : undefined}
                    className={`${TAB_CLASS} ${isProfileActive ? "text-brand-400" : "text-gray-500 hover:text-gray-300"}`}
                >
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={image}
                            alt=""
                            className={`h-5 w-5 rounded-full border object-cover ${isProfileActive ? "border-brand-400" : "border-line"}`}
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${
                                isProfileActive ? "border-brand-400 bg-brand-500/20 text-brand-300" : "border-line bg-surface-raised text-gray-400"
                            }`}
                        >
                            {userInitial}
                        </div>
                    )}
                    <span className={`text-[10px] ${isProfileActive ? "font-semibold" : "font-medium"}`}>Profil</span>
                </Link>
            </div>
        </nav>
    );
}
