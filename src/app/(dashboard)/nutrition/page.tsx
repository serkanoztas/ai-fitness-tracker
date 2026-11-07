"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Flame, Save, Activity, Droplet, Wheat, Utensils, Trash, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { CHART_TOOLTIP_LABEL_STYLE, CHART_TOOLTIP_STYLE } from "@/components/dashboard/chart-theme";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDialogs } from "@/components/ui/DialogProvider";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiRequest, getErrorMessage } from "@/lib/api/client";
import type { DailyGoalsDTO, NutritionLogDTO } from "@/types/api";

const EMPTY_FORM = { calories: "", protein: "", carbs: "", fat: "" };
const CALORIES_INPUT_ID = "nutrition-calories";

/** Boş durumdaki "İlk kaydı gir" aksiyonu: form alanına kaydırır ve odaklar. */
const focusCaloriesInput = () => {
    const input = document.getElementById(CALORIES_INPUT_ID);
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    input?.focus({ preventScroll: true });
};

export default function NutritionPage() {
    const { data: logs, setData: setLogs, isLoading, error } = useApiQuery<NutritionLogDTO[]>("/api/nutrition", []);
    const { data: goalsData, refetch: refetchGoals } = useApiQuery<DailyGoalsDTO | null>("/api/user/goal", null);

    // AI Makro Koçu yeni hedef kaydedince hedefleri yeniden çek
    useEffect(() => {
        window.addEventListener("dailyGoalsUpdated", refetchGoals);
        return () => window.removeEventListener("dailyGoalsUpdated", refetchGoals);
    }, [refetchGoals]);

    // Hedef henüz belirlenmemişse (kalori yoksa) hedef gösterimi kapalı kalır
    const goals = goalsData?.calories ? goalsData : null;

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { confirm } = useDialogs();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.calories) return;
        setIsSubmitting(true);

        try {
            const created = await apiRequest<NutritionLogDTO>("/api/nutrition", { method: "POST", body: formData });
            setLogs((prev) => [...prev, created]);
            setFormData(EMPTY_FORM);
            toast.success("Beslenme kaydı eklendi.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Kayıt eklenemedi."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (log: NutritionLogDTO) => {
        const id = log._id;
        const confirmed = await confirm({
            title: "Beslenme kaydını sil",
            description: `${log.calories} kcal'lik bu kayıt kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
            confirmLabel: "Sil",
            tone: "danger",
        });
        if (!confirmed) return;

        try {
            await apiRequest<{ _id: string }>(`/api/nutrition?id=${id}`, { method: "DELETE" });
            setLogs((prev) => prev.filter((log) => log._id !== id));
            toast.success("Kayıt silindi.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Kayıt silinemedi."));
        }
    };


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


    // YENİ: GEÇMİŞ GRAFİĞİ İÇİN VERİ HAZIRLIĞI (Son 7 Kayıt)
    const historyData = logs.slice(-7).map((log) => {
        // Mongo'dan gelen tarihi daha okunaklı yap (Örn: "29 Eyl")
        const dateObj = new Date(log.date);
        return {
            tarih: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(dateObj),
            kalori: log.calories,
        };
    });

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

            {error && <p className="text-sm text-red-500">{error}</p>}

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
                                    id={CALORIES_INPUT_ID}
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
                                    <Activity className="w-3 h-3 text-brand-500" /> Protein
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.protein}
                                        onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-lg font-bold focus:ring-2 focus:ring-brand-500 outline-none"
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
                                onClick={() => handleDelete(latestLog)}
                                aria-label="Beslenme kaydını sil"
                            >
                                <Trash className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 mb-6">En son kaydettiğin makro dağılımı</p>

                    {isLoading ? (
                        <LoadingRegion label="Beslenme verisi yükleniyor" className="flex-1 flex flex-col items-center gap-6">
                            <Skeleton className="h-48 w-48 !rounded-full" />
                            <div className="flex w-full justify-center gap-6">
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-20" />
                                <Skeleton className="h-10 w-20" />
                            </div>
                        </LoadingRegion>
                    ) : !latestLog ? (
                        <EmptyState
                            bare
                            className="flex-1"
                            icon={Utensils}
                            title="Henüz beslenme verisi yok"
                            description="İlk günlüğünü kaydettiğinde makro dağılımın burada görünecek."
                            action={{ label: "İlk kaydı gir", onClick: focusCaloriesInput, icon: Flame }}
                        />
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
                                            itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                            contentStyle={CHART_TOOLTIP_STYLE}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Halkanın Ortasındaki Yazı */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">
                                        {latestLog.calories} {goals && <span className="text-sm font-semibold text-gray-400">/ {goals.calories}</span>}
                                    </span>
                                    <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">kcal</span>
                                </div>
                            </div>

                            {/* Grafik Altı Lejant (Açıklamalar) */}
                            <div className="flex justify-center gap-6 mt-6 w-full">
                                {macroData.map((macro, i) => {
                                    // Makronun ingilizce anahtarını bul (hedefler objesinden çekmek için)
                                    const key = macro.name === "Protein" ? "protein" : macro.name === "Karbonhidrat" ? "carbs" : "fat";
                                    const goalValue = goals ? goals[key] : null;

                                    return (
                                        <div key={i} className="flex flex-col items-center">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: macro.color }}></div>
                                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{macro.name}</span>
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">
                                                {macro.value}g {goalValue && <span className="text-xs text-gray-400 font-medium">/ {goalValue}g</span>}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

            </div>


            {/*Kalori Geçmişi (Alan Grafiği) */}
            {logs.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-5 h-5 text-orange-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Kalori Geçmişi (Son 7 Kayıt)</h3>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorKalori" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="tarih" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    contentStyle={CHART_TOOLTIP_STYLE}
                                    itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                                    labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="kalori"
                                    stroke="#f97316"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorKalori)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

        </div>
    );
}