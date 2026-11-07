/**
 * Tek seferlik veritabanı migration'ı (Ana Başlık 2).
 *
 * Yaptıkları:
 *   1. User.weightLogs / User.nutritionLogs (gömülü diziler) -> `weightlogs` / `nutritionlogs` koleksiyonları.
 *      Gömülü kayıtların _id'leri korunur; böylece istemcideki silme linkleri vb. bozulmaz.
 *      Aktarım _id üzerinden upsert olduğu için script güvenle tekrar çalıştırılabilir (idempotent).
 *   2. Kayıtların doğru aktarıldığını kullanıcı bazında doğrular.
 *   3. (--cleanup) Yalnızca doğrulanmış kullanıcıların gömülü dizilerini siler.
 *   4. User e-postalarını küçük harfe çevirip kırpar (büyük/küçük harf çakışması varsa dokunmaz, raporlar).
 *   5. İndeksleri oluşturur; eski harfe duyarlı exercises `name_1` indeksini kaldırır
 *      (egzersiz adlarında büyük/küçük harf çakışması varsa dokunmaz, raporlar).
 *
 * Kullanım (proje kökünden):
 *   node --env-file=.env.local scripts/migrate-db.mjs               # DRY-RUN: hiçbir şey yazmaz, sadece rapor verir
 *   node --env-file=.env.local scripts/migrate-db.mjs --apply       # kopyalama + e-posta + indeksler
 *   node --env-file=.env.local scripts/migrate-db.mjs --apply --cleanup   # + eski gömülü dizileri sil
 *
 * ÖNERİLEN SIRA: önce dry-run, sonra --apply, uygulamayı deneyin, en son --cleanup.
 * Çalıştırmadan önce veritabanının yedeğini alın (Atlas snapshot / mongodump).
 */
import mongoose from "mongoose";

const APPLY = process.argv.includes("--apply");
const CLEANUP = process.argv.includes("--cleanup");

if (CLEANUP && !APPLY) {
    console.error("--cleanup yalnızca --apply ile birlikte kullanılabilir.");
    process.exit(1);
}

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error("MONGODB_URI tanımlı değil. `node --env-file=.env.local scripts/migrate-db.mjs` ile çalıştırın.");
    process.exit(1);
}

const BATCH_SIZE = 500;
const log = (...args) => console.log(...args);
const mode = APPLY ? (CLEANUP ? "APPLY + CLEANUP" : "APPLY") : "DRY-RUN (hiçbir şey yazılmayacak)";

async function migrateLogs(db) {
    const users = db.collection("users");
    const weightLogs = db.collection("weightlogs");
    const nutritionLogs = db.collection("nutritionlogs");

    const stats = { users: 0, weight: 0, nutrition: 0, mismatched: [], verified: [] };

    const cursor = users.find({}, { projection: { weightLogs: 1, nutritionLogs: 1, createdAt: 1 } });

    for await (const user of cursor) {
        stats.users++;
        const fallbackDate = user.createdAt ?? new Date();

        const weightDocs = (user.weightLogs ?? []).filter((l) => l?._id);
        const nutritionDocs = (user.nutritionLogs ?? []).filter((l) => l?._id);
        stats.weight += weightDocs.length;
        stats.nutrition += nutritionDocs.length;

        if (APPLY) {
            for (let i = 0; i < weightDocs.length; i += BATCH_SIZE) {
                const ops = weightDocs.slice(i, i + BATCH_SIZE).map((l) => ({
                    updateOne: {
                        filter: { _id: l._id },
                        update: { $setOnInsert: { user: user._id, weight: l.weight, date: l.date ?? fallbackDate } },
                        upsert: true,
                    },
                }));
                await weightLogs.bulkWrite(ops, { ordered: false });
            }
            for (let i = 0; i < nutritionDocs.length; i += BATCH_SIZE) {
                const ops = nutritionDocs.slice(i, i + BATCH_SIZE).map((l) => ({
                    updateOne: {
                        filter: { _id: l._id },
                        update: {
                            $setOnInsert: {
                                user: user._id,
                                calories: l.calories,
                                protein: l.protein ?? 0,
                                carbs: l.carbs ?? 0,
                                fat: l.fat ?? 0,
                                date: l.date ?? fallbackDate,
                            },
                        },
                        upsert: true,
                    },
                }));
                await nutritionLogs.bulkWrite(ops, { ordered: false });
            }

            // Doğrulama: gömülü kayıtların hepsi yeni koleksiyonda aynı kullanıcıya ait olarak var mı?
            const [wFound, nFound] = await Promise.all([
                weightLogs.countDocuments({ user: user._id, _id: { $in: weightDocs.map((l) => l._id) } }),
                nutritionLogs.countDocuments({ user: user._id, _id: { $in: nutritionDocs.map((l) => l._id) } }),
            ]);
            if (wFound === weightDocs.length && nFound === nutritionDocs.length) {
                stats.verified.push(user._id);
            } else {
                stats.mismatched.push({
                    user: String(user._id),
                    weight: `${wFound}/${weightDocs.length}`,
                    nutrition: `${nFound}/${nutritionDocs.length}`,
                });
            }
        }
    }

    log(`Kullanıcı: ${stats.users} | Aktarılacak kilo kaydı: ${stats.weight} | beslenme kaydı: ${stats.nutrition}`);

    if (APPLY) {
        log(`Doğrulanan kullanıcı: ${stats.verified.length} | Uyuşmayan: ${stats.mismatched.length}`);
        if (stats.mismatched.length > 0) {
            console.error("UYUŞMAYAN KULLANICILAR (eski veriye dokunulmayacak):");
            console.error(stats.mismatched);
        }
    }

    if (CLEANUP) {
        if (stats.verified.length === 0) {
            log("Temizlenecek doğrulanmış kullanıcı yok.");
        } else {
            const res = await users.updateMany(
                { _id: { $in: stats.verified } },
                { $unset: { weightLogs: "", nutritionLogs: "" } }
            );
            log(`Gömülü diziler silindi: ${res.modifiedCount} kullanıcı.`);
        }
    } else if (APPLY) {
        log("Eski gömülü diziler SİLİNMEDİ. Uygulamayı denedikten sonra --cleanup ile silebilirsiniz.");
    }
}

