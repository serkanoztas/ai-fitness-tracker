import type { MuscleGroup, WorkoutSplit } from "./index";

/**
 * API'den JSON olarak gelen veri tipleri (istemci tarafı).
 * Mongoose tiplerinden farkı: ObjectId/Date alanları JSON'da string'dir.
 */

export interface SetDTO {
    weight: number;
    reps: number;
    isPR: boolean;
}

export interface WorkoutExerciseDTO {
    /** Egzersiz silinmişse populate sonucu null olabilir */
    exercise: { _id: string; name: string; muscleGroup: MuscleGroup } | null;
    sets: SetDTO[];
    exerciseVolume: number;
}

export interface WorkoutDTO {
    _id: string;
    date: string;
    splitType: WorkoutSplit;
    totalVolume: number;
    exercises: WorkoutExerciseDTO[];
}

export interface NutritionLogDTO {
    _id: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    date: string;
}

export interface WeightLogDTO {
    _id: string;
    weight: number;
    date: string;
}

export interface DailyGoalsDTO {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

/** /api/ai/macro cevabı */
export interface MacroResultDTO extends DailyGoalsDTO {
    ai_advice?: string;
}
