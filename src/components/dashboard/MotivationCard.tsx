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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center text-center">
            {/* key sayesinde ikon ve yazı aynı anda fade in/out animasyonuna girer */}
            <div key={index} className="animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-10 h-10" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm h-16 flex items-center justify-center">{text}</p>
            </div>
        </div>
    );
}
