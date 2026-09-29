"use client";

import { useState } from "react";
import { Bot, X, Sparkles, Activity, Flame, Check, ChevronRight } from "lucide-react";

const ACTIVITY_LEVELS = [
    { id: "sedanter", label: "Sedanter (Çok az/hiç egzersiz)" },
    { id: "hafif", label: "Hafif (Haftada 1-3 gün)" },
    { id: "ortalama", label: "Ortalama (Haftada 4-5 gün)" },
    { id: "aktif", label: "Aktif (Hergün veya yoğun)" },
    { id: "cok_aktif", label: "Çok Aktif (Haftada 6-7 çift idman)" },
];

const GOALS = [
    { id: "koruma", label: "Kilo Korumak" },
    { id: "hafif_kayip", label: "Hafif Kilo Kaybı (-0.25kg/hafta)" },
    { id: "ortalama_kayip", label: "Ortalama Kilo Kaybı (-0.5kg/hafta)" },
    { id: "asiri_kayip", label: "Hızlı Kilo Kaybı (-1kg/hafta)" },
    { id: "hafif_kazanim", label: "Hafif Kilo Kazanımı (+0.25kg/hafta)" },
    { id: "ortalama_kazanim", label: "Ortalama Kilo Kazanımı (+0.5kg/hafta)" },
];

export default function AIMacroAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const [formData, setFormData] = useState({
        age: "",
        gender: "Erkek",
        weight: "",
        height: "",
        activityLevel: "ortalama",
        goal: "koruma"
    });

    const handleCalculate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/macro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    age: Number(formData.age),
                    weight: Number(formData.weight),
                    height: Number(formData.height),
                    gender: formData.gender,
                    activityLevel: ACTIVITY_LEVELS.find(a => a.id === formData.activityLevel)?.label,
                    goal: GOALS.find(g => g.id === formData.goal)?.label,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                alert("Hesaplama sırasında bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveGoal = async () => {
        try {
            const res = await fetch("/api/user/goal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    calories: result.calories,
                    protein: result.protein,
                    carbs: result.carbs,
                    fat: result.fat,
                })
            });

            if (res.ok) {
                alert("Hedefiniz başarıyla güncellendi!");
                setIsOpen(false);
                setResult(null);
                // Beslenme sayfasında anında yansıması için sayfayı yeniliyoruz
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert("Kaydedilirken hata oluştu.");
        }
    };

    return (
        <div className="fixed z-[100] bottom-24 md:bottom-8 right-4 md:right-8 flex flex-col items-end">

            {/* AÇIK PENU (PANEL) */}
            {isOpen && (
                <div className="mb-4 w-[calc(100vw-2rem)] md:w-[400px] h-[80vh] md:h-[600px] max-h-[800px] bg-white dark:bg-gray-800 shadow-2xl rounded-3xl border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden transition-all animate-in slide-in-from-bottom-5">

                    {/* Panel Header */}
                    <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bot className="w-5 h-5 text-blue-100" />
                            <h3 className="font-bold">AI Makro Koçu</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Panel Body */}
                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                        {!result ? (
                            // FORM EKRANI
                            <form onSubmit={handleCalculate} className="space-y-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    Fiziksel özelliklerini ve hedefini gir, yapay zeka senin için kusursuz makro dağılımını hesaplasın.
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Yaş</label>
                                        <input type="number" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: 24" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Cinsiyet</label>
                                        <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                            <option>Erkek</option>
                                            <option>Kadın</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Boy (cm)</label>
                                        <input type="number" required value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: 180" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Kilo (kg)</label>
                                        <input type="number" required value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" placeholder="Örn: 75" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Aktivite Seviyesi</label>
                                    <select value={formData.activityLevel} onChange={e => setFormData({ ...formData, activityLevel: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                        {ACTIVITY_LEVELS.map(level => (
                                            <option key={level.id} value={level.id}>{level.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Ana Hedef</label>
                                    <select value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500">
                                        {GOALS.map(goal => (
                                            <option key={goal.id} value={goal.id}>{goal.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <span className="animate-pulse flex items-center gap-2"><Sparkles className="w-4 h-4" /> Gemini Hesaplanıyor...</span>
                                    ) : (
                                        <>Hesapla <ChevronRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </form>
                        ) : (
                            // SONUÇ EKRANI
                            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="text-center">
                                    <div className="w-16 h-16 mx-auto bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-3">
                                        <Flame className="w-8 h-8" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white">{result.calories} <span className="text-sm text-gray-500 font-medium">kcal</span></h2>
                                    <p className="text-xs text-gray-500 mt-1">Önerilen Günlük Kalori</p>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl text-center border border-blue-100 dark:border-blue-800/30">
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Protein</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{result.protein}g</p>
                                    </div>
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-2xl text-center border border-yellow-100 dark:border-yellow-800/30">
                                        <p className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider mb-1">Karb</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{result.carbs}g</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl text-center border border-red-100 dark:border-red-800/30">
                                        <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-1">Yağ</p>
                                        <p className="text-lg font-black text-gray-900 dark:text-white">{result.fat}g</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 relative">
                                    <Sparkles className="w-4 h-4 text-indigo-500 absolute top-4 right-4" />
                                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-2">Yapay Zeka Koçunun Tavsiyesi</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{result.ai_advice}"</p>
                                </div>

                                <button
                                    onClick={handleSaveGoal}
                                    className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-opacity"
                                >
                                    <Check className="w-5 h-5" /> Günlük Hedefim Olarak Kaydet
                                </button>

                                <button
                                    onClick={() => setResult(null)}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                                >
                                    Yeniden Hesapla
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* KAPALIYKEN GÖRÜNEN BUTON (FAB) */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center hover:scale-105 hover:shadow-blue-500/50 transition-all group"
                >
                    <Bot className="w-6 h-6 group-hover:animate-bounce" />
                </button>
            )}
        </div>
    );
}