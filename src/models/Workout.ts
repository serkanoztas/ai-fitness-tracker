import mongoose, { Schema, Model } from "mongoose";
import { IWorkout } from "@/types";
import { WORKOUT_SPLITS } from "@/lib/constants";

const SetSchema = new Schema(
    {
        weight: { type: Number, required: true },
        reps: { type: Number, required: true },
        isPR: { type: Boolean, default: false },
    },
    { _id: false }
);

const WorkoutExerciseSchema = new Schema(
    {
        exercise: { type: Schema.Types.ObjectId, ref: "Exercise", required: true },
        sets: [SetSchema],
        exerciseVolume: { type: Number, default: 0 },
    },
    { _id: false }
);

const WorkoutSchema = new Schema<IWorkout>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        date: { type: Date, default: Date.now },
        splitType: { type: String, enum: WORKOUT_SPLITS, required: true },
        exercises: [WorkoutExerciseSchema],
        totalVolume: { type: Number, default: 0 },
    },
    { timestamps: true }
);

// Geçmiş listesi, dashboard ve "son antrenman" sorguları: { user } + date sıralaması
WorkoutSchema.index({ user: 1, date: -1 });
// AI analizi: aynı bölgedeki önceki antrenman { user, splitType, date < x }
WorkoutSchema.index({ user: 1, splitType: 1, date: -1 });

export const Workout: Model<IWorkout> = mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);