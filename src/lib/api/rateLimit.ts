import { RateLimit } from "@/models/RateLimit";

/**
 * MongoDB tabanlı istek sınırlama (sabit pencere).
 * Serverless ortamda (Vercel) bellek içi sayaçlar instance'lar arasında paylaşılmadığı için kalıcı depo kullanılır.
 * Sayaç tek bir atomik `$inc` + upsert ile artırılır; yarış durumunda sayım kaybolmaz.
 */

export interface RateLimitRule {
    /** Sayaç anahtarının ön eki; kuralları birbirinden ayırır */
    name: string;
    /** Pencere başına izin verilen istek sayısı */
    limit: number;
    windowSeconds: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    /** İzin verilmediyse pencerenin bitmesine kalan saniye */
    retryAfterSeconds: number;
}

const DUPLICATE_KEY = 11000;

/** Kimlik bilgisini anahtarda güvenli ve kısa tutar (uzun/özel karakterli girdilerle anahtar şişmesin). */
const safeId = (id: string) => id.toLowerCase().slice(0, 120);

/**
 * İsteğin geldiği IP. Vercel gelen `x-forwarded-for` başlığını kendisi yazar (istemci gönderdiğini ezer),
 * bu yüzden ilk değer güvenilirdir. Başka bir barındırmaya taşınırsa bir ters vekilin arkasında olunduğundan
 * ve başlığın sahte olamayacağından emin olunmalıdır.
 */
export function getClientIp(get: (name: string) => string | null | undefined): string {
    const forwarded = get("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || get("x-real-ip")?.trim() || "unknown";
}

export const getRequestIp = (req: Request) => getClientIp((name) => req.headers.get(name));

async function increment(key: string, expiresAt: Date): Promise<number> {
    const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt } };
    const options = { upsert: true, returnDocument: "after" as const };

    try {
        const doc = await RateLimit.findOneAndUpdate({ key }, update, options).select("count").lean();
        return doc?.count ?? 1;
    } catch (err) {
        // İlk istek iki eşzamanlı upsert'e denk gelirse biri unique indeksten döner; tekrar artırmak yeterli.
        if ((err as { code?: number }).code === DUPLICATE_KEY) {
            const doc = await RateLimit.findOneAndUpdate({ key }, update, options).select("count").lean();
            return doc?.count ?? 1;
        }
        throw err;
    }
}

/** Sayacı bir artırır ve sınırın aşılıp aşılmadığını söyler. */
export async function consumeRateLimit(rule: RateLimitRule, identifier: string, now = Date.now()): Promise<RateLimitResult> {
    const windowMs = rule.windowSeconds * 1000;
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const windowEnd = windowStart + windowMs;

    const key = `${rule.name}:${safeId(identifier)}:${windowStart}`;
    const count = await increment(key, new Date(windowEnd));

    return {
        allowed: count <= rule.limit,
        remaining: Math.max(0, rule.limit - count),
        retryAfterSeconds: Math.max(1, Math.ceil((windowEnd - now) / 1000)),
    };
}
