import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Exercise } from "@/models/Exercise";

const INITIAL_EXERCISES = [
    // Chest
    { name: "Bench Press", muscleGroup: "Chest" },
    { name: "Incline Dumbbell Press", muscleGroup: "Chest" },
    { name: "Cable Crossover", muscleGroup: "Chest" },
    { name: "Push-ups", muscleGroup: "Chest" },
    // Back
    { name: "Pull-up", muscleGroup: "Back" },
    { name: "Barbell Row", muscleGroup: "Back" },
    { name: "Lat Pulldown", muscleGroup: "Back" },
    { name: "Deadlift", muscleGroup: "Back" },
    // Shoulders
    { name: "Overhead Press", muscleGroup: "Shoulders" },
    { name: "Lateral Raise", muscleGroup: "Shoulders" },
    { name: "Face Pull", muscleGroup: "Shoulders" },
    // Legs
    { name: "Squat", muscleGroup: "Legs" },
    { name: "Leg Press", muscleGroup: "Legs" },
    { name: "Romanian Deadlift", muscleGroup: "Legs" },
    { name: "Calf Raise", muscleGroup: "Legs" },
    // Arms
    { name: "Barbell Curl", muscleGroup: "Arms" },
    { name: "Tricep Pushdown", muscleGroup: "Arms" },
    { name: "Hammer Curl", muscleGroup: "Arms" },
    { name: "Skull Crushers", muscleGroup: "Arms" },
    // Core
    { name: "Crunch", muscleGroup: "Core" },
    { name: "Plank", muscleGroup: "Core" },
    { name: "Hanging Leg Raise", muscleGroup: "Core" },
];

export async function POST() {
    try {
        await connectToDatabase();

        // Mevcut tüm egzersizleri temizle (Çift kayıt olmaması için)
        await Exercise.deleteMany({});

        // Yeni verileri topluca ekle
        const result = await Exercise.insertMany(INITIAL_EXERCISES);

        return NextResponse.json(
            {
                message: "Veritabanı başarıyla dolduruldu.",
                insertedCount: result.length
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Seed Hatası:", error);
        return NextResponse.json(
            { error: "Veritabanı doldurulurken hata oluştu." },
            { status: 500 }
        );
    }
}