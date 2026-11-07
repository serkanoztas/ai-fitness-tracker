import mongoose, { Schema, Model } from "mongoose";
import { IExercise } from "@/types";
import { MUSCLE_GROUPS } from "@/lib/constants";

// Aramalarda kullanılan collation ile aynı olmalı; aksi halde indeks sorguda kullanılamaz.
export const EXERCISE_NAME_COLLATION = { locale: "en", strength: 2 } as const;

const ExerciseSchema = new Schema<IExercise>(
    {
        name: { type: String, required: true, trim: true },
        muscleGroup: { type: String, enum: MUSCLE_GROUPS, required: true },
        // Sahip: null/yok -> sistem (seed) egzersizi, herkese açık. Dolu -> yalnızca o kullanıcıya özel.
        user: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },
    { timestamps: true }
);

// İsim, sahip bazında büyük/küçük harfe duyarsız tektir: aynı kullanıcı "Bench Press" ve "bench press"
// oluşturamaz, ama farklı kullanıcılar aynı isimde kendi egzersizlerini taşıyabilir.
// Sistem egzersizleri (user: null) arasında da isim tektir.
ExerciseSchema.index(
    { user: 1, name: 1 },
    { unique: true, collation: EXERCISE_NAME_COLLATION, name: "owner_name_ci_unique" }
);

export const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);
