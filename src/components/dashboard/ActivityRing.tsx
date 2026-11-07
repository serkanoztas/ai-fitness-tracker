"use client";

import { useId } from "react";
import Link from "next/link";
import { ChevronRight, Flame, Target } from "lucide-react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { Skeleton } from "@/components/ui/Skeleton";
import type { DailyGoalsDTO } from "@/types/api";

interface Macros {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface ActivityRingProps {
    /** En son beslenme kaydı (sunucuda hazırlanır); kayıt yoksa null */
    latestNutrition: Macros | null;
}

// Halka geometrisi: r=46 -> çevre = 2πr
const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MACRO_ROWS = [
    { key: "protein", label: "Protein", color: "#38BDF8" },
    { key: "carbs", label: "Karbonhidrat", color: "#FBBF24" },
    { key: "fat", label: "Yağ", color: "#FB7185" },
] as const;

function statusFor(percent: number): { label: string; className: string } {
    if (percent > 110) return { label: "Hedef aşıldı", className: "text-amber-400" };
    if (percent >= 90) return { label: "Hedefte", className: "text-emerald-400" };
    if (percent >= 50) return { label: "İyi gidiyor", className: "text-brand-400" };
    if (percent > 0) return { label: "Başlangıç", className: "text-gray-400" };
    return { label: "Henüz kayıt yok", className: "text-gray-500" };
}

/**
 * Dairesel kalori göstergesi + makro dağılımı (neon halka).
 * Kalori son beslenme kaydından, hedef ise mevcut /api/user/goal uç noktasından gelir.
 */
export function ActivityRing({ latestNutrition }: ActivityRingProps) {
    const { data: goals, isLoading } = useApiQuery<DailyGoalsDTO | null>("/api/user/goal", null);
    // Mongo'da hedefler varsayılan olarak null'dır; kalori hedefi yoksa "hedef belirlenmedi" kabul edilir.
    const goal = goals?.calories ? goals : null;

    const baseId = useId().replace(/:/g, "");
    const gradientId = `${baseId}-grad`;
    const glowId = `${baseId}-glow`;

    const calories = latestNutrition?.calories ?? 0;
    const percent = goal ? (calories / goal.calories) * 100 : 0;
    const progress = Math.min(Math.max(percent, 0), 100) / 100;
    const offset = CIRCUMFERENCE * (1 - progress);
    const status = goal ? statusFor(percent) : null;

    return (
        <section
            aria-label="Günlük kalori özeti"
            className="relative flex flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-lg shadow-black/30"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight text-gray-200">Günlük Kalori</h2>
                <Link
                    href="/nutrition"
                    className="flex items-center gap-0.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                    Son kayıt <ChevronRight className="h-3 w-3" />
                </Link>
            </div>

            {/* Neon halka */}
            <div className="relative mx-auto my-4 h-44 w-44 sm:h-52 sm:w-52">
                <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label={goal ? `Hedefin yüzde ${Math.round(percent)} kadarı tamamlandı` : "Kalori hedefi belirlenmedi"}>
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF3E6C" />
                            <stop offset="100%" stopColor="#FF6B4A" />
                        </linearGradient>
                        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="#222530" strokeWidth="9" />
                    {progress > 0 && (
                        <circle
                            cx="60"
                            cy="60"
                            r={RADIUS}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth="9"
                            strokeLinecap="round"
                            strokeDasharray={CIRCUMFERENCE}
                            strokeDashoffset={offset}
                            filter={`url(#${glowId})`}
                            className="animate-ring-sweep"
                            style={{ ["--ring-length" as string]: CIRCUMFERENCE }}
                        />
                    )}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {isLoading ? (
                        <Skeleton className="h-16 w-24" />
                    ) : (
                        <>
                            <Flame className="mb-0.5 h-4 w-4 text-orange-400" aria-hidden="true" />
                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Kalori</span>
                            <span className="mt-0.5 text-3xl font-extrabold tracking-tight text-white">
                                {calories.toLocaleString("tr-TR")}
                            </span>
                            {goal ? (
                                <span className="text-[10px] text-gray-400">/ {goal.calories.toLocaleString("tr-TR")} kcal</span>
                            ) : (
                                <span className="text-[10px] text-gray-400">kcal</span>
                            )}
                            {status && (
                                <span className={`mt-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Hedef belirlenmemişse yönlendirme */}
            {!isLoading && !goal && (
                <Link
                    href="/nutrition"
                    className="mx-auto mb-4 inline-flex items-center gap-2 rounded-xl border border-brand-500/30 bg-brand-500/10 px-3.5 py-2 text-xs font-semibold text-brand-300 transition-all duration-200 hover:bg-brand-500/15 active:scale-[0.98]"
                >
                    <Target className="h-3.5 w-3.5" /> Kalori hedefi belirle
                </Link>
            )}

            {/* Makro dağılımı */}
            <ul className="grid grid-cols-3 gap-3">
                {MACRO_ROWS.map(({ key, label, color }) => {
                    const value = latestNutrition?.[key] ?? 0;
                    const target = goals?.[key] || null;
                    const ratio = target ? Math.min(value / target, 1) : value > 0 ? 1 : 0;

                    return (
                        <li key={key} className="rounded-2xl border border-line bg-canvas/40 p-3">
                            <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                                <span className="truncate text-[10px] font-medium text-gray-400">{label}</span>
                            </div>
                            <p className="mt-1 text-sm font-bold tracking-tight text-white">
                                {value}g
                                {target && <span className="ml-1 text-[10px] font-medium text-gray-500">/ {target}g</span>}
                            </p>
                            <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                                <div className="h-full rounded-full" style={{ width: `${ratio * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}80` }} />
                            </div>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
