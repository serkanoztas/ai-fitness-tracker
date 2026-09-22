"use client";

import { useEffect, useState } from "react";
import { useCompletion } from "@ai-sdk/react"; // Güncellenmiş import
import { Activity, TrendingUp, Scale, Flame, BrainCircuit, Dumbbell, PlusCircle } from "lucide-react";
import Link from "next/link";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
    // --- STATELER ---
    const [stats, setStats] = useState({
        monthlyVolume: "0 Ton",
        weeklyWorkouts: 0,
        currentWeight: "0 kg",
        totalPRs: 0,
    });
    const [volumeData, setVolumeData] = useState([]);
    const [muscleGroupData, setMuscleGroupData] = useState([]);
    const [aiContext, setAiContext] = useState(null);

    // Sayfanın genel yüklenme durumu
    const [isDashboardLoading, setIsDashboardLoading] = useState(true);

    // Vercel AI SDK
    const { completion, complete, isLoading: isAILoading } = useCompletion({
        api: "/api/ai/analyze",
    });

    // --- 1. VERİTABANINDAN VERİ ÇEKME ---
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch("/api/dashboard");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data.stats);
                    setVolumeData(data.volumeData);
                    setMuscleGroupData(data.muscleGroupData);

                    // Eğer kullanıcının en az 1 antrenmanı varsa AI context'i doldur
                    if (data.aiContext) {
                        setAiContext(data.aiContext);
                    }
                }
            } catch (error) {
                console.error("Dashboard veri çekme hatası:", error);
            } finally {
                setIsDashboardLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // --- 2. AI ANALİZİNİ TETİKLEME ---
    // aiContext state'i dolduğu anda AI'a analiz isteğini gönder
    useEffect(() => {
        if (aiContext) {
            complete("Son antrenmanımı analiz et.", {
                body: { contextData: aiContext }, // API'ye dinamik gövdeyi yolluyoruz
            });
        }
        // Sadece aiContext değiştiğinde çalışması için
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aiContext]);

    // --- EKRAN YÜKLENİYOR DURUMU ---
    if (isDashboardLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <Dumbbell className="w-10 h-10 animate-bounce text-blue-500" />
                    <p className="font-medium animate-pulse">Antrenman verilerin analiz ediliyor...</p>
                </div>
            </div>
        );
    }

    // --- HİÇ ANTRENMAN YOKSA (EMPTY STATE) ---
    if (!aiContext && !isDashboardLoading) {
        return (
            <div className="max-w-4xl mx-auto mt-12 p-6 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Activity className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Henüz Antrenman Verisi Yok</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                        Yapay zeka koçunun performansını analiz etmesi ve grafiklerini çizebilmesi için ilk antrenmanını kaydetmelisin.
                    </p>
                    <Link
                        href="/workout/new"
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                        <PlusCircle className="w-5 h-5" />
                        İlk Antrenmanını Ekle
                    </Link>
                </div>
            </div>
        );
    }

    // --- ANA DASHBOARD EKRANI ---
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            {/* ÜST BİLGİ VE AI KARTI */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Tekrar Hoş Geldin! 👋
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {aiContext?.volumeChangePercentage > 0 ? (
                            <>Son antrenmanında aynı split'e göre hacmini <strong className="text-green-500">%{aiContext.volumeChangePercentage}</strong> artırdın. Harika gidiyorsun!</>
                        ) : (
                            <>İşte son antrenmanının detaylı performans analizi.</>
                        )}
                    </p>
                </div>

                {/* AI ANALİZ KUTUSU */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden min-h-[250px]">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10">
                        <BrainCircuit className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <BrainCircuit className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-semibold text-lg">AI Koç Analizi</h2>
                        </div>

                        <div className="text-blue-50 text-sm leading-relaxed prose prose-invert max-w-none">
                            {isAILoading && !completion ? (
                                <div className="flex items-center gap-2 animate-pulse mt-4">
                                    <span className="w-2 h-2 bg-white rounded-full"></span>
                                    <span className="w-2 h-2 bg-white rounded-full delay-75"></span>
                                    <span className="w-2 h-2 bg-white rounded-full delay-150"></span>
                                    <span className="ml-2">Verileriniz işleniyor...</span>
                                </div>
                            ) : (
                                <div className="whitespace-pre-wrap">{completion}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* İSTATİSTİK KARTLARI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Aylık Toplam Hacim", value: stats.monthlyVolume, icon: Activity, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { label: "Bu Haftaki Antrenman", value: stats.weeklyWorkouts, icon: Dumbbell, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
                    { label: "Vücut Ağırlığı", value: stats.currentWeight, icon: Scale, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
                    { label: "Kırılan Rekor (PR)", value: stats.totalPRs, icon: Flame, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* GRAFİKLER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Haftalık Volume Trendi */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white">Haftalık Antrenman Hacmi</h3>
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={volumeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} width={45} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '3 3' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="#2563EB"
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 2 }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Kas Grubu Dağılımı */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-gray-800 dark:text-white">Kas Grubu Dağılımı (Son 4 Hafta)</h3>
                        <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={muscleGroupData} layout="vertical" margin={{ left: 0, right: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280', fontWeight: 500 }} width={70} />
                                <Tooltip
                                    cursor={{ fill: '#F3F4F6' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="volume" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}