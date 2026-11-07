import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { WeightLog } from "@/models/WeightLog";
import { NutritionLog } from "@/models/NutritionLog";

/** Dashboard hacim grafiğinde gösterilen son antrenman sayısı */
const CHART_WORKOUT_COUNT = 30;

export interface DashboardData {
    totalVolume: number;
    totalWorkouts: number;
    latestWeight: number | null;
    latestNutrition: { calories: number; protein: number; carbs: number; fat: number } | null;
    /** Eskiden yeniye sıralı (grafik için hazır) */
    historicalData: { date: string; volume: number }[];
}

/** Dashboard için gereken tüm veriyi toplar. Server Component'lardan doğrudan çağrılır. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
    await connectToDatabase();

    const [totals, recentWorkouts, lastWeight, lastNutrition] = await Promise.all([
        // Toplamlar veritabanında hesaplanır; tüm antrenmanlar belleğe çekilmez.
        Workout.aggregate<{ totalVolume: number; count: number }>([
            { $match: { user: new Types.ObjectId(userId) } },
            { $group: { _id: null, totalVolume: { $sum: "$totalVolume" }, count: { $sum: 1 } } },
        ]),
        Workout.find({ user: userId }).select("date totalVolume").sort({ date: -1 }).limit(CHART_WORKOUT_COUNT).lean(),
        WeightLog.findOne({ user: userId }).sort({ date: -1 }).select("weight").lean(),
        NutritionLog.findOne({ user: userId }).sort({ date: -1 }).select("calories protein carbs fat").lean(),
    ]);

    const totalVolume = totals[0]?.totalVolume ?? 0;
    const totalWorkouts = totals[0]?.count ?? 0;

    // Sorgu yeniden eskiye çalışır; grafik için eskiden yeniye çevrilir.
    const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const historicalData = recentWorkouts.reverse().map((w) => ({
        date: dateFormatter.format(new Date(w.date)),
        volume: w.totalVolume || 0,
    }));

    const latestWeight = lastWeight?.weight ?? null;

    // ObjectId/Date içeren ham Mongo nesnesi yerine yalnızca gereken düz alanlar döndürülür
    const latestNutrition = lastNutrition
        ? {
              calories: lastNutrition.calories,
              protein: lastNutrition.protein,
              carbs: lastNutrition.carbs,
              fat: lastNutrition.fat,
          }
        : null;

    return {
        totalVolume,
        totalWorkouts,
        latestWeight,
        latestNutrition,
        historicalData,
    };
}
