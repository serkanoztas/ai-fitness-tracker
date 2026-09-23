import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { processWorkoutData } from "@/lib/utils/workout";
import { Exercise } from "@/models/Exercise";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";


// Bu API route'u, kullanıcının gönderdiği antrenman verilerini alır, geçmişteki en iyi rekorları bulur, PR'ları tespit eder, toplam hacmi hesaplar ve veritabanına kaydeder.
export async function POST(req: Request) {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }
        const userId = session.user.id; // Güvenlik için Frontend'den gelen ID'ye değil, Session'a güveniyoruz.

        await connectToDatabase();
        const body = await req.json();
        const { splitType, exercises } = body;


        if (!splitType || !exercises || exercises.length === 0) {
            return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
        }

        let totalVolume = 0;

        // Egzersizleri işle ve veritabanında yoksa yeni oluştur
        const processedExercises = await Promise.all(
            exercises.map(async (ex: any) => {
                let exerciseDbId;
                const exerciseName = ex.exerciseName.trim(); // Frontend'den artık ID değil isim geliyor

                // 1. Veritabanında bu isimde bir egzersiz var mı kontrol et (Büyük/küçük harf duyarsız)
                const existingEx = await Exercise.findOne({
                    name: { $regex: new RegExp("^" + exerciseName + "$", "i") }
                });

                if (existingEx) {
                    // Varsa mevcut ID'yi kullan
                    exerciseDbId = existingEx._id;
                } else {
                    // Yoksa yeni egzersiz olarak veritabanına kaydet (Varsayılan kas grubu "Other")
                    const newEx = await Exercise.create({
                        name: exerciseName,
                        muscleGroup: "Other"
                    });
                    exerciseDbId = newEx._id;
                }

                // 2. Volume hesaplama (Ağırlık x Tekrar)
                let exerciseVolume = 0;
                const processedSets = ex.sets.map((set: any) => {
                    exerciseVolume += set.weight * set.reps;
                    return { weight: set.weight, reps: set.reps, isPR: false };
                });

                totalVolume += exerciseVolume;

                return {
                    exercise: exerciseDbId,
                    sets: processedSets,
                    exerciseVolume,
                };
            })
        );

        // Antrenman kaydı
        const newWorkout = await Workout.create({
            user: new mongoose.Types.ObjectId(userId),
            splitType,
            exercises: processedExercises,
            totalVolume,
        });

        return NextResponse.json(newWorkout, { status: 201 });
    } catch (error: any) {
        console.error("Antrenman POST Hatası:", error);
        return NextResponse.json({ error: "Antrenman kaydedilemedi." }, { status: 500 });
    }
}

export async function GET() {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();

        //Egzersiz isimlerini referanstan (ID) çekiyoruz ve en yeniden eskiye sıralıyoruz
        const workouts = await Workout.find({ user: new mongoose.Types.ObjectId(session.user.id) })
            .populate("exercises.exercise")
            .sort({ date: -1 })
            .lean();

        return NextResponse.json(workouts, { status: 200 });

    }
    catch (error: any) {
        console.error("Antrenman GET Hatası:", error);
        return NextResponse.json(
            { error: "Antrenman geçmişi alınırken hata oluştu." },
            { status: 500 }
        );
    }
}