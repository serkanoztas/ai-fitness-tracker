import Link from "next/link";
import { getServerSession } from "next-auth";
import { Activity, Flame, Scale, TrendingUp, Dumbbell } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import { getDashboardData } from "@/lib/data/dashboard";
import { AiCoach } from "@/components/dashboard/AiCoach";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { VolumeChart } from "@/components/dashboard/VolumeChart";

const CARD_CLASS =
    "bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group";

// Server Component: veri sunucuda çekilir, HTML hazır gelir (spinner / fetch waterfall yok).
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    // Oturum kontrolü middleware'de yapılır; burada yalnızca tip güvenliği için.
    const userId = session?.user?.id;
    const data = userId ? await getDashboardData(userId) : null;

    const userName = session?.user?.name?.split(" ")[0] || "Şampiyon";

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
            {/* Hoş Geldin Mesajı */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Merhaba, {userName} 👋</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Bugün sınırlarını zorlamak için harika bir gün.</p>
            </div>

            {/* 1. BÖLÜM: İstatistik Kartları + AI Koç */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Antrenman Hacmi Kartı */}
                <Link href="/workout/history" className={CARD_CLASS}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Toplam Hacim</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {(data?.totalVolume ?? 0).toLocaleString("tr-TR")}
                            </span>
                            <span className="text-sm font-bold text-gray-400">kg</span>
                        </div>
                        <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-3 h-3" /> {data?.totalWorkouts ?? 0} Antrenman
                        </p>
                    </div>
                </Link>

                {/* Kalori Kartı */}
                <Link href="/nutrition" className={CARD_CLASS}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Flame className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Günlük Kalori</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {data?.latestNutrition?.calories ?? 0}
                            </span>
                            <span className="text-sm font-bold text-gray-400">kcal</span>
                        </div>
                        {data?.latestNutrition ? (
                            <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-gray-500">
                                <span className="text-blue-500">{data.latestNutrition.protein}g P</span>
                                <span className="text-yellow-500">{data.latestNutrition.carbs}g K</span>
                                <span className="text-red-500">{data.latestNutrition.fat}g Y</span>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 mt-2 font-medium">Veri girilmedi</p>
                        )}
                    </div>
                </Link>

                {/* Kilo Kartı */}
                <Link href="/weight" className={CARD_CLASS}>
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Scale className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Vücut Ağırlığı</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">{data?.latestWeight ?? "-"}</span>
                            <span className="text-sm font-bold text-gray-400">kg</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Son güncel kilonuz</p>
                    </div>
                </Link>

                {/* AI Asistan Kartı + (oluşunca) rapor */}
                <AiCoach />
            </div>

            {/* 2. BÖLÜM: Grafik ve Motivasyon */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Antrenman Hacmi Trendi</h3>

                    {!data || data.historicalData.length === 0 ? (
                        <div className="h-72 flex flex-col items-center justify-center text-gray-400">
                            <Activity className="w-8 h-8 mb-2 opacity-50" />
                            <p>Grafik için henüz antrenman verisi yok.</p>
                        </div>
                    ) : (
                        <VolumeChart data={data.historicalData} />
                    )}
                </div>

                <MotivationCard />
            </div>
        </div>
    );
}
