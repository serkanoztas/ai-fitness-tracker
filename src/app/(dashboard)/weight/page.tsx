"use client";

import { useEffect, useState } from "react";
import { Scale, Save, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

export default function WeightPage() {
    const [weightLogs, setWeightLogs] = useState<any[]>([]);
    const [newWeight, setNewWeight] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Veritabanından geçmiş kilo verilerini çek
    useEffect(() => {
        fetchWeightLogs();
    }, []);

    const fetchWeightLogs = async () => {
        try {
            const res = await fetch("/api/weight");
            if (res.ok) {
                const data = await res.json();
                setWeightLogs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWeight) return;
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/weight", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ weight: newWeight }),
            });

            if (res.ok) {
                const updatedLogs = await res.json();
                setWeightLogs(updatedLogs);
                setNewWeight(""); // Formu temizle
            }
        } catch (error) {
            console.error("Kayıt hatası:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Recharts'ın anlayacağı ve X ekseninde şık duracak tarih formatı
    const chartData = weightLogs.map((log) => ({
        ...log,
        formattedDate: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(log.date)),
    }));

    // Gelişim Analizi (Son kiloyu bir öncekiyle kıyasla)
    const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : null;
    const previousWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : null;

    let diff = 0;
    if (currentWeight && previousWeight) {
        diff = Number((currentWeight - previousWeight).toFixed(2));
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kilo Takibi</h1>
                    <p className="text-gray-500 text-sm">Gelişimini yakından izle.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* SOL: Yeni Kilo Giriş Formu */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 h-fit">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Bugünkü Kilon</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                min="30"
                                max="250"
                                value={newWeight}
                                onChange={(e) => setNewWeight(e.target.value)}
                                placeholder="Örn: 82.5"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-center text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kg</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? "Kaydediliyor..." : <><Save className="w-5 h-5" /> Kaydet</>}
                        </button>
                    </form>

                    {/* Mini Gelişim Özeti */}
                    {currentWeight && (
                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Güncel:</span>
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{currentWeight} kg</span>
                            </div>

                            {previousWeight && (
                                <div className="flex justify-between items-center mt-2 text-sm">
                                    <span className="text-gray-500">Değişim:</span>
                                    <div className={`flex items-center gap-1 font-semibold ${diff > 0 ? "text-blue-500" : diff < 0 ? "text-emerald-500" : "text-gray-500"
                                        }`}>
                                        {diff > 0 ? <TrendingUp className="w-4 h-4" /> : diff < 0 ? <TrendingDown className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                        {diff > 0 ? "+" : ""}{diff} kg
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SAĞ: Gelişim Grafiği (Recharts) */}
                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-6">Kilo Trendi</h3>

                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center text-gray-400 animate-pulse">
                            Grafik Yükleniyor...
                        </div>
                    ) : weightLogs.length < 2 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400">
                            <Scale className="w-8 h-8 mb-2 opacity-50" />
                            <p>Grafik çizilebilmesi için en az 2 gün kilo girmelisin.</p>
                        </div>
                    ) : (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                                    <XAxis
                                        dataKey="formattedDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        domain={['auto', 'auto']}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: '#6B7280' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ color: '#6B7280', marginBottom: '4px' }}
                                        itemStyle={{ color: '#059669', fontWeight: 'bold' }}
                                        cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="weight"
                                        name="Kilo"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                                        activeDot={{ r: 6, strokeWidth: 0, fill: "#10B981" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}