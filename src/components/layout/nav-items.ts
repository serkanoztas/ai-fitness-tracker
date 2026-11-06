import { LayoutDashboard, Dumbbell, History, Scale, Utensils } from "lucide-react";

export const NAV_ITEMS = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Antrenman", href: "/workout/new", icon: Dumbbell },
    { name: "Geçmiş", href: "/workout/history", icon: History },
    { name: "Beslenme", href: "/nutrition", icon: Utensils },
    { name: "Kilo Takibi", href: "/weight", icon: Scale },
];
