import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { ApiError, parseBody, withAuth } from "@/lib/api/handler";
import { createWeightLogSchema } from "@/lib/validation/schemas";

export const GET = withAuth(async ({ userId }) => {
    const user = await User.findById(userId).select("weightLogs").lean();
    return NextResponse.json(user?.weightLogs ?? [], { status: 200 });
}, "Kilo GET");

export const POST = withAuth(async ({ req, userId }) => {
    const { weight } = await parseBody(req, createWeightLogSchema);

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $push: { weightLogs: { weight, date: new Date() } } },
        { new: true }
    );
    if (!updatedUser) {
        throw new ApiError(404, "Kullanıcı bulunamadı");
    }

    return NextResponse.json(updatedUser.weightLogs, { status: 201 });
}, "Kilo POST");
