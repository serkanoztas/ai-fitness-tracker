import mongoose, { Model } from "mongoose";
import { IUser } from "@/types";

const UserSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true, trim: true },
        // E-posta küçük harfe çevrilip kırpılır: "A@x.com" ile "a@x.com" aynı hesap sayılır.
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        // Varsayılan olarak sorgulara dahil edilmez; giriş akışında .select("+password") ile istenir.
        password: { type: String, required: true, select: false },
        image: { type: String, default: null },

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
