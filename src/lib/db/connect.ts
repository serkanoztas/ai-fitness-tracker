import mongoose from "mongoose";

// Sorgu filtrelerindeki iç içe `$` operatörlerini $eq ile sarar: istemciden gelen { "$ne": null } gibi nesneler
// sorgu operatörü olarak çalışmaz. Bilerek operatör kullanılan yerlerde mongoose.trusted() kullanılmalıdır.
mongoose.set("sanitizeFilter", true);

// TypeScript'te global objeyi genişleterek mongoose önbelleğini tanımlıyoruz
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache;
}

// Globalde cache yoksa başlatıyoruz
let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
    // Eğer halihazırda açık bir bağlantı varsa onu kullan
    if (cached.conn) {
        return cached.conn;
    }

    // Kontrol modül yüklenirken değil, bağlantı istendiğinde yapılır;
    // böylece ortam değişkeni olmayan ortamlarda (örn. build) import hatası oluşmaz.
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error("Lütfen .env.local dosyanızda MONGODB_URI ortam değişkenini tanımlayın.");
    }

    // Eğer devam eden bir bağlantı isteği yoksa yeni bir tane başlat
    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Bekleyen işlemleri kapat, hızlı hata fırlatsın
            maxPoolSize: 10, // Serverless'ta her instance'ın havuzu küçük tutulur
            // DB erişilemezse sonsuza kadar beklemesin; ama soğuk (ilk) bağlantı Atlas'ta ~3-4 sn sürebildiği için
            // 5 sn çok sıkıydı: yavaş bir ağda ilk sayfa render'ı bağlantı hatasıyla düşüyordu.
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        // Hata durumunda cache'i temizle ki tekrar denenebilsin
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}