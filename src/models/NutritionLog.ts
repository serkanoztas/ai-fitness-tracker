import mongoose, { Schema, Model } from "mongoose";
import { INutritionLog } from "@/types";

const NutritionLogSchema = new Schema<INutritionLog>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        calories: { type: Number, required: true, min: 0, max: 20000 },
        protein: { type: Number, default: 0, min: 0, max: 2000 },
        carbs: { type: Number, default: 0, min: 0, max: 3000 },
        fat: { type: Number, default: 0, min: 0, max: 2000 },
        date: { type: Date, default: Date.now, required: true },
    },
    { versionKey: false }
);

NutritionLogSchema.index({ user: 1, date: -1 });

export const NutritionLog: Model<INutritionLog> =
    mongoose.models.NutritionLog || mongoose.model<INutritionLog>("NutritionLog", NutritionLogSchema);
