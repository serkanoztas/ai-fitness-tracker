"use client";

import { useEffect, useState } from "react";
import { Flame, Save, Activity, Droplet, Wheat, Utensils, Trash } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";



export default function NutritionPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [formData, setFormData] = useState({ calories: "", protein: "", carbs: "", fat: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/nutrition");
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.calories) return;
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/nutrition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedLogs = await res.json();
                setLogs(updatedLogs);
                setFormData({ calories: "", protein: "", carbs: "", fat: "" }); // Formu temizle
            }
        } catch (error) {
            console.error("Kayıt hatası:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bu beslenme kaydını silmek istediğinden emin misin?")) return;
        try {
            const res = await fetch(`/api/nutrition?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setLogs((prev) => prev.filter((l) => l._id !== id));
            }
        }
        catch (error) {
            console.error("Beslenme kaydı silinemedi", error);
        }
    }


    // Son girilen kaydı bul (Grafik için)
    const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

    // Recharts için makro verisini hazırla
    const macroData = latestLog
        ? [
            { name: "Protein", value: latestLog.protein, color: "#3B82F6" }, // Mavi
            { name: "Karbonhidrat", value: latestLog.carbs, color: "#EAB308" }, // Sarı
            { name: "Yağ", value: latestLog.fat, color: "#EF4444" }, // Kırmızı
        ].filter((m) => m.value > 0) // Değeri 0 olanları grafikte gösterme
        : [];

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

            {/* Üst Başlık */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                    <Utensils className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Beslenme Takibi</h1>
                    <p className="text-gray-500 text-sm">Günlük kalori ve makro dağılımını izle.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* SOL: Veri Giriş Formu (7 Kolon) */}
                <div className="lg:col-span-7 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Bugünkü Tüketim
                    </h3>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Kalori (Büyük Alan) */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Toplam Kalori *</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    value={formData.calories}
                                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none"
                                    placeholder="Örn: 2500"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">kcal</span>
                            </div>
                        </div>

                        {/* Makrolar (Yan Yana 3 Kolon) */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                    <Activity className="w-3 h-3 text-blue-500" /> Protein
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.protein}
                                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="150"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                    <Wheat className="w-3 h-3 text-yellow-500" /> Karb
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.carbs}
                                        onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-yellow-500 outline-none"
                                        placeholder="250"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                                    <Droplet className="w-3 h-3 text-red-500" /> Yağ
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.fat}
                                        onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-red-500 outline-none"
                                        placeholder="70"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">g</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gray-900 dark:bg-orange-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20 disabled:opacity-70"
                        >
                            {isSubmitting ? "Kaydediliyor..." : <><Save className="w-5 h-5" /> Günlüğü Kaydet</>}
                        </button>
                    </form>
                </div>

                {/* SAĞ: Makro Dağılım Grafiği (5 Kolon) */}
                <div className="lg:col-span-5 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Son Durum</h3>
                        {latestLog && (
                            <button
                                className="ml-auto md:ml-1 p-2 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors group"
                                title="Beslenme kaydını Sil"
                                onClick={() => handleDelete(latestLog._id)}
                            >
                                <Trash className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">En son kaydettiğin makro dağılımı</p>

                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 animate-pulse">
                            Yükleniyor...
                        </div>
                    ) : !latestLog ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <Utensils className="w-10 h-10 mb-3 opacity-20" />
                            <p>Henüz beslenme verisi girmediniz.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center">

                            {/* Ortası Boş Halka (Donut) Grafik */}
                            <div className="h-48 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={macroData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // Halkanın kalınlığını belirler
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {macroData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Halkanın Ortasındaki Yazı */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                        {latestLog.calories}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">kcal</span>
                                </div>
                            </div>

                            {/* Grafik Altı Lejant (Açıklamalar) */}
                            <div className="flex justify-center gap-6 mt-6 w-full">
                                {macroData.map((macro, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></div>
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{macro.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">{macro.value}g</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
