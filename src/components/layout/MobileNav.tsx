"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useProfileImage } from "@/hooks/useProfileImage";
import { NAV_ITEMS } from "./nav-items";

/** Mobil alt menü. */
export function MobileNav() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const image = useProfileImage();

    const userName = session?.user?.name || "Şampiyon";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 z-50 pb-safe">
            <div className="flex justify-around items-center p-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors ${isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                }`}
                        >
                            <item.icon className={`w-6 h-6 mb-1 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                            <span className="text-[10px] font-semibold">{item.name}</span>
                        </Link>
                    );
                })}

                {/* Mobilde de profile gitmek için bir link */}
                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-colors ${pathname === "/profile" ? "text-blue-600 dark:text-blue-400" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                >
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={userName} className="w-6 h-6 rounded-full object-cover mb-1 border border-gray-300" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] mb-1">
                            {userInitial}
                        </div>
                    )}
                    <span className="text-[10px] font-semibold">Profil</span>
                </Link>
            </div>
        </nav>
    );
}
