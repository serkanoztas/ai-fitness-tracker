"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, History, Scale } from "lucide-react";

const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Antrenman", href: "/workout/new", icon: Dumbbell },
    { name: "Geçmiş", href: "/workout/history", icon: History },
    { name: "Kilo Takibi", href: "/weight", icon: Scale },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

            {/* DESKTOP SIDEBAR (Sadece md ve üzeri ekranlarda görünür) */}
            <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-50 shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        AI Fitness
                    </span>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 mt-4">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 font-medium ${isActive
                                    ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 shadow-sm"
                                    : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200"
                                    }`}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Kullanıcı Profili Özeti (Alt kısım) */}
                <div className="p-4 m-4 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-200 dark:border-blue-800">
                            Ş
                        </div>
                        <div className="text-sm overflow-hidden">
                            <p className="font-bold truncate">Şampiyon</p>
                            <p className="text-xs text-gray-500 truncate">Gelişim devam ediyor</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAV (Sadece mobil ekranlarda görünür) */}
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
                </div>
            </nav>

            {/* MAIN CONTENT AREA */}
            {/* Mobilde alt menü kadar boşluk (pb-24), webde sidebar kadar sol boşluk (md:pl-64) */}
            <main className="md:pl-64 pb-24 md:pb-6 min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </main>

        </div>
    );
} 