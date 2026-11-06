import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";
import type { ZodType } from "zod";
import { authOptions } from "@/lib/authOptions";
import { connectToDatabase } from "@/lib/db/connect";

/**
 * Handler içinden fırlatılan, HTTP durum kodu taşıyan hata.
 * Örn: throw new ApiError(404, "Antrenman bulunamadı");
 */
export class ApiError extends Error {
    constructor(public status: number, message: string) {
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

interface HandlerOptions {
    /** Veritabanı bağlantısı gerekmiyorsa false verin (varsayılan: true). */
    db?: boolean;
}

/** Tüm hata cevaplarının tek formatı: { error: string } */
function errorResponse(status: number, message: string) {
    return NextResponse.json({ error: message }, { status });
}

function toErrorResponse(err: unknown, label: string) {
    if (err instanceof ApiError) {
        return errorResponse(err.status, err.message);
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

/**
 * Oturum gerektiren route'lar için sarmalayıcı.
 * - Session kontrolü (401)
 * - DB bağlantısı
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
            if (options.db !== false) {
                await connectToDatabase();
            }
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
            if (options.db !== false) {
                await connectToDatabase();
            }
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

/** İstek gövdesini JSON olarak okuyup şemaya göre doğrular (bozuk JSON -> 400). */
export async function parseBody<T>(req: Request, schema: ZodType<T>): Promise<T> {
    let raw: unknown;
    try {
        raw = await req.json();
    } catch {
        throw new ApiError(400, "Geçersiz JSON gövdesi.");
    }
    return validate(schema, raw);
}
