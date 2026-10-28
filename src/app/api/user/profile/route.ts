import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const { name, image } = body;

        if (!name || name.trim() === "") {
            return NextResponse.json({ error: "İsim alanı boş bırakılamaz" }, { status: 400 });
        }

        await connectToDatabase();

        // Kullanıcıyı bul ve isim/resim alanlarını güncelle
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { $set: { name, image } },
            { returnDocument: "after" } // UYARI BURADA DÜZELTİLDİ
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        return NextResponse.json(
            { message: "Profil başarıyla güncellendi", user: { name: updatedUser.name, image: updatedUser.image } }, 
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Profil PATCH Hatası:", error);
        return NextResponse.json({ error: "Profil güncellenirken bir hata oluştu." }, { status: 500 });
    }
}