import mongoose, { Schema, Model } from "mongoose";
import { IRoutine } from "@/types";
import { WORKOUT_SPLITS } from "@/lib/constants";

const RoutineSchema = new Schema<IRoutine>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        routineName: { type: String, required: true, trim: true },
        splitType: { type: String, enum: WORKOUT_SPLITS, required: true },
        exercises: [
            {
                exerciseName: { type: String, required: true, trim: true },
                sets: { type: Number, required: true, default: 1, min: 1, max: 50 },
            },
        ],
    },
    { timestamps: true }
);

RoutineSchema.index({ user: 1, createdAt: -1 });

export const Routine: Model<IRoutine> = mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema);
