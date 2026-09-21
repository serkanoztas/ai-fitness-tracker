import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { processWorkoutData } from "@/lib/utils/workout";
import mongoose from "mongoose";

export async function POST(request: Request) {
    try {
        // 1. Veritabanı bağlantısını sağla
        await connectToDatabase();
        const body = await request.json();

        const { userId, splitType, exercises } = body;

        // 2. Basit veri doğrulama (Validation)
        if (!userId || !splitType || !exercises || !Array.isArray(exercises)) {
            return NextResponse.json(
                { error: "Eksik veya geçersiz antrenman verisi gönderildi." },
                { status: 400 }
            );
        }

        // 3. Egzersiz ID'lerini Object ID'ye çevir ve bir diziye al
        const exerciseIds = exercises.map((ex: any) => new mongoose.Types.ObjectId(ex.exerciseId));

        // 4. MONGODB AGGREGATION: Kullanıcının sadece bu antrenmanda yaptığı egzersizlerin geçmişteki en iyi rekorlarını bul
        const historicalData = await Workout.aggregate([
            // A. Kullanıcının tüm antrenmanlarını bul
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            // B. Egzersizler dizisini parçala (her egzersiz ayrı bir döküman gibi davranır)
            { $unwind: "$exercises" },
            // C. Sadece bugünkü antrenmanda olan egzersizleri filtrele
            { $match: { "exercises.exercise": { $in: exerciseIds } } },
            // D. Setleri parçala
            { $unwind: "$exercises.sets" },
            // E. Önce ağırlığa, sonra tekrara göre büyükten küçüğe sırala
            {
                $sort: {
                    "exercises.sets.weight": -1,
                    "exercises.sets.reps": -1,
                },
            },
            // F. Her egzersiz ID'si için en üstteki (en yüksek ağırlık/tekrar) sonucu grupla
            {
                $group: {
                    _id: "$exercises.exercise",
                    maxWeight: { $first: "$exercises.sets.weight" },
                    maxReps: { $first: "$exercises.sets.reps" },
                },
            },
        ]);

        // 5. Aggregation sonucunu utils fonksiyonumuzun istediği Record yapısına çevir
        const historicalBestRecords: Record<string, { maxWeight: number; maxReps: number }> = {};
        historicalData.forEach((item) => {
            historicalBestRecords[item._id.toString()] = {
                maxWeight: item.maxWeight,
                maxReps: item.maxReps,
            };
        });

        // 6. Yazdığımız yardımcı fonksiyon ile PR'ları tespit et ve hacimleri hesapla
        const { processedExercises, totalWorkoutVolume } = processWorkoutData(
            exercises,
            historicalBestRecords
        );

        // 7. İşlenmiş, volume hesaplanmış ve PR flag'leri atılmış veriyi veritabanına kaydet
        const newWorkout = await Workout.create({
            user: userId,
            splitType,
            exercises: processedExercises,
            totalVolume: totalWorkoutVolume,
            date: new Date(),
        });

        // 8. Başarılı yanıt dön
        return NextResponse.json(
            {
                message: "Antrenman hacimleri hesaplandı ve başarıyla kaydedildi.",
                workout: newWorkout,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Antrenman POST Hatası:", error);
        return NextResponse.json(
            { error: "Sunucu tarafında bir hata oluştu." },
            { status: 500 }
        );
    }
}