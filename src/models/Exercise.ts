import mongoose, { Schema, Model } from "mongoose";
import { IExercise } from "@/types";
import { MUSCLE_GROUPS } from "@/lib/constants";

// Aramalarda kullanılan collation ile aynı olmalı; aksi halde indeks sorguda kullanılamaz.
export const EXERCISE_NAME_COLLATION = { locale: "en", strength: 2 } as const;

const ExerciseSchema = new Schema<IExercise>(
    {
        name: { type: String, required: true, trim: true },
        muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
    },
    { timestamps: true }
);

// Büyük/küçük harfe duyarsız unique: "Bench Press" ve "bench press" artık ikinci bir kayıt olamaz.
// Eski `name_1` (harfe duyarlı) indeksiyle çakışmaması için açık bir isim verilmiştir.
ExerciseSchema.index({ name: 1 }, { unique: true, collation: EXERCISE_NAME_COLLATION, name: "name_ci_unique" });

export const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);
