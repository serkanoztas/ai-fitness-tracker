"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Activity, Droplet, Flame, Scale, TrendingUp, Dumbbell, Zap, Bot } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // AI State'leri
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/dashboard");
                if (res.ok) {
                    const dashboardData = await res.json();
                    setData(dashboardData);
                }
            } catch (error) {
                console.error("Dashboard verisi çekilemedi", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchDashboardData();
        }
    }, [session]);

    const handleAiAnalysis = async () => {
        setIsAiLoading(true);
        setAiError(null);
        setAiAnalysis(null);

        try {
            const res = await fetch("/api/ai-analysis");
            const result = await res.json();

            if (res.ok) {
                setAiAnalysis(result.analysis);
            } else {
                setAiError(result.error || "Analiz alınırken bir hata oluştu.");
            }
        } catch (error) {
            setAiError("Sunucuya bağlanılamadı.");
        } finally {
            setIsAiLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Activity className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="font-medium animate-pulse">Verileriniz hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    const userName = session?.user?.name?.split(" ")[0] || "Şampiyon";

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">

            {/* Hoş Geldin Mesajı */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Merhaba, {userName} 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Bugün sınırlarını zorlamak için harika bir gün.
                    </p>
                </div>
            </div>

            {/* 1. BÖLÜM: İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Antrenman Hacmi Kartı */}
                <Link href="/workout/history" className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl group-hover:scale-110 transition-transform">
                            <Dumbbell className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Toplam Hacim</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {data?.totalVolume?.toLocaleString() || 0}
                            </span>
                            <span className="text-sm font-bold text-gray-400">kg</span>
                        </div>
                        <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1 font-medium">
                            <TrendingUp className="w-3 h-3" /> {data?.totalWorkouts || 0} Antrenman
                        </p>
                    </div>
                </Link>

                {/* Kalori Kartı */}
                <Link href="/nutrition" className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-50 dark:bg-orange-900/30 text-orange-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Flame className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Günlük Kalori</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {data?.latestNutrition?.calories || 0}
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
                <Link href="/weight" className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-xl group-hover:scale-110 transition-transform">
                            <Scale className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Vücut Ağırlığı</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-gray-900 dark:text-white">
                                {data?.latestWeight || "-"}
                            </span>
                            <span className="text-sm font-bold text-gray-400">kg</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 font-medium">Son güncel kilonuz</p>
                    </div>
                </Link>

                {/* AI Asistan Kartı */}
                <div className="bg-gradient-to-br from-indigo-600 to-blue-600 p-6 rounded-3xl shadow-lg border border-indigo-500/50 text-white flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Zap className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                        <div>
                            <div className="p-3 bg-white/20 w-fit rounded-xl backdrop-blur-sm mb-4">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-white/80 text-sm font-medium mb-1">AI Analizi</h3>
                            <p className="text-lg font-bold leading-tight mt-2">
                                Koçun verilerini incelemeye hazır.
                            </p>
                        </div>
                        <button
                            onClick={handleAiAnalysis}
                            disabled={isAiLoading}
                            className="mt-4 py-2 px-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                        >
                            {isAiLoading ? (
                                <><Activity className="w-4 h-4 animate-spin" /> Bekleyin...</>
                            ) : (
                                "Rapor İste"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. BÖLÜM: AI Rapor Alanı (Sadece analiz gelince görünür) */}
            {aiError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">
                    {aiError}
                </div>
            )}

            {aiAnalysis && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-6 md:p-8 rounded-3xl shadow-sm border border-indigo-100 dark:border-indigo-800/50">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-200 dark:border-indigo-800">
                        <div className="p-3 bg-indigo-500 text-white rounded-xl shadow-md">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">AI Koç Raporu</h3>
                            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Son antrenman ve beslenme verilerine dayalı özel analiz</p>
                        </div>
                    </div>

                    <div className="text-gray-800 dark:text-gray-200">
                        <ReactMarkdown
                            components={{
                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-3 text-indigo-900 dark:text-indigo-300" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3 text-indigo-800 dark:text-indigo-400" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2 text-indigo-700 dark:text-indigo-400" {...props} />,
                                p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-indigo-500" {...props} />,
                                li: ({ node, ...props }) => <li {...props} />,
                                strong: ({ node, ...props }) => <strong className="font-bold text-indigo-600 dark:text-indigo-400" {...props} />,
                            }}
                        >
                            {aiAnalysis}
                        </ReactMarkdown>
                    </div>
                </div>
            )}

            {/* 3. BÖLÜM: Grafikler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Antrenman Hacmi Trendi</h3>

                    {(!data?.historicalData || data.historicalData.length === 0) ? (
                        <div className="h-72 flex flex-col items-center justify-center text-gray-400">
                            <Activity className="w-8 h-8 mb-2 opacity-50" />
                            <p>Grafik için henüz antrenman verisi yok.</p>
                        </div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="volume"
                                        name="Hacim (kg)"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorVolume)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Sağ Taraf - Ekstra Bilgi veya Motivasyon Alanı */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">İstikrar Anahtardır</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Hacim grafiğindeki yükselen trend (progressive overload), kas kütlesi kazanımının en büyük ve güvenilir göstergesidir.
                    </p>
                </div>
            </div>

        </div>
    );
}