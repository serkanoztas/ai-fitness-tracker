import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Routine } from "@/models/Routine";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// Kullanıcının kayıtlı şablonlarını (rutinlerini) getirir
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();

        const routines = await Routine.find({ user: new mongoose.Types.ObjectId(session.user.id) })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(routines, { status: 200 });
    } catch (error: any) {
        console.error("Rutin GET Hatası:", error);
        return NextResponse.json({ error: "Rutinler alınırken hata oluştu." }, { status: 500 });
    }
}

// Yeni bir şablon kaydeder
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const body = await req.json();
        const { routineName, splitType, exercises } = body;

        if (!routineName || !splitType || !exercises || exercises.length === 0) {
            return NextResponse.json({ error: "Eksik veri gönderildi." }, { status: 400 });
        }

        const newRoutine = await Routine.create({
            user: new mongoose.Types.ObjectId(session.user.id),
            routineName,
            splitType,
            exercises,
        });

        return NextResponse.json(newRoutine, { status: 201 });
    } catch (error: any) {
        console.error("Rutin POST Hatası:", error);
        return NextResponse.json({ error: "Rutin kaydedilemedi." }, { status: 500 });
    }
}

// İstenilen bir şablonu siler
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const url = new URL(req.url);
        const routineId = url.searchParams.get("id");

        if (!routineId) {
            return NextResponse.json({ error: "Geçersiz rutin ID'si" }, { status: 400 });
        }

        const deletedRoutine = await Routine.findOneAndDelete({
            _id: routineId,
            user: new mongoose.Types.ObjectId(session.user.id),
        });

        if (!deletedRoutine) {
            return NextResponse.json({ error: "Rutin bulunamadı veya yetkiniz yok" }, { status: 404 });
        }

        return NextResponse.json({ message: "Rutin başarıyla silindi" }, { status: 200 });
    } catch (error: any) {
        console.error("Rutin DELETE Hatası:", error);
        return NextResponse.json({ error: "Rutin silinirken hata oluştu." }, { status: 500 });
    }
}