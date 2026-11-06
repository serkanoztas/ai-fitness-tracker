import { NextResponse } from "next/server";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";
import { withAuth } from "@/lib/api/handler";

export const GET = withAuth(async ({ userId }) => {
    // 1. Antrenman Verileri: yalnızca ihtiyaç duyulan alanlar çekilir
    const workouts = await Workout.find({ user: userId })
        .select("date totalVolume")
        .sort({ date: -1 })
        .lean();

    const totalVolume = workouts.reduce((sum, workout) => sum + (workout.totalVolume || 0), 0);
    const totalWorkouts = workouts.length;

    // Grafik için tarih formatlı veri haritası
    const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
    const historicalData = workouts.map((workout) => ({
        date: dateFormatter.format(new Date(workout.date)),
        volume: workout.totalVolume || 0,
    }));

    // 2. Kullanıcı Verileri (Kilo ve Beslenme)
    const user = await User.findById(userId).select("weightLogs nutritionLogs").lean();

    const latestWeight = user?.weightLogs?.length
        ? user.weightLogs[user.weightLogs.length - 1].weight
        : null;

    const latestNutrition = user?.nutritionLogs?.length
        ? user.nutritionLogs[user.nutritionLogs.length - 1]
        : null;

    return NextResponse.json(
        { totalVolume, totalWorkouts, latestWeight, latestNutrition, historicalData },
        { status: 200 }
    );
}, "Dashboard");
