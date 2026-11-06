import { NextResponse } from "next/server";
import { Exercise } from "@/models/Exercise";
import { withAuth } from "@/lib/api/handler";

export const GET = withAuth(async () => {
    // Tüm egzersizleri alfabetik sıraya (name: 1) göre getiriyoruz
    const exercises = await Exercise.find({}).sort({ name: 1 }).lean();
    return NextResponse.json(exercises, { status: 200 });
}, "Egzersiz GET");
