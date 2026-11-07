import mongoose, { Schema, Model } from "mongoose";
import { IWeightLog } from "@/types";

const WeightLogSchema = new Schema<IWeightLog>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        weight: { type: Number, required: true, min: 20, max: 500 },
        date: { type: Date, default: Date.now, required: true },
    },
    { versionKey: false }
);

// "Kullanıcının son N kaydı" sorgusunun tamamı bu indeksten karşılanır.
WeightLogSchema.index({ user: 1, date: -1 });

export const WeightLog: Model<IWeightLog> =
    mongoose.models.WeightLog || mongoose.model<IWeightLog>("WeightLog", WeightLogSchema);
