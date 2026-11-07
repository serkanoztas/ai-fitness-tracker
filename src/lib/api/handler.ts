import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import type { ZodType } from "zod";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db/connect";
import { consumeRateLimit, getRequestIp, type RateLimitRule } from "@/lib/api/rateLimit";

/**
 * Handler içinden fırlatılan, HTTP durum kodu taşıyan hata.
 * Örn: throw new ApiError(404, "Antrenman bulunamadı");
 * 429 için `retryAfterSeconds` verilirse yanıta Retry-After başlığı eklenir.
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public retryAfterSeconds?: number
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export interface AuthContext {
    req: Request;
    userId: string;
}

export interface PublicContext {
    req: Request;
}

export interface RateLimitOptions {
    /** İstemci IP'sine göre sınır */
    ip?: RateLimitRule;
    /** Oturum açmış kullanıcıya göre sınır (yalnızca withAuth) */
    user?: RateLimitRule;
}

interface HandlerOptions {
    /** Veritabanı bağlantısı gerekmiyorsa false verin (varsayılan: true). rateLimit verilirse yine bağlanılır. */
    db?: boolean;
    rateLimit?: RateLimitOptions;
}

/** Tüm hata cevaplarının tek formatı: { error: string } */
function errorResponse(status: number, message: string, retryAfterSeconds?: number) {
    return NextResponse.json(
        { error: message },
        { status, headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined }
    );
}

function toErrorResponse(err: unknown, label: string) {
    if (err instanceof ApiError) {
        return errorResponse(err.status, err.message, err.retryAfterSeconds);
    }
    if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
        return errorResponse(400, "Geçersiz veri.");
    }
    // MongoDB duplicate key (unique index ihlali)
    if (typeof err === "object" && err !== null && (err as { code?: unknown }).code === 11000) {
        return errorResponse(409, "Bu kayıt zaten mevcut.");
    }

    console.error(`${label} hatası:`, err);
    return errorResponse(500, "Sunucu hatası oluştu.");
}

/** Sınır aşıldıysa 429 fırlatır. Önce IP, sonra kullanıcı sınırı kontrol edilir. */
async function enforceRateLimit(req: Request, userId: string | undefined, limits: RateLimitOptions | undefined) {
    if (!limits) return;

    const checks: [RateLimitRule, string][] = [];
    if (limits.ip) checks.push([limits.ip, getRequestIp(req)]);
    if (limits.user && userId) checks.push([limits.user, userId]);

    for (const [rule, identifier] of checks) {
        const result = await consumeRateLimit(rule, identifier);
        if (!result.allowed) {
            throw new ApiError(429, "Çok fazla istek gönderdiniz. Lütfen biraz bekleyip tekrar deneyin.", result.retryAfterSeconds);
        }
    }
}

const needsDb = (options: HandlerOptions) => options.db !== false || Boolean(options.rateLimit);

/**
 * Oturum gerektiren route'lar için sarmalayıcı.
 * - Session kontrolü (401)
 * - DB bağlantısı
 * - İsteğe bağlı istek sınırlama (429)
 * - Merkezi try/catch ve tutarlı hata formatı
 *
 * Kullanıcı kimliği her zaman session'dan gelir, istemci verisine güvenilmez.
 */
export function withAuth(
    handler: (ctx: AuthContext) => Promise<Response>,
    label: string,
    options: HandlerOptions = {}
) {
    return async (req: Request): Promise<Response> => {
        try {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                throw new ApiError(401, "Yetkisiz erişim");
            }
            if (needsDb(options)) {
                await connectToDatabase();
            }
            await enforceRateLimit(req, session.user.id, options.rateLimit);
            return await handler({ req, userId: session.user.id });
        } catch (err) {
            return toErrorResponse(err, label);
        }
    };
}

/** Oturum gerektirmeyen (örn. kayıt) route'lar için aynı hata yönetimi. */
export function withPublic(
    handler: (ctx: PublicContext) => Promise<Response>,
    label: string,
    options: HandlerOptions = {}
) {
    return async (req: Request): Promise<Response> => {
        try {
            if (needsDb(options)) {
                await connectToDatabase();
            }
            await enforceRateLimit(req, undefined, options.rateLimit);
            return await handler({ req });
        } catch (err) {
            return toErrorResponse(err, label);
        }
    };
}

/** Veriyi şemaya göre doğrular; hata varsa ilk sorunu 400 olarak fırlatır. */
export function validate<T>(schema: ZodType<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        const issue = result.error.issues[0];
        const path = issue.path.join(".");
        throw new ApiError(400, path ? `${path}: ${issue.message}` : issue.message);
    }
    return result.data;
}

/** Varsayılan gövde sınırı: en büyük meşru istek (30 egzersiz x 50 set) bunun çok altındadır. */
export const DEFAULT_MAX_BODY_BYTES = 128 * 1024;

/**
 * Gövdeyi en fazla `maxBytes` kadar okur; sınır aşılırsa okumayı bırakıp 413 fırlatır.
 * Content-Length yalnızca ön kontroldür; asıl koruma okuma sırasındaki sayımdır (chunked istekler için).
 */
async function readBodyText(req: Request, maxBytes: number): Promise<string> {
    const tooLarge = () => new ApiError(413, "İstek gövdesi çok büyük.");

    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) throw tooLarge();
    if (!req.body) return "";

    const reader = req.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;

    for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.byteLength;
        if (total > maxBytes) {
            await reader.cancel().catch(() => undefined);
            throw tooLarge();
        }
        chunks.push(value);
    }

    return new TextDecoder().decode(Buffer.concat(chunks));
}

/** İstek gövdesini boyut sınırıyla JSON olarak okuyup şemaya göre doğrular (bozuk JSON -> 400, büyük gövde -> 413). */
export async function parseBody<T>(
    req: Request,
    schema: ZodType<T>,
    { maxBytes = DEFAULT_MAX_BODY_BYTES }: { maxBytes?: number } = {}
): Promise<T> {
    const text = await readBodyText(req, maxBytes);

    let raw: unknown;
    try {
        raw = JSON.parse(text);
    } catch {
        throw new ApiError(400, "Geçersiz JSON gövdesi.");
    }
    return validate(schema, raw);
}
