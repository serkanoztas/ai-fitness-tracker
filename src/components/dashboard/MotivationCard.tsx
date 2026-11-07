"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Utensils, Target, BatteryCharging, Timer } from "lucide-react";

const MOTIVATIONS = [
    {
        title: "İstikrar Anahtardır",
        text: "Hacim grafiğindeki yükselen trend (progressive overload), kas kütlesi kazanımının en büyük göstergesidir.",
        icon: TrendingUp,
    },
    {
        title: "Mutfakta İnşa Et",
        text: "Antrenmanda yıktığın kasları mutfakta inşa edersin. Günlük makrolarını takip etmeyi unutma.",
        icon: Utensils,
    },
    {
        title: "Disiplin > Motivasyon",
        text: "Motivasyon seni başlatır, disiplin ise devam etmeni sağlar. Bugün sınırlarını zorla.",
        icon: Target,
    },
    {
        title: "Dinlenme = Gelişim",
        text: "Kaslar çalışırken değil, dinlenirken büyür. Uyku ve toparlanma sürecine sadık kal.",
        icon: BatteryCharging,
    },
    {
        title: "Sürece Güven",
        text: "Gelişim zaman alır. Aynadaki değişimi görmek için sabırlı ol ve asla pes etme.",
        icon: Timer,
    },
];

/**
 * Dönen motivasyon kartı. Zamanlayıcı state'i bu bileşene izole edildiği için
 * her 3,5 saniyede yalnızca bu kart yeniden render olur (dashboard'un geri kalanı etkilenmez).
 */
export function MotivationCard() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % MOTIVATIONS.length);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const { title, text, icon: Icon } = MOTIVATIONS[index];

    return (
        <section aria-label="Motivasyon" className="flex flex-col justify-center rounded-3xl border border-line bg-surface p-6 text-center shadow-inner-glow">
            {/* key sayesinde ikon ve yazı aynı anda fade in/out animasyonuna girer */}
            <div key={index} className="animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400 shadow-glow-sm">
                    <Icon className="h-8 w-8" aria-hidden="true" />
                </div>

                <h3 className="mb-2 text-lg font-bold tracking-tight text-white">{title}</h3>
                <p className="flex h-16 items-center justify-center text-sm text-gray-400">{text}</p>
            </div>
        </section>
    );
}
