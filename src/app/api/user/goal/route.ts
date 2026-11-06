import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { ApiError, parseBody, withAuth } from "@/lib/api/handler";
import { dailyGoalsSchema } from "@/lib/validation/schemas";

export const POST = withAuth(async ({ req, userId }) => {
    const dailyGoals = await parseBody(req, dailyGoalsSchema);

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { dailyGoals } },
        { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(404, "Kullanıcı bulunamadı");
    }

    return NextResponse.json({ message: "Hedef kaydedildi", goals: updatedUser.dailyGoals }, { status: 200 });
}, "Hedef POST");

export const GET = withAuth(async ({ userId }) => {
    const user = await User.findById(userId).select("dailyGoals").lean();
    return NextResponse.json(user?.dailyGoals ?? null, { status: 200 });
}, "Hedef GET");
