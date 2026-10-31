import { Document, Types } from "mongoose";
import mongoose from "mongoose";

export type MuscleGroup = "Chest" | "Back" | "Shoulders" | "Legs" | "Arms" | "Core" | "Other";
export type WorkoutSplit = "Upper" | "Lower" | "Push" | "Pull" | "Legs" | "FullBody" | "Other";

// Kullanıcı Kilo Logu
export interface IWeightLog {
    date: Date;
    weight: number;
}

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
    createdAt: Date;
    updatedAt: Date;
}

// Kullanıcı Modeli
export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    weightLogs: IWeightLog[];
    nutritionLogs: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        date: Date;
    }[];
    dailyGoals: {
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
    };
    createdAt: Date;
    updatedAt: Date;
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
    splitType: WorkoutSplit; // kendi belitlediğimiz tipi kullanıyoruz
    exercises: {
        exerciseName: string;
        sets: number;
    }[];
    createdAt: Date;
    updatedAt: Date;
}