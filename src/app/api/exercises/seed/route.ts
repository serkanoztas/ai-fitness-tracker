import { NextResponse } from "next/server";
import { ApiError, withAuth } from "@/lib/api/handler";
import { Exercise, EXERCISE_NAME_COLLATION } from "@/models/Exercise";
import type { MuscleGroup } from "@/types";

const INITIAL_EXERCISES: { name: string; muscleGroup: MuscleGroup }[] = [
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

export const POST = withAuth(async () => {
    // Bu endpoint yalnızca geliştirme ortamında çalışır; production'da hiç var olmamış gibi davranır.
    if (process.env.NODE_ENV === "production") {
        throw new ApiError(404, "Not found");
    }

    // Yıkıcı deleteMany yerine idempotent upsert: mevcut egzersizlerin _id'leri
    // (dolayısıyla Workout referansları) korunur, sadece eksik olanlar eklenir.
    const result = await Exercise.bulkWrite(
        INITIAL_EXERCISES.map((ex) => ({
            updateOne: {
                filter: { name: ex.name, user: null },
                update: { $setOnInsert: ex },
                upsert: true,
                // Unique indeksle aynı collation: "bench press" varsa "Bench Press" tekrar eklenmeye çalışılmaz.
                collation: EXERCISE_NAME_COLLATION,
            },
        }))
    );

    return NextResponse.json(
        { message: "Veritabanı başarıyla dolduruldu.", insertedCount: result.upsertedCount },
        { status: 201 }
    );
}, "Seed");
