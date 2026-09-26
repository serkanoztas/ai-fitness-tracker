import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET: Kullanıcının beslenme geçmişini çek
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const user = await User.findById(session.user.id).lean();

        if (!user || !user.nutritionLogs) {
            return NextResponse.json([], { status: 200 });
        }

        return NextResponse.json(user.nutritionLogs, { status: 200 });
    } catch (error) {
        console.error("Beslenme GET Hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
    }
}

// POST: Yeni bir günlük makro/kalori kaydı ekle
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const body = await req.json();
        const { calories, protein, carbs, fat } = body;

        // Sadece kalori zorunlu, diğerleri boş geçilirse 0 sayılacak
        if (!calories || isNaN(Number(calories))) {
            return NextResponse.json({ error: "Geçerli bir kalori değeri giriniz" }, { status: 400 });
        }

        const newLog = {
            calories: Number(calories),
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            date: new Date(),
        };

        const updatedUser = await User.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(session.user.id) },
            { $push: { nutritionLogs: newLog } },
            { new: true }
        );

        return NextResponse.json(updatedUser?.nutritionLogs, { status: 201 });
    } catch (error) {
        console.error("Beslenme POST Hatası:", error);
        return NextResponse.json({ error: "Kaydedilemedi" }, { status: 500 });
    }
}

// DELETE: belirli bir beslenme kaydını sil
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const url = new URL(req.url);
        const LogId = url.searchParams.get("id");

        if (!LogId) {
            return NextResponse.json({ error: "Geçersiz kalori ID" }, { status: 400 });
        }

        const updatedUser = await User.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(session.user.id) },
            { $pull: { nutritionLogs: { _id: new mongoose.Types.ObjectId(LogId) } } },
            { new: true }
        )

        if (!updatedUser) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json(updatedUser.nutritionLogs, { status: 200 });

    }
    catch (error) {
        console.error("Beslenme DELETE Hatası:", error);
        return NextResponse.json({ error: "Silinemedi" }, { status: 500 });
    }
}