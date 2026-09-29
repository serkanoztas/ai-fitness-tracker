import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

        const body = await req.json();
        const { calories, protein, carbs, fat } = body;

        await connectToDatabase();
        
        // Kullanıcının hedeflerini güncelle
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: { dailyGoals: { calories, protein, carbs, fat } } },
            { new: true }
        );

        return NextResponse.json({ message: "Hedef kaydedildi", goals: updatedUser.dailyGoals }, { status: 200 });
    } catch (error) {
        console.error("Hedef kaydetme hatası:", error);
        return NextResponse.json({ error: "Hedef kaydedilemedi" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

        await connectToDatabase();
        const user = await User.findById(session.user.id).lean();

        return NextResponse.json(user?.dailyGoals || null, { status: 200 });
    } catch (error) {
        console.error("Hedef getirme hatası:", error);
        return NextResponse.json({ error: "Hedef getirilemedi" }, { status: 500 });
    }
}