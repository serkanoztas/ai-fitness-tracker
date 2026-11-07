import { NextResponse } from "next/server";
import { WeightLog } from "@/models/WeightLog";
import { parseBody, withAuth } from "@/lib/api/handler";
import { parseLimit } from "@/lib/api/query";
import { createWeightLogSchema } from "@/lib/validation/schemas";

const DEFAULT_LIMIT = 365;
const MAX_LIMIT = 2000;

// Son N kaydı eskiden yeniye sıralı döndürür (grafik için hazır).
export const GET = withAuth(async ({ req, userId }) => {
    const limit = parseLimit(req, DEFAULT_LIMIT, MAX_LIMIT);

    const latest = await WeightLog.find({ user: userId }).sort({ date: -1 }).limit(limit).lean();

    return NextResponse.json(latest.reverse(), { status: 200 });
}, "Kilo GET");

// Yalnızca oluşturulan kaydı döndürür; istemci kendi listesine ekler.
export const POST = withAuth(async ({ req, userId }) => {
    const { weight } = await parseBody(req, createWeightLogSchema);

    const created = await WeightLog.create({ user: userId, weight });

    return NextResponse.json(created, { status: 201 });
}, "Kilo POST");
