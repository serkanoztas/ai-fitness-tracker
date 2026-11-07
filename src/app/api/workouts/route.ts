import { NextResponse } from "next/server";
import { Workout } from "@/models/Workout";
import { Exercise, EXERCISE_NAME_COLLATION } from "@/models/Exercise";
import { ApiError, parseBody, validate, withAuth } from "@/lib/api/handler";
import { createWorkoutSchema, idParamSchema, updateWorkoutSchema } from "@/lib/validation/schemas";
import { parseLimit } from "@/lib/api/query";

const WORKOUT_LIST_DEFAULT_LIMIT = 200;
const WORKOUT_LIST_MAX_LIMIT = 500;

/** İsme göre egzersiz id'sini döndürür; yoksa "Other" kas grubuyla oluşturur. */
async function resolveExerciseId(name: string) {
    // Büyük/küçük harf duyarsız eşleşme (regex yerine collation: kullanıcı girdisi sorgu desenine karışmaz)
    const find = () => Exercise.findOne({ name }).collation(EXERCISE_NAME_COLLATION).select("_id").lean();

    const existing = await find();
    if (existing) return existing._id;

    try {
        const created = await Exercise.create({ name, muscleGroup: "Other" });
        return created._id;
    } catch (err) {
        // Aynı anda aynı isimle iki istek gelirse unique index ihlali olur; tekrar aramak yeterli.
        if ((err as { code?: number }).code === 11000) {
            const raced = await find();
            if (raced) return raced._id;
        }
        throw err;
    }
}

// Kullanıcının gönderdiği antrenmanı doğrular, egzersizleri çözümler, toplam hacmi hesaplar ve kaydeder.
export const POST = withAuth(async ({ req, userId }) => {
    const { splitType, exercises } = await parseBody(req, createWorkoutSchema);

    const processedExercises = await Promise.all(
        exercises.map(async (ex) => {
            const exerciseId = await resolveExerciseId(ex.exerciseName);
            const sets = ex.sets.map((set) => ({ weight: set.weight, reps: set.reps, isPR: false }));
            const exerciseVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);

            return { exercise: exerciseId, sets, exerciseVolume };
        })
    );

    const totalVolume = processedExercises.reduce((sum, ex) => sum + ex.exerciseVolume, 0);

    const newWorkout = await Workout.create({
        user: userId, // Güvenlik: kullanıcı kimliği istemciden değil session'dan gelir
        splitType,
        exercises: processedExercises,
        totalVolume,
    });

    return NextResponse.json(newWorkout, { status: 201 });
}, "Antrenman POST");

export const GET = withAuth(async ({ req, userId }) => {
    const limit = parseLimit(req, WORKOUT_LIST_DEFAULT_LIMIT, WORKOUT_LIST_MAX_LIMIT);

    // Egzersiz isimlerini referanstan (ID) çekiyoruz ve en yeniden eskiye sıralıyoruz
    const workouts = await Workout.find({ user: userId })
        .populate("exercises.exercise")
        .sort({ date: -1 })
        .limit(limit)
        .lean();

    return NextResponse.json(workouts, { status: 200 });
}, "Antrenman GET");

export const DELETE = withAuth(async ({ req, userId }) => {
    const workoutId = validate(idParamSchema, new URL(req.url).searchParams.get("id"));

    const deletedWorkout = await Workout.findOneAndDelete({ _id: workoutId, user: userId });
    if (!deletedWorkout) {
        throw new ApiError(404, "Antrenman bulunamadı");
    }

    return NextResponse.json({ message: "Antrenman başarıyla silindi" }, { status: 200 });
}, "Antrenman DELETE");

export const PATCH = withAuth(async ({ req, userId }) => {
    const { workoutId, splitType } = await parseBody(req, updateWorkoutSchema);

    const updatedWorkout = await Workout.findOneAndUpdate(
        { _id: workoutId, user: userId },
        { $set: { splitType } },
        { new: true }
    );
    if (!updatedWorkout) {
        throw new ApiError(404, "Antrenman bulunamadı veya yetkiniz yok");
    }

    return NextResponse.json(updatedWorkout, { status: 200 });
}, "Antrenman PATCH");
