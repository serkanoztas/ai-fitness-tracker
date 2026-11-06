import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";

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

    const [workouts, user] = await Promise.all([
        Workout.find({ user: userId }).select("date totalVolume").sort({ date: 1 }).lean(),
        User.findById(userId).select("weightLogs nutritionLogs").lean(),
    ]);

    const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

    const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const historicalData = workouts.map((w) => ({
        date: dateFormatter.format(new Date(w.date)),
        volume: w.totalVolume || 0,
    }));

    const latestWeight = user?.weightLogs?.length ? user.weightLogs[user.weightLogs.length - 1].weight : null;

    // ObjectId/Date içeren ham Mongo nesnesi yerine yalnızca gereken düz alanlar döndürülür
    const lastNutrition = user?.nutritionLogs?.length ? user.nutritionLogs[user.nutritionLogs.length - 1] : null;
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
        totalWorkouts: workouts.length,
        latestWeight,
        latestNutrition,
        historicalData,
    };
}
