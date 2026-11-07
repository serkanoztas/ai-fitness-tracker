import { NextResponse } from "next/server";
import { Exercise, EXERCISE_NAME_COLLATION } from "@/models/Exercise";
import { withAuth } from "@/lib/api/handler";

// Sistem (seed) egzersizleri + kullanıcının kendi egzersizleri. Başka kullanıcıların egzersizleri görünmez.
export const GET = withAuth(async ({ userId }) => {
    const exercises = await Exercise.find({ $or: [{ user: null }, { user: userId }] })
        .collation(EXERCISE_NAME_COLLATION)
        .sort({ name: 1 })
        .select("name muscleGroup user")
        .lean();

    // Aynı isim hem sistemde hem kullanıcıda varsa yalnızca kullanıcınınki gösterilir (listede çift satır olmasın).
    const byName = new Map<string, (typeof exercises)[number]>();
    for (const ex of exercises) {
        const key = ex.name.toLowerCase();
        const current = byName.get(key);
        if (!current || (ex.user && !current.user)) byName.set(key, ex);
    }

    // Sahip bilgisi (user) istemciye gönderilmez.
    const result = [...byName.values()].map(({ _id, name, muscleGroup }) => ({ _id, name, muscleGroup }));
    return NextResponse.json(result, { status: 200 });
}, "Egzersiz GET");
