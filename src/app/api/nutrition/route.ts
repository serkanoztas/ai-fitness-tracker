import { NextResponse } from "next/server";
import { NutritionLog } from "@/models/NutritionLog";
import { ApiError, parseBody, validate, withAuth } from "@/lib/api/handler";
import { parseLimit } from "@/lib/api/query";
import { createNutritionLogSchema, idParamSchema } from "@/lib/validation/schemas";

const DEFAULT_LIMIT = 365;
const MAX_LIMIT = 2000;

// GET: Kullanıcının son N beslenme kaydı (eskiden yeniye sıralı)
export const GET = withAuth(async ({ req, userId }) => {
    const limit = parseLimit(req, DEFAULT_LIMIT, MAX_LIMIT);

    const latest = await NutritionLog.find({ user: userId }).sort({ date: -1 }).limit(limit).lean();

    return NextResponse.json(latest.reverse(), { status: 200 });
}, "Beslenme GET");

// POST: Yeni bir günlük makro/kalori kaydı ekle (yalnızca oluşturulan kaydı döndürür)
export const POST = withAuth(async ({ req, userId }) => {
    const { calories, protein, carbs, fat } = await parseBody(req, createNutritionLogSchema);

    const created = await NutritionLog.create({ user: userId, calories, protein, carbs, fat });

    return NextResponse.json(created, { status: 201 });
}, "Beslenme POST");

// DELETE: belirli bir beslenme kaydını sil (yalnızca kendi kaydı)
export const DELETE = withAuth(async ({ req, userId }) => {
    const logId = validate(idParamSchema, new URL(req.url).searchParams.get("id"));

    const deleted = await NutritionLog.findOneAndDelete({ _id: logId, user: userId }).select("_id").lean();
    if (!deleted) {
        throw new ApiError(404, "Kayıt bulunamadı");
    }

    return NextResponse.json({ _id: logId }, { status: 200 });
}, "Beslenme DELETE");
