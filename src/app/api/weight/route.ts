import { User } from "@/models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";

const DUMMY_USER_ID = "64a2b9f3e4b0c1a2d3e4f5f6";

export async function GET() {
    try {
        await connectToDatabase();
        const user = await User.findById(DUMMY_USER_ID).lean();

        if (!user || !user.weightLogs) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(user.weightLogs, { status: 200 });
    }
    catch (error) {
        console.error("Kilo GET Hatası:", error);
        return NextResponse.json({ error: "Sunucu tarafında bir hata oluştu." }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json();

        const parsedWeight = Number(body.weight);

        // Bu sayı mı kontrolü
        if (!parsedWeight || isNaN(parsedWeight)) {
            return NextResponse.json({ error: "Geçersiz kilo değeri" }, { status: 400 });
        }

        // Kullanıcı varsa güncelle, yoksa upsert ile oluştur
        const updatedUser = await User.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(DUMMY_USER_ID) },
            {
                $push: { weightLogs: { weight: parsedWeight, date: new Date() } },
                $setOnInsert: { name: "Şampiyon", email: "test@test.com" } // Hiç kayıt yoksa failsafe
            },
            { new: true, upsert: true }
        );

        return NextResponse.json(updatedUser.weightLogs, { status: 201 });
    }
    catch (error) {
        console.error("Kilo POST Hatası:", error);
        return NextResponse.json({ error: "Kilo kaydedilemedi." }, { status: 500 });
    }

}