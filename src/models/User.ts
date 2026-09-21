import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/index";

const WeightLogSchema = new Schema(
    {
        date: { type: Date, required: true },
        weight: { type: Number, required: true }
    },
    { _id: false } // Alt belge için _id alanını devre dışı bırak
);

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        weightLogs: { type: [WeightLogSchema] },
    },
    { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

