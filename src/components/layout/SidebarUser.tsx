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
        <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
                <Link href="/profile" className="flex items-center gap-3 overflow-hidden group flex-1 mr-2 cursor-pointer">
                    {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={userName} className="w-10 h-10 shrink-0 rounded-full object-cover border border-blue-200 dark:border-blue-800" />
                    ) : (
                        <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800">
                            {userInitial}
                        </div>
                    )}
                    <div className="text-sm overflow-hidden group-hover:opacity-80 transition-opacity">
                        <p className="font-bold truncate text-gray-900 dark:text-white">{userName}</p>
                        <p className="text-xs text-blue-500 font-medium truncate">Profili Düzenle</p>
                    </div>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors shrink-0"
                    title="Çıkış Yap"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
