import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";
import { Exercise } from "@/models/Exercise"; // Populate işlemi için gerekli
import mongoose from "mongoose";

export async function GET() {
    try {
        await connectToDatabase();

        // Şimdilik test için sabit bir kullanıcı ID'si (Auth eklenince dinamik olacak)
        // Eğer veritabanında henüz bir User yoksa, hata vermemesi için genel bir query yapalım
        // NOT: Gerçek senaryoda bu ID'yi session'dan alacağız. 
        // Test amaçlı veritabanındaki İLK kullanıcıyı bulalım (yoksa dummy id kullanalım)
        const firstUser = await User.findOne();
        const userId = firstUser ? firstUser._id : new mongoose.Types.ObjectId("64a2b9f3e4b0c1a2d3e4f5f6");

        // Zaman dilimleri
        const now = new Date();
        const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Son 4 haftanın tüm antrenmanlarını getir ve egzersiz detaylarını (kas grubu vb.) eşleştir
        const workouts = await Workout.find({
            // user: userId, // Test aşamasında eğer user kaydı yoksa diye bu satırı yoruma alıyorum, herkesin antrenmanını çekecek
            date: { $gte: fourWeeksAgo },
        })
            .populate("exercises.exercise")
            .sort({ date: 1 })
            .lean(); // Performans için mongoose dökümanını saf JSON'a çevirir

        // Eğer hiç antrenman yoksa boş state dön
        if (!workouts || workouts.length === 0) {
            return NextResponse.json({
                stats: { monthlyVolume: 0, weeklyWorkouts: 0, currentWeight: 0, totalPRs: 0 },
                volumeData: [],
                muscleGroupData: [],
                aiContext: null,
            });
        }

        // --- HESAPLAMALAR ---
        let monthlyVolume = 0;
        let weeklyWorkouts = 0;
        let totalPRs = 0;

        // Haftalık bazda hacim tutmak için bucket (kova) dizisi
        const volumeByWeek = [
            { name: "Hafta 1", volume: 0 },
            { name: "Hafta 2", volume: 0 },
            { name: "Hafta 3", volume: 0 },
            { name: "Hafta 4", volume: 0 },
        ];

        // Kas grubu bazlı hacim tutmak için obje
        const volumeByMuscle: Record<string, number> = {};

        workouts.forEach((workout: any) => {
            monthlyVolume += workout.totalVolume || 0;

            // Bu haftanın antrenmanı mı?
            if (new Date(workout.date) >= oneWeekAgo) {
                weeklyWorkouts++;
            }

            // Hangi haftaya ait olduğunu bul (0-3 arası index)
            const diffTime = Math.abs(now.getTime() - new Date(workout.date).getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            let weekIndex = 3 - Math.floor(diffDays / 7);
            if (weekIndex < 0) weekIndex = 0;
            if (weekIndex > 3) weekIndex = 3;

            volumeByWeek[weekIndex].volume += workout.totalVolume || 0;

            // Egzersizleri ve PR'ları dön
            workout.exercises.forEach((ex: any) => {
                // PR sayısını hesapla
                ex.sets.forEach((set: any) => {
                    if (set.isPR) totalPRs++;
                });

                // Kas grubuna göre hacmi topla
                const muscle = ex.exercise?.muscleGroup || "Other";
                const exVol = ex.exerciseVolume || 0;

                if (volumeByMuscle[muscle]) {
                    volumeByMuscle[muscle] += exVol;
                } else {
                    volumeByMuscle[muscle] = exVol;
                }
            });
        });

        // Recharts kütüphanesinin beklediği dizi formatına çevir
        const muscleGroupData = Object.keys(volumeByMuscle).map((key) => ({
            name: key,
            volume: volumeByMuscle[key],
        }));

        // --- AI BAĞLAM (CONTEXT) VERİSİ HAZIRLAMA ---
        // AI analizi için sadece son antrenmana odaklanıyoruz
        const lastWorkout = workouts[workouts.length - 1];

        // Aynı split tipindeki (örn: Upper) bir önceki antrenmanı bul
        const previousSameSplitWorkout = workouts
            .slice(0, -1)
            .reverse()
            .find((w: any) => w.splitType === lastWorkout.splitType);

        const prevVol = previousSameSplitWorkout ? previousSameSplitWorkout.totalVolume : null;
        const volChange = prevVol ? ((lastWorkout.totalVolume - prevVol) / prevVol) * 100 : 0;

        // Kilo verisini şimdilik dummy gönderiyoruz (User modelini form ile beslediğimizde güncelleyeceğiz)
        const currentWeight = firstUser && firstUser.weightLogs?.length > 0
            ? firstUser.weightLogs[firstUser.weightLogs.length - 1].weight
            : 80;

        const aiContext = {
            splitType: lastWorkout.splitType,
            totalVolume: lastWorkout.totalVolume,
            previousWorkoutVolume: prevVol,
            volumeChangePercentage: Number(volChange.toFixed(1)),
            weightData: {
                currentWeight,
                weeklyChange: 0, // İleride hesaplanacak
            },
            muscleGroupVolumes: volumeByMuscle, // Basitleştirilmiş hali
            exercises: lastWorkout.exercises.map((ex: any) => ({
                exerciseName: ex.exercise?.name || "Bilinmeyen Egzersiz",
                muscleGroup: ex.exercise?.muscleGroup || "Diğer",
                currentPerformance: ex.sets.map((s: any) => ({
                    weight: s.weight,
                    reps: s.reps,
                    isPR: s.isPR || false,
                })),
                previousBest: null, // Aggregation ile daha detaylandırılabilir
            })),
        };

        // Tüm verileri paketle ve Frontend'e gönder
        return NextResponse.json(
            {
                stats: {
                    monthlyVolume: (monthlyVolume / 1000).toFixed(1) + " Ton", // kg'ı Ton'a çevir
                    weeklyWorkouts,
                    currentWeight: currentWeight + " kg",
                    totalPRs,
                },
                volumeData: volumeByWeek,
                muscleGroupData,
                aiContext,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Dashboard Veri Çekme Hatası:", error);
        return NextResponse.json(
            { error: "Dashboard verileri alınırken bir hata oluştu." },
            { status: 500 }
        );
    }
}