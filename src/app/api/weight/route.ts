import { User } from "@/models/User";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db/connect";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";


export async function GET() {
    try {

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findById(session.user.id).lean();

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

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const body = await req.json();

        const parsedWeight = Number(body.weight);

        // Bu sayı mı kontrolü
        if (!parsedWeight || isNaN(parsedWeight)) {
            return NextResponse.json({ error: "Geçersiz kilo değeri" }, { status: 400 });
        }

        // Kullanıcı varsa güncelle, yoksa upsert ile oluştur
        const updatedUser = await User.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(session.user.id) },
            { $push: { weightLogs: { weight: parsedWeight, date: new Date() } } },
            { new: true } // Sadece güncelleme yapıyoruz, upsert'e gerek kalmadı çünkü kullanıcı zaten auth olmuş
        );

        return NextResponse.json(updatedUser.weightLogs, { status: 201 });
    }
    catch (error) {
        console.error("Kilo POST Hatası:", error);
        return NextResponse.json({ error: "Kilo kaydedilemedi." }, { status: 500 });
    }

}