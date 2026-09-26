"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Trophy, Dumbbell, Activity, ChevronRight, Search, History, Trash } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
    const [workouts, setWorkouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch("/api/workouts");
                if (res.ok) {
                    const data = await res.json();
                    setWorkouts(data);
                }
            } catch (error) {
                console.error("Geçmiş çekilemedi", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);


    const handleDelete = async (id: string) => {
        if (!window.confirm("Bu antrenamnı silmek istediğinden emin misin?")) return;

        try {
            const res = await fetch(`/api/workouts?id=${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setWorkouts((prev) => prev.filter((w) => w._id !== id));
            }
        }
        catch (error) {
            console.error("Antrenamn silinemedi", error);
        }
    }

    // Tarih formatlama (Örn: 22 Eylül 2026, Salı)
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("tr-TR", {
            day: "numeric",
            month: "long",
            year: "numeric",
            weekday: "long",
        }).format(date);
    };

    // Antrenmandaki toplam PR (Kişisel Rekor) sayısını hesaplayan yardımcı fonksiyon
    const calculateTotalPRs = (exercises: any[]) => {
        let prCount = 0;
        exercises.forEach((ex) => {
            ex.sets.forEach((set: any) => {
                if (set.isPR) prCount++;
            });
        });
        return prCount;
    };

    // Arama filtresi (Split tipine veya tarihe göre)
    const filteredWorkouts = workouts.filter((w) =>
        w.splitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(w.date).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-gray-400">
                    <History className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="font-medium animate-pulse">Geçmiş yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

            {/* Üst Kısım: Başlık ve Arama */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Antrenman Geçmişi
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Bugüne kadar kaydettiğin tüm antrenmanlar.
                    </p>
                </div>

                {/* Arama Çubuğu */}
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 outline-none transition-all shadow-sm"
                        placeholder="Antrenman ara (Örn: Upper, Eylül)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Antrenman Listesi */}
            {filteredWorkouts.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">Kayıtlı antrenman bulunamadı.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredWorkouts.map((workout) => {
                        const prCount = calculateTotalPRs(workout.exercises);

                        return (
                            <div
                                key={workout._id}
                                className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

                                    {/* Sol Kısım: Tarih ve Split Tipi */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-100 dark:border-blue-800/50">
                                            {workout.splitType.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {workout.splitType} Antrenmanı
                                                {prCount > 0 && (
                                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-500">
                                                        <Trophy className="w-3 h-3" /> {prCount} PR
                                                    </span>
                                                )}
                                            </h3>

                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <CalendarDays className="w-4 h-4" />
                                                {formatDate(workout.date)}
                                            </div>
                                        </div>
                                        <button className="ml-auto md:ml-0 p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Antrenmanı Sil">
                                            <Trash className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" onClick={() => handleDelete(workout._id)} />
                                        </button>
                                    </div>

                                    {/* Sağ Kısım: Metrikler (Mobilde alt alta, Webde yan yana) */}
                                    <div className="flex items-center gap-6 p-4 md:p-0 bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent rounded-xl">
                                        <div className="flex flex-col md:items-end">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Toplam Hacim</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                <Activity className="w-4 h-4 text-emerald-500" />
                                                {workout.totalVolume.toLocaleString()} kg
                                            </span>
                                        </div>

                                        <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

                                        <div className="flex flex-col md:items-end">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Egzersiz</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                <Dumbbell className="w-4 h-4 text-blue-500" />
                                                {workout.exercises.length} Hareket
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Alt Kısım: Detaylı Egzersiz ve Set Görünümü */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Egzersiz Detayları
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {workout.exercises.map((ex: any, exIndex: number) => (
                                            <div key={exIndex} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">

                                                {/* Egzersiz Başlığı ve Hacmi */}
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700/50">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">
                                                        {ex.exercise?.name || "Bilinmeyen Egzersiz"}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {ex.exerciseVolume} kg
                                                    </span>
                                                </div>

                                                {/* Setler */}
                                                <div className="space-y-1.5">
                                                    {ex.sets.map((set: any, setIndex: number) => (
                                                        <div
                                                            key={setIndex}
                                                            className={`flex justify-between items-center text-xs p-1.5 rounded-md px-2 ${set.isPR
                                                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-400 font-bold"
                                                                : "text-gray-600 dark:text-gray-400"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="opacity-70">Set {setIndex + 1}</span>
                                                                {set.isPR && <Trophy className="w-3 h-3 text-yellow-600 dark:text-yellow-500" />}
                                                            </div>
                                                            <span className={set.isPR ? "font-black" : "font-semibold text-gray-900 dark:text-white"}>
                                                                {set.weight} kg <span className="text-gray-400 font-normal mx-0.5">x</span> {set.reps}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}