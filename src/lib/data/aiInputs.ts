import { trusted } from "mongoose";
import { Workout } from "@/models/Workout";
import { WeightLog } from "@/models/WeightLog";
import { NutritionLog } from "@/models/NutritionLog";
import "@/models/Exercise"; // populate için model kaydı
import type { LeanWorkout } from "@/types";
import type { NutritionPoint, WeightPoint } from "@/lib/ai/context";

const WEIGHT_WINDOW_DAYS = 30;
const NUTRITION_LOOKBACK = 50;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface AiInputs {
    latest: LeanWorkout;
    previous: LeanWorkout | null;
    weightLogs: WeightPoint[];
    nutritionLogs: NutritionPoint[];
}

const EXERCISE_POPULATE = { path: "exercises.exercise", select: "name muscleGroup" } as const;

/** AI analizi için gereken ham veriyi çeker. Hiç antrenman yoksa null döner. */
export async function loadAiInputs(userId: string, now = new Date()): Promise<AiInputs | null> {
    const latest = await Workout.findOne({ user: userId })
        .sort({ date: -1 })
        .select("date splitType totalVolume exercises")
        .populate(EXERCISE_POPULATE)
        .lean<LeanWorkout>();

    if (!latest) return null;

    const since = new Date(now.getTime() - WEIGHT_WINDOW_DAYS * DAY_MS);

    const [previous, windowWeights, latestWeight, nutritionLogs] = await Promise.all([
        // Elma ile elmayı kıyasla: aynı bölgedeki bir önceki antrenman
        Workout.findOne({ user: userId, splitType: latest.splitType, date: trusted({ $lt: latest.date }) })
            .sort({ date: -1 })
            .select("date splitType totalVolume exercises")
            .populate(EXERCISE_POPULATE)
            .lean<LeanWorkout>(),
        WeightLog.find({ user: userId, date: trusted({ $gte: since }) }).select("weight date").sort({ date: 1 }).lean<WeightPoint[]>(),
        // Son 30 günde kayıt yoksa bile güncel kiloyu bilmek için
        WeightLog.findOne({ user: userId }).sort({ date: -1 }).select("weight date").lean<WeightPoint>(),
        NutritionLog.find({ user: userId })
            .sort({ date: -1 })
            .limit(NUTRITION_LOOKBACK)
            .select("calories protein carbs fat date")
            .lean<NutritionPoint[]>(),
    ]);

    const weightLogs = windowWeights.length > 0 ? windowWeights : latestWeight ? [latestWeight] : [];

    return { latest, previous, weightLogs, nutritionLogs };
}
