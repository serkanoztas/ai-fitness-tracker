"use client";

import Link from "next/link";
import { ChevronRight, Dumbbell, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { useApiQuery } from "@/hooks/useApiQuery";
import type { WorkoutDTO } from "@/types/api";

const RECENT_COUNT = 3;

const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", weekday: "short" });

/** Dashboard'daki "Son Antrenmanlar" listesi (mevcut /api/workouts?limit= uç noktasını kullanır). */
export function RecentWorkouts() {
    const { data: workouts, isLoading, error } = useApiQuery<WorkoutDTO[]>(`/api/workouts?limit=${RECENT_COUNT}`, []);

    return (
        <section aria-labelledby="recent-workouts-title" className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 id="recent-workouts-title" className="text-sm font-bold tracking-tight text-white">
                    Son Antrenmanlar
                </h2>
                <Link href="/workout/history" className="text-xs font-semibold text-brand-400 hover:underline">
                    Tümünü Gör
                </Link>
            </div>

            {isLoading ? (
                <LoadingRegion label="Son antrenmanlar yükleniyor" className="space-y-2.5">
                    {Array.from({ length: RECENT_COUNT }, (_, i) => (
                        <Skeleton key={i} className="h-[72px] w-full !rounded-2xl" />
                    ))}
                </LoadingRegion>
            ) : error ? (
                <p className="text-sm text-rose-400">{error}</p>
            ) : workouts.length === 0 ? (
                <EmptyState
                    icon={Dumbbell}
                    title="Henüz antrenman kaydın yok"
                    description="İlk antrenmanını kaydet; hacim trendin ve son antrenmanların burada görünsün."
                    action={{ label: "Antrenman başlat", href: "/workout/new", icon: Plus }}
                />
            ) : (
                <ul className="space-y-2.5">
                    {workouts.map((workout) => (
                        <li key={workout._id}>
                            <Link
                                href="/workout/history"
                                className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3 transition-all duration-200 hover:border-gray-600 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:scale-[0.99]"
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        aria-hidden="true"
                                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-sm font-black tracking-wide text-brand-400"
                                    >
                                        {workout.splitType.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-bold text-white">{workout.splitType} Antrenmanı</h3>
                                        <p className="mt-0.5 truncate text-[11px] text-gray-400">
                                            {dateFormatter.format(new Date(workout.date))}
                                            <span className="mx-1 text-gray-600">•</span>
                                            {workout.exercises.length} hareket
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5">
                                    <span className="text-sm font-semibold text-brand-400">
                                        {workout.totalVolume.toLocaleString("tr-TR")} kg
                                    </span>
                                    <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
