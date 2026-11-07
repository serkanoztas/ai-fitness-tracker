import { Activity } from "lucide-react";
import AIMacroAssistant from "@/components/AIMacroAssistant";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { SidebarUser } from "@/components/layout/SidebarUser";
import { MobileNav } from "@/components/layout/MobileNav";

// Server Component: statik iskelet sunucuda render edilir, yalnızca etkileşimli parçalar (client) hydrate olur.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-canvas text-white">
            {/* DESKTOP SIDEBAR */}
            <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-line bg-surface/80 backdrop-blur-xl md:flex">
                <div className="flex items-center gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-coral text-white shadow-glow-sm" aria-hidden="true">
                        <Activity className="h-6 w-6 stroke-[2.5px]" />
                    </div>
                    <span className="text-base font-black tracking-[0.18em] text-white">AI FITNESS</span>
                </div>

                <SidebarNav />
                <SidebarUser />
            </aside>

            <MobileNav />

            {/* MAIN CONTENT AREA */}
            <main className="min-h-screen pb-28 md:pb-8 md:pl-64">{children}</main>
            <AIMacroAssistant />
        </div>
    );
}
