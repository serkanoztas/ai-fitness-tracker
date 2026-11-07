"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Trophy, Dumbbell, Activity, Search, History, Trash, Edit2, X, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDialogs } from "@/components/ui/DialogProvider";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { useApiQuery } from "@/hooks/useApiQuery";
import { apiRequest, getErrorMessage } from "@/lib/api/client";
import { WORKOUT_SPLITS } from "@/lib/constants";
import type { WorkoutSplit } from "@/types";
import type { WorkoutDTO, WorkoutExerciseDTO } from "@/types/api";

const SPLIT_TYPES: readonly string[] = WORKOUT_SPLITS;

export default function HistoryPage() {
    const { data: workouts, setData: setWorkouts, isLoading, error } = useApiQuery<WorkoutDTO[]>("/api/workouts", []);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const { confirm } = useDialogs();

    const handleDelete = async (workout: WorkoutDTO) => {
        const id = workout._id;
        const confirmed = await confirm({
            title: "Antrenmanı sil",
            description: `${workout.splitType} antrenmanı (${formatDate(workout.date)}) ve içindeki tüm setler kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
            confirmLabel: "Sil",
            tone: "danger",
        });
        if (!confirmed) return;

        try {
            await apiRequest(`/api/workouts?id=${id}`, { method: "DELETE" });
            setWorkouts((prev) => prev.filter((w) => w._id !== id));
            toast.success("Antrenman silindi.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Antrenman silinemedi."));
        }
    };

    // Split Tipini (Bölgeyi) Güncelleyen Fonksiyon
    const handleUpdateSplit = async (id: string, newSplit: WorkoutSplit) => {
        try {
            await apiRequest(`/api/workouts`, { method: "PATCH", body: { workoutId: id, splitType: newSplit } });
            setWorkouts((prev) => prev.map((w) => (w._id === id ? { ...w, splitType: newSplit } : w)));
            setEditingId(null);
            toast.success("Antrenman tipi güncellendi.");
        } catch (err) {
            toast.error(getErrorMessage(err, "Güncellenirken bir hata oluştu."));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("tr-TR", {
            day: "numeric", month: "long", year: "numeric", weekday: "long",
        }).format(date);
    };

    const calculateTotalPRs = (exercises: WorkoutExerciseDTO[]) =>
        exercises.reduce((count, ex) => count + ex.sets.filter((set) => set.isPR).length, 0);

    const filteredWorkouts = workouts.filter((w) =>
        w.splitType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(w.date).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <LoadingRegion label="Antrenman geçmişi yükleniyor" className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                    <div className="space-y-3">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-80 max-w-full" />
                    </div>
                    <Skeleton className="h-11 w-full md:w-72" />
                </div>
                {Array.from({ length: 3 }, (_, i) => (
                    <div key={i} className="space-y-4 rounded-2xl border border-line bg-surface p-5">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-14 w-14 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-48 max-w-full" />
                                <Skeleton className="h-4 w-36" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <Skeleton className="h-24" />
                            <Skeleton className="hidden h-24 md:block" />
                        </div>
                    </div>
                ))}
            </LoadingRegion>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Antrenman Geçmişi</h1>
                    <p className="text-gray-500 dark:text-gray-400">Bugüne kadar kaydettiğin tüm antrenmanlar.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-brand-500 focus:border-brand-500 block w-full pl-10 p-3 outline-none transition-all shadow-sm"
                        placeholder="Antrenman ara (Örn: Upper, Eylül)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {workouts.length === 0 ? (
                <EmptyState
                    icon={History}
                    title="Henüz antrenman kaydın yok"
                    description="İlk antrenmanını kaydettiğinde hacim, set ve rekor geçmişin burada görünecek."
                    action={{ label: "İlk antrenmanı kaydet", href: "/workout/new", icon: Plus }}
                />
            ) : filteredWorkouts.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="Aramana uyan antrenman yok"
                    description={`"${searchTerm}" ile eşleşen bir kayıt bulunamadı. Farklı bir bölge veya ay adı deneyebilirsin.`}
                    action={{ label: "Aramayı temizle", onClick: () => setSearchTerm(""), icon: X }}
                />
            ) : (
                <div className="space-y-4">
                    {filteredWorkouts.map((workout) => {
                        const prCount = calculateTotalPRs(workout.exercises);

                        return (
                            <div key={workout._id} className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-100 dark:border-brand-800/50">
                                            {workout.splitType.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            {/* DÜZENLEME MODU KONTROLÜ */}
                                            {editingId === workout._id ? (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <select
                                                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-1.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-brand-500"
                                                        defaultValue={workout.splitType}
                                                        onChange={(e) => handleUpdateSplit(workout._id, e.target.value as WorkoutSplit)}
                                                    >
                                                        {SPLIT_TYPES.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                    <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {workout.splitType} Antrenmanı
                                                    {prCount > 0 && (
                                                        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full dark:bg-yellow-900/30 dark:text-yellow-500">
                                                            <Trophy className="w-3 h-3" /> {prCount} PR
                                                        </span>
                                                    )}
                                                </h3>
                                            )}

                                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                <CalendarDays className="w-4 h-4" />
                                                {formatDate(workout.date)}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sağ Kısım ve Aksiyon Butonları */}
                                    <div className="flex flex-row-reverse md:flex-row items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => setEditingId(workout._id)}
                                                className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Antrenman Tipini Değiştir"
                                            >
                                                <Edit2 className="w-5 h-5 text-gray-500 hover:text-brand-500 transition-colors" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(workout)}
                                                aria-label="Antrenmanı sil"
                                                className="p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                title="Antrenmanı Sil"
                                            >
                                                <Trash className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
                                            </button>
                                        </div>

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
                                                    <Dumbbell className="w-4 h-4 text-brand-500" />
                                                    {workout.exercises.length} Hareket
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Alt Kısım Detayları (Aynı Bırakıldı) */}
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {workout.exercises.map((ex, exIndex) => (
                                            <div key={exIndex} className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 dark:border-gray-700/50">
                                                    <span className="font-bold text-gray-900 dark:text-white text-sm">{ex.exercise?.name || "Bilinmeyen Egzersiz"}</span>
                                                    <span className="text-xs text-gray-500 font-medium">{ex.exerciseVolume} kg</span>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {ex.sets.map((set, setIndex) => (
                                                        <div key={setIndex} className={`flex justify-between items-center text-xs p-1.5 rounded-md px-2 ${set.isPR ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-400 font-bold" : "text-gray-600 dark:text-gray-400"}`}>
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