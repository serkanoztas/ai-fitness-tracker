import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Exercise } from "@/models/Exercise";

export async function GET() {
    try {
        await connectToDatabase();

        // Tüm egzersizleri alfabetik sıraya (name: 1) göre getiriyoruz
        const exercises = await Exercise.find({}).sort({ name: 1 });

        return NextResponse.json(exercises, { status: 200 });
    } catch (error: any) {
        console.error("GET Exercises Hatası:", error);
        return NextResponse.json(
            { error: "Egzersiz verileri getirilirken bir hata oluştu." },
            { status: 500 }
        );
    }
}