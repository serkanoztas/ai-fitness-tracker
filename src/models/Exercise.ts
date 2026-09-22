import mongoose, { Schema, Model } from "mongoose";
import { IExercise } from "../types/index";

const ExerciseSchema = new Schema<IExercise>(
    {
        name: { type: String, required: true, unique: true },
        muscleGroup: {
            type: String,
            enum: ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Other"],
            required: true,
        },
    },
    { timestamps: true }
);

export const Exercise: Model<IExercise> = mongoose.models.Exercise || mongoose.model<IExercise>("Exercise", ExerciseSchema);