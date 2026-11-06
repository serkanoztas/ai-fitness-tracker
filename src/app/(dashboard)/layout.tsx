import { Dumbbell } from "lucide-react";
import AIMacroAssistant from "@/components/AIMacroAssistant";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { SidebarUser } from "@/components/layout/SidebarUser";
import { MobileNav } from "@/components/layout/MobileNav";

// Server Component: statik iskelet sunucuda render edilir, yalnızca etkileşimli parçalar (client) hydrate olur.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-50 shadow-sm">
                <div className="p-6 flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
                        <Dumbbell className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                        AI Fitness
                    </span>
                </div>

                <SidebarNav />
                <SidebarUser />
            </aside>

            <MobileNav />

            {/* MAIN CONTENT AREA */}
            <main className="md:pl-64 pb-24 md:pb-6 min-h-screen transition-all duration-300 ease-in-out">
                {children}
            </main>
            <AIMacroAssistant />
        </div>
    );
}
