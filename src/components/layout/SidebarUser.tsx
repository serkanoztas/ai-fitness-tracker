"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useProfileImage } from "@/hooks/useProfileImage";

/**
 * Yan menünün alt kısmındaki kullanıcı özeti ve çıkış butonu.
 * Ad, profil sayfasında güncellenebildiği için session'dan (client) okunur.
 */
export function SidebarUser() {
    const { data: session } = useSession();
    const image = useProfileImage();

    const userName = session?.user?.name || "Şampiyon";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <div className="m-4 rounded-2xl border border-line bg-canvas/50 p-4 shadow-inner-glow">
            <div className="flex items-center justify-between">
                <Link
                    href="/profile"
                    className="group mr-2 flex flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-10 w-10 shrink-0 rounded-full border-2 border-line object-cover" />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line bg-gradient-coral font-bold text-white"
                        >
                            {userInitial}
                        </div>
                    )}
                    <div className="overflow-hidden text-sm transition-opacity group-hover:opacity-80">
                        <p className="truncate font-bold text-white">{userName}</p>
                        <p className="truncate text-xs font-medium text-brand-400">Profili Düzenle</p>
                    </div>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="shrink-0 rounded-lg p-2 text-gray-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/50 active:scale-95"
                    title="Çıkış Yap"
                    aria-label="Çıkış yap"
                >
                    <LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
