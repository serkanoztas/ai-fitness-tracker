import { NextResponse } from "next/server";
import { User } from "@/models/User";
import { ApiError, parseBody, withAuth } from "@/lib/api/handler";
import { updateProfileSchema } from "@/lib/validation/schemas";

export const PATCH = withAuth(async ({ req, userId }) => {
    const { name, image } = await parseBody(req, updateProfileSchema);

    // image gönderilmediyse (undefined) mevcut resmi silmemek için $set'e hiç eklemiyoruz.
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: image === undefined ? { name } : { name, image } },
        { returnDocument: "after" }
    );
    if (!updatedUser) {
        throw new ApiError(404, "Kullanıcı bulunamadı");
    }

    return NextResponse.json(
        { message: "Profil başarıyla güncellendi", user: { name: updatedUser.name, image: updatedUser.image } },
        { status: 200 }
    );
}, "Profil PATCH");