async function normalizeEmails(db) {
    const users = db.collection("users");

    const dupes = await users
        .aggregate([
            { $group: { _id: { $toLower: { $trim: { input: "$email" } } }, ids: { $push: "$_id" }, n: { $sum: 1 } } },
            { $match: { n: { $gt: 1 } } },
        ])
        .toArray();

    if (dupes.length > 0) {
        console.error(`E-POSTA ÇAKIŞMASI: ${dupes.length} adres büyük/küçük harf farkıyla birden fazla hesapta var. Normalizasyon ATLANDI.`);
        console.error(dupes.map((d) => ({ email: d._id, userIds: d.ids.map(String) })));
        return;
    }

    const needsFix = await users.countDocuments({
        $expr: { $ne: ["$email", { $toLower: { $trim: { input: "$email" } } }] },
    });
    log(`Normalize edilecek e-posta: ${needsFix}`);

    if (APPLY && needsFix > 0) {
        await users.updateMany({}, [{ $set: { email: { $toLower: { $trim: { input: "$email" } } } } }]);
        log("E-postalar normalize edildi.");
    }
}

async function ensureIndexes(db) {
    const exercises = db.collection("exercises");

    const dupes = await exercises
        .aggregate(
            [
                { $group: { _id: "$name", ids: { $push: "$_id" }, n: { $sum: 1 } } },
                { $match: { n: { $gt: 1 } } },
            ],
            { collation: { locale: "en", strength: 2 } }
        )
        .toArray();

    const exerciseIndexOk = dupes.length === 0;
    if (!exerciseIndexOk) {
        console.error(`EGZERSİZ ÇAKIŞMASI: ${dupes.length} isim büyük/küçük harf farkıyla tekrar ediyor. Egzersiz indeksi ATLANDI.`);
        console.error(dupes.map((d) => ({ name: d._id, ids: d.ids.map(String) })));
        console.error("Çözüm: yinelenenlerden birini seçip workouts içindeki referansları ona taşıyın, diğerini silin, script'i tekrar çalıştırın.");
    }

    if (!APPLY) {
        log(`İndeksler (dry-run): exercises ${exerciseIndexOk ? "oluşturulabilir" : "ATLANACAK"}; workouts, routines, weightlogs, nutritionlogs oluşturulacak.`);
        return;
    }

    if (exerciseIndexOk) {
        await exercises.createIndex(
            { name: 1 },
            { unique: true, name: "name_ci_unique", collation: { locale: "en", strength: 2 } }
        );
        const existing = await exercises.indexes();
        if (existing.some((i) => i.name === "name_1")) {
            await exercises.dropIndex("name_1");
            log("Eski exercises `name_1` indeksi kaldırıldı.");
        }
    }

    await db.collection("workouts").createIndex({ user: 1, date: -1 });
    await db.collection("workouts").createIndex({ user: 1, splitType: 1, date: -1 });
    await db.collection("routines").createIndex({ user: 1, createdAt: -1 });
    await db.collection("weightlogs").createIndex({ user: 1, date: -1 });
    await db.collection("nutritionlogs").createIndex({ user: 1, date: -1 });
    log("İndeksler oluşturuldu.");
}

async function main() {
    log(`Mod: ${mode}\n`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    const db = mongoose.connection.db;

    try {
        log("== 1) Kilo ve beslenme kayıtları ==");
        await migrateLogs(db);

        log("\n== 2) E-posta normalizasyonu ==");
        await normalizeEmails(db);

        log("\n== 3) İndeksler ==");
        await ensureIndexes(db);

        log("\nBitti.");
    } finally {
        await mongoose.disconnect();
    }
}

main().catch((err) => {
    console.error("Migration başarısız:", err);
    process.exit(1);
});
