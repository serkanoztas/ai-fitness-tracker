import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { ApiError, parseBody, validate, withAuth } from "@/lib/api/handler";
import { createNutritionLogSchema, idParamSchema } from "@/lib/validation/schemas";

// GET: Kullanıcının beslenme geçmişini çek
export const GET = withAuth(async ({ userId }) => {
    const user = await User.findById(userId).select("nutritionLogs").lean();
    return NextResponse.json(user?.nutritionLogs ?? [], { status: 200 });
}, "Beslenme GET");

// POST: Yeni bir günlük makro/kalori kaydı ekle
export const POST = withAuth(async ({ req, userId }) => {
    const { calories, protein, carbs, fat } = await parseBody(req, createNutritionLogSchema);

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { nutritionLogs: { calories, protein, carbs, fat, date: new Date() } } },
        { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(404, "Kullanıcı bulunamadı");
    }

    return NextResponse.json(updatedUser.nutritionLogs, { status: 201 });
}, "Beslenme POST");

// DELETE: belirli bir beslenme kaydını sil
export const DELETE = withAuth(async ({ req, userId }) => {
    const logId = validate(idParamSchema, new URL(req.url).searchParams.get("id"));

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { nutritionLogs: { _id: logId } } },
        { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(404, "Kullanıcı bulunamadı");
    }

    return NextResponse.json(updatedUser.nutritionLogs, { status: 200 });
}, "Beslenme DELETE");
