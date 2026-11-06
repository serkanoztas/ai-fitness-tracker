import { NextResponse } from "next/server";
import { Routine } from "@/models/Routine";
import { ApiError, parseBody, validate, withAuth } from "@/lib/api/handler";
import { createRoutineSchema, idParamSchema } from "@/lib/validation/schemas";

// Kullanıcının kayıtlı şablonlarını (rutinlerini) getirir
export const GET = withAuth(async ({ userId }) => {
    const routines = await Routine.find({ user: userId }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(routines, { status: 200 });
}, "Rutin GET");

// Yeni bir şablon kaydeder
export const POST = withAuth(async ({ req, userId }) => {
    const { routineName, splitType, exercises } = await parseBody(req, createRoutineSchema);

    const newRoutine = await Routine.create({ user: userId, routineName, splitType, exercises });

    return NextResponse.json(newRoutine, { status: 201 });
}, "Rutin POST");

// İstenilen bir şablonu siler
export const DELETE = withAuth(async ({ req, userId }) => {
    const routineId = validate(idParamSchema, new URL(req.url).searchParams.get("id"));

    const deletedRoutine = await Routine.findOneAndDelete({ _id: routineId, user: userId });
    if (!deletedRoutine) {
        throw new ApiError(404, "Rutin bulunamadı veya yetkiniz yok");
    }

    return NextResponse.json({ message: "Rutin başarıyla silindi" }, { status: 200 });
}, "Rutin DELETE");
