import mongoose, { Schema, Document } from "mongoose";
import { IRoutine } from "../types/index";

const RoutineSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        routineName: { type: String, required: true },
        splitType: { type: String, required: true },
        exercises: [
            {
                exerciseName: { type: String, required: true },
                sets: { type: Number, required: true, default: 1 },
            },
        ],
    },
    { timestamps: true }
);

export const Routine = mongoose.models.Routine || mongoose.model<IRoutine>("Routine", RoutineSchema);