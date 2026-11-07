/**
 * Tek seferlik migration (Ana Başlık 4): egzersiz sahipliği.
 *
 * Eskiden bir antrenmanda bilinmeyen bir egzersiz adı yazılınca, herkese açık global bir `Exercise` oluşuyordu.
 * Artık böyle egzersizler oluşturan kullanıcıya özeldir (`user` alanı). Bu script:
 *
 *   1. Otomatik oluşturulmuş global egzersizleri bulur (muscleGroup "Other" ve sahibi yok; seed listesinde
 *      "Other" grubu yoktur) ve antrenmanlardaki kullanımına bakar:
 *        - tek bir kullanıcı kullanmışsa -> o kullanıcıya atanır
 *        - birden fazla kullanıcı kullanmışsa -> global kalır (raporlanır)
 *        - hiç kullanılmamışsa -> global kalır (raporlanır, silinmez)
 *   2. Eski indeksi (`name_ci_unique`: yalnızca isme göre tek) kaldırıp yenisini (`owner_name_ci_unique`:
 *      sahip + isim) oluşturur.
 *
 * İdempotenttir; tekrar çalıştırmak güvenlidir.
 *
 * Kullanım (proje kökünden):
 *   node --env-file=.env.local scripts/migrate-exercise-owners.mjs           # DRY-RUN: sadece rapor
 *   node --env-file=.env.local scripts/migrate-exercise-owners.mjs --apply   # değişiklikleri uygular
 *
 * Önce veritabanının yedeğini alın.
 */
import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI tanımlı değil. `node --env-file=.env.local scripts/migrate-exercise-owners.mjs` ile çalıştırın.");
    process.exit(1);
}

const COLLATION = { locale: "en", strength: 2 };
const log = console.log;

async function assignOwners(db) {
    const exercises = db.collection("exercises");
    const workouts = db.collection("workouts");

    const candidates = await exercises
        .find({ muscleGroup: "Other", $or: [{ user: null }, { user: { $exists: false } }] })
        .project({ name: 1 })
        .toArray();

    const stats = { candidates: candidates.length, assigned: 0, shared: [], unused: [] };

    for (const ex of candidates) {
        const users = await workouts.distinct("user", { "exercises.exercise": ex._id });

        if (users.length === 1) {
            stats.assigned++;
            if (APPLY) await exercises.updateOne({ _id: ex._id }, { $set: { user: users[0] } });
        } else if (users.length > 1) {
            stats.shared.push(ex.name);
        } else {
            stats.unused.push(ex.name);
        }
    }

    log(`Aday (otomatik oluşturulmuş global) egzersiz: ${stats.candidates}`);
    log(`Tek kullanıcıya atanacak/atanan: ${stats.assigned}`);
    log(`Birden fazla kullanıcının kullandığı (global kalır): ${stats.shared.length}`, stats.shared.length ? stats.shared : "");
    log(`Hiç kullanılmayan (global kalır, silinmedi): ${stats.unused.length}`, stats.unused.length ? stats.unused : "");
}

async function swapIndex(db) {
    const exercises = db.collection("exercises");

    // Yeni indeks sahip bazında benzersizlik ister: aynı (sahip, isim) çifti birden fazla varsa kurulamaz.
    const dupes = await exercises
        .aggregate(
            [
                { $group: { _id: { user: { $ifNull: ["$user", null] }, name: "$name" }, ids: { $push: "$_id" }, n: { $sum: 1 } } },
                { $match: { n: { $gt: 1 } } },
            ],
            { collation: COLLATION }
        )
        .toArray();

    if (dupes.length > 0) {
        console.error("ÇAKIŞMA: aynı sahip + isim birden fazla kayıtta var, indeks değiştirilmedi:");
        console.error(dupes.map((d) => ({ name: d._id.name, user: String(d._id.user), ids: d.ids.map(String) })));
        return;
    }

    if (!APPLY) {
        log("İndeks (dry-run): name_ci_unique kaldırılacak, owner_name_ci_unique oluşturulacak.");
        return;
    }

    await exercises.createIndex({ user: 1, name: 1 }, { unique: true, name: "owner_name_ci_unique", collation: COLLATION });
    const existing = await exercises.indexes();
    for (const legacy of ["name_ci_unique", "name_1"]) {
        if (existing.some((i) => i.name === legacy)) {
            await exercises.dropIndex(legacy);
            log(`Eski indeks kaldırıldı: ${legacy}`);
        }
    }
    log("İndeks güncellendi.");
}

async function main() {
    log(`Mod: ${APPLY ? "APPLY" : "DRY-RUN (hiçbir şey yazılmayacak)"}\n`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    try {
        log("== 1) Egzersiz sahipliği ==");
        await assignOwners(mongoose.connection.db);
        log("\n== 2) İndeks ==");
        await swapIndex(mongoose.connection.db);
        log("\nBitti.");
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((err) => {
    console.error("Migration başarısız:", err);
    process.exit(1);
});
