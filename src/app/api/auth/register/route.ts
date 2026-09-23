import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ message: "Tüm alanları doldurunuz." }, { status: 400 })
        }

        await connectToDatabase();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ message: "Bu email zaten kayıtlı." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            name,
            email,  
            password: hashedPassword,
        });

        return NextResponse.json({ message: "Kullanıcı başarıyla oluşturuldu." }, { status: 201 });
    }
    catch (error) {
        console.error("Kayıt hatası:", error);
        return NextResponse.json({ error: "Kayıt olurken bir hata oluştu." }, { status: 500 })
    }
}