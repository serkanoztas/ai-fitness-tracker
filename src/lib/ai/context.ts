import { APP_TIME_ZONE } from "@/lib/constants";
import type { ISet, LeanWorkout, MuscleGroup, WorkoutSplit } from "@/types";

/**
 * AI'a gönderilen antrenman bağlamı. Hepsi veritabanından / sunucuda hesaplanmış, düz veridir;
 * LLM'den aritmetik yapması beklenmez (farklar ve toplamlar burada hazırlanır).
 */

export interface SetPoint {
    weight: number;
    reps: number;
}

export interface ExerciseSummary {
    name: string;
    muscleGroup: MuscleGroup;
    /** Örn: "80x8, 80x7, 77.5x8" (ağırlık x tekrar) */
    sets: string;
    bestSet: SetPoint;
    /** Aynı bölgedeki bir önceki antrenmanın bu egzersizdeki en iyi seti */
    previousBest: SetPoint | null;
    /** bestSet.weight - previousBest.weight (kg) */
    weightChangeKg: number | null;
}

export interface MuscleGroupVolume {
    volume: number;
    /** Bir önceki aynı bölge antrenmanına göre % değişim; önceki yoksa null */
    changePercent: number | null;
}

export interface WeightTrend {
    currentKg: number | null;
    /** Son 7 / 30 gündeki ilk ve son kayıt arasındaki fark (pencerede en az 2 kayıt yoksa null) */
    change7dKg: number | null;
    change30dKg: number | null;
}

export interface DailyNutrition {
    /** YYYY-MM-DD (uygulama saat dilimine göre) */
    date: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface AITrainingContext {
    splitType: WorkoutSplit;
    date: string;
    totalVolume: number;
    previousVolume: number | null;
    volumeChangePercent: number | null;
    muscleGroupVolumes: Partial<Record<MuscleGroup, MuscleGroupVolume>>;
    weight: WeightTrend;
    /** Kayıt bulunan en son günün toplamı */
    nutrition: DailyNutrition | null;
    exercises: ExerciseSummary[];
}

export interface WeightPoint {
    weight: number;
    date: Date;
}

export interface NutritionPoint {
    calories: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    date: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const round = (n: number, digits = 1) => {
    const f = 10 ** digits;
    return Math.round(n * f) / f;
};

const dayKeyFormatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
});

/** Tarihi uygulama saat diliminde "YYYY-MM-DD" anahtarına çevirir. */
export const toDayKey = (date: Date) => dayKeyFormatter.format(date);

/** Egzersiz adları prompt'a girer: etiket/ayraç karakterlerini ayıkla, uzunluğu sınırla. */
const sanitizeName = (name: string) => name.replace(/[<>`]/g, "").trim().slice(0, 80);

/** En ağır set; ağırlık eşitse daha çok tekrar yapılan. */
export function bestSet(sets: ISet[]): SetPoint | null {
    let best: ISet | null = null;
    for (const set of sets) {
        if (!best || set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) {
            best = set;
        }
    }
    return best ? { weight: best.weight, reps: best.reps } : null;
}

export const formatSets = (sets: ISet[]) => sets.map((s) => `${s.weight}x${s.reps}`).join(", ");

function volumeByMuscleGroup(workout: LeanWorkout): Map<MuscleGroup, number> {
    const result = new Map<MuscleGroup, number>();
    for (const ex of workout.exercises) {
        if (!ex.exercise) continue;
        const group = ex.exercise.muscleGroup;
        result.set(group, (result.get(group) ?? 0) + ex.exerciseVolume);
    }
    return result;
}

export function summarizeWeightTrend(logs: WeightPoint[], now: Date): WeightTrend {
    if (logs.length === 0) return { currentKg: null, change7dKg: null, change30dKg: null };

    const sorted = [...logs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const latest = sorted[sorted.length - 1];

    const changeWithin = (days: number) => {
        const since = now.getTime() - days * DAY_MS;
        const window = sorted.filter((l) => l.date.getTime() >= since);
        if (window.length < 2) return null;
        return round(window[window.length - 1].weight - window[0].weight, 2);
    };

    return { currentKg: latest.weight, change7dKg: changeWithin(7), change30dKg: changeWithin(30) };
}

/** Kayıt bulunan en son günün kalori/makro toplamı (aynı güne düşen birden fazla kayıt toplanır). */
export function summarizeDailyNutrition(logs: NutritionPoint[]): DailyNutrition | null {
    if (logs.length === 0) return null;

    const latestKey = toDayKey(logs.reduce((a, b) => (b.date > a.date ? b : a)).date);
    const total: DailyNutrition = { date: latestKey, calories: 0, protein: 0, carbs: 0, fat: 0 };

    for (const log of logs) {
        if (toDayKey(log.date) !== latestKey) continue;
        total.calories += log.calories;
        total.protein += log.protein ?? 0;
        total.carbs += log.carbs ?? 0;
        total.fat += log.fat ?? 0;
    }
    return total;
}

export interface BuildContextInput {
    latest: LeanWorkout;
    /** Aynı bölgedeki bir önceki antrenman */
    previous: LeanWorkout | null;
    weightLogs: WeightPoint[];
    nutritionLogs: NutritionPoint[];
    now: Date;
}

export function buildTrainingContext({ latest, previous, weightLogs, nutritionLogs, now }: BuildContextInput): AITrainingContext {
    // Önceki antrenmandaki en iyi setler egzersiz id'sine göre aranır (silinmiş egzersizler atlanır).
    const previousBestById = new Map<string, SetPoint>();
    for (const ex of previous?.exercises ?? []) {
        if (!ex.exercise) continue;
        const best = bestSet(ex.sets);
        if (best) previousBestById.set(String(ex.exercise._id), best);
    }

    const exercises: ExerciseSummary[] = [];
    for (const ex of latest.exercises) {
        if (!ex.exercise) continue;
        const best = bestSet(ex.sets);
        if (!best) continue;

        const previousBest = previousBestById.get(String(ex.exercise._id)) ?? null;
        exercises.push({
            name: sanitizeName(ex.exercise.name),
            muscleGroup: ex.exercise.muscleGroup,
            sets: formatSets(ex.sets),
            bestSet: best,
            previousBest,
            weightChangeKg: previousBest ? round(best.weight - previousBest.weight, 2) : null,
        });
    }

    const previousByGroup = previous ? volumeByMuscleGroup(previous) : null;
    const muscleGroupVolumes: AITrainingContext["muscleGroupVolumes"] = {};
    for (const [group, volume] of volumeByMuscleGroup(latest)) {
        const prevVolume = previousByGroup?.get(group);
        muscleGroupVolumes[group] = {
            volume: round(volume, 0),
            changePercent: prevVolume ? round(((volume - prevVolume) / prevVolume) * 100) : null,
        };
    }

    const previousVolume = previous?.totalVolume || null;

    return {
        splitType: latest.splitType,
        date: toDayKey(latest.date),
        totalVolume: round(latest.totalVolume, 0),
        previousVolume: previousVolume ? round(previousVolume, 0) : null,
        volumeChangePercent: previousVolume ? round(((latest.totalVolume - previousVolume) / previousVolume) * 100) : null,
        muscleGroupVolumes,
        weight: summarizeWeightTrend(weightLogs, now),
        nutrition: summarizeDailyNutrition(nutritionLogs),
        exercises,
    };
}
