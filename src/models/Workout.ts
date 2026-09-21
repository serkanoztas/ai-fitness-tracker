import mongoose, { Schema, Model } from "mongoose";
import { IWorkout } from "@/types";

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
        date: { type: Date, default: Date.now, required: true },
        splitType: {
            type: String,
            enum: ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Arms", "Other"],
            required: true,
        },
        exercises: [WorkoutExerciseSchema],
        totalVolume: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Workout: Model<IWorkout> = mongoose.models.Workout || mongoose.model<IWorkout>("Workout", WorkoutSchema);