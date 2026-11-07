import type { Document, Types } from "mongoose";
import type { MUSCLE_GROUPS, WORKOUT_SPLITS } from "@/lib/constants";

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];
export type WorkoutSplit = (typeof WORKOUT_SPLITS)[number];

// Set Detayları
export interface ISet {
    weight: number;
    reps: number;
    isPR?: boolean; // Personal Record durumu
}

// Egzersiz Modeli
export interface IExercise extends Document {
    name: string;
    muscleGroup: MuscleGroup;
    /** null/yok: sistem egzersizi (herkese açık); dolu: yalnızca bu kullanıcıya özel */
    user?: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

// Kullanıcı Modeli
// Not: kilo ve beslenme kayıtları artık User içinde gömülü değil; ayrı koleksiyonlarda (WeightLog, NutritionLog).
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string | null;
    dailyGoals: {
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Kullanıcı Kilo Kaydı (ayrı koleksiyon)
export interface IWeightLog extends Document {
    user: Types.ObjectId;
    weight: number;
    date: Date;
}

// Kullanıcı Beslenme Kaydı (ayrı koleksiyon)
export interface INutritionLog extends Document {
    user: Types.ObjectId;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: Date;
}

// Antrenman İçindeki Tekil Egzersiz Kaydı
export interface IWorkoutExercise {
    exercise: Types.ObjectId | IExercise; // Referans
    sets: ISet[];
    exerciseVolume: number; // weight * reps * set (Backend'de hesaplanacak)
}

// Antrenman Modeli
export interface IWorkout extends Document {
    user: Types.ObjectId | IUser;
    date: Date;
    splitType: WorkoutSplit;
    exercises: IWorkoutExercise[];
    totalVolume: number; // Tüm egzersizlerin toplam volume değeri
    createdAt: Date;
    updatedAt: Date;
}

export interface IRoutine extends Document {
    user: Types.ObjectId | IUser; // IWorkout'taki gibi referans esnekliği sağlar
    routineName: string;
    splitType: WorkoutSplit;
    exercises: {
        exerciseName: string;
        sets: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

// --- Lean (düz nesne) sorgu sonuçları: populate("exercises.exercise", "name muscleGroup") sonrası ---

export interface LeanExercise {
    _id: Types.ObjectId;
    name: string;
    muscleGroup: MuscleGroup;
}

export interface LeanWorkoutExercise {
    /** Egzersiz silinmişse populate sonucu null olur */
    exercise: LeanExercise | null;
    sets: ISet[];
    exerciseVolume: number;
}

export interface LeanWorkout {
    _id: Types.ObjectId;
    date: Date;
    splitType: WorkoutSplit;
    totalVolume: number;
    exercises: LeanWorkoutExercise[];
}
