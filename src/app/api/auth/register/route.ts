import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { User } from "@/models/User";
import { ApiError, parseBody, withPublic } from "@/lib/api/handler";
import { RATE_LIMITS } from "@/lib/api/rateLimits";
import { registerSchema } from "@/lib/validation/schemas";

export const POST = withPublic(async ({ req }) => {
    const { name, email, password } = await parseBody(req, registerSchema);

    const existingUser = await User.findOne({ email }).select("_id").lean();
    if (existingUser) {
        throw new ApiError(409, "Bu email zaten kayıtlı.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword });

    return NextResponse.json({ message: "Kullanıcı başarıyla oluşturuldu." }, { status: 201 });
}, "Kayıt", { rateLimit: { ip: RATE_LIMITS.registerIp } });
