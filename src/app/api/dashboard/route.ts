import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const userId = session.user.id;

        // 1. Antrenman Verilerini Çek (Son 7 Günlük Hacim ve Toplam Hacim)
        const workouts = await Workout.find({ user: new mongoose.Types.ObjectId(userId) })
            .sort({ date: -1 })
            .lean();

        const totalVolume = workouts.reduce((sum, workout) => sum + (workout.totalVolume || 0), 0);
        const totalWorkouts = workouts.length;

        // Grafik için tarih formatlı veri haritası
        const historicalData = workouts.map((workout: any) => ({
            date: new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(new Date(workout.date)),
            volume: workout.totalVolume || 0,
        }));

        // 2. Kullanıcı Verilerini Çek (Kilo ve Beslenme)
        const user = await User.findById(userId).lean();

        const latestWeight = user?.weightLogs?.length
            ? user.weightLogs[user.weightLogs.length - 1].weight
            : null;

        const latestNutrition = user?.nutritionLogs?.length
            ? user.nutritionLogs[user.nutritionLogs.length - 1]
            : null;

        // Tüm verileri paketleyip gönder
        return NextResponse.json({
            totalVolume,
            totalWorkouts,
            latestWeight,
            latestNutrition,
            historicalData,
        }, { status: 200 });

    } catch (error) {
        console.error("Dashboard Veri Hatası:", error);
        return NextResponse.json({ error: "Veriler alınamadı." }, { status: 500 });
    }
}