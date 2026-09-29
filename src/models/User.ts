import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "../types/index";

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        weightLogs: [
            {
                weight: { type: Number, required: true },
                date: { type: Date, default: Date.now },
            },
        ],

        nutritionLogs: [
            {
                calories: { type: Number, required: true },
                protein: { type: Number, default: 0 },
                carbs: { type: Number, default: 0 },
                fat: { type: Number, default: 0 },
                date: { type: Date, default: Date.now },
            },
        ],

        dailyGoals: {
            calories: { type: Number, default: null },
            protein: { type: Number, default: null },
            carbs: { type: Number, default: null },
            fat: { type: Number, default: null },
        },
    },
    { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

