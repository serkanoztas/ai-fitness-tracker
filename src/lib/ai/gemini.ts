import {
    GoogleGenerativeAI,
    GoogleGenerativeAIAbortError,
    GoogleGenerativeAIFetchError,
    FinishReason,
} from "@google/generative-ai";
import { ApiError } from "@/lib/api/handler";

/**
 * Gemini için ortak istemci. Her AI route'u buradan geçer:
 *  - modeller env'den okunur (GEMINI_PRIMARY_MODEL / GEMINI_FALLBACK_MODEL)
 *  - her deneme için zaman aşımı + toplam süre bütçesi
 *  - yalnızca geçici hatalarda (429/5xx/timeout) aynı modeli bir kez tekrar dener
 *  - model bulunamazsa (404) veya yanıt kullanılamazsa fallback modele geçer
 *  - hatalı istek (400) / yetki (401, 403) hatalarında fallback denemez: sonuç değişmez
 *  - token kullanımını loglar
 */

const DEFAULT_PRIMARY_MODEL = "gemini-3.5-flash-lite";
const DEFAULT_FALLBACK_MODEL = "gemini-2.5-flash-lite";

const ATTEMPT_TIMEOUT_MS = 15_000;
const TOTAL_BUDGET_MS = 30_000;
const MIN_ATTEMPT_MS = 3_000;
const RETRY_BASE_DELAY_MS = 500;

export interface GenerateTextOptions {
    systemInstruction: string;
    prompt: string;
    /** Çıktı token üst sınırı (maliyet ve süre koruması). */
    maxOutputTokens: number;
    temperature?: number;
}

export interface GenerateTextResult {
    text: string;
    model: string;
    /** Çıktı token sınırında kesildiyse true */
    truncated: boolean;
}

type FailureKind = "retryable" | "next-model" | "fatal";

interface Failure {
    kind: FailureKind;
    status: number;
    message: string;
}

/** Kullanılabilir yanıt gelmediğinde (boş / güvenlik filtresi) fırlatılır. */
class UnusableResponseError extends Error {}

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        throw new ApiError(500, "AI servisi yapılandırılmamış (API anahtarı eksik).");
    }
    client ??= new GoogleGenerativeAI(apiKey);
    return client;
}

function getModelChain(): string[] {
    const primary = process.env.GEMINI_PRIMARY_MODEL?.trim() || DEFAULT_PRIMARY_MODEL;
    const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || DEFAULT_FALLBACK_MODEL;
    return primary === fallback ? [primary] : [primary, fallback];
}

function classifyError(err: unknown): Failure {
    if (err instanceof GoogleGenerativeAIAbortError) {
        return { kind: "retryable", status: 504, message: "zaman aşımı" };
    }
    if (err instanceof GoogleGenerativeAIFetchError) {
        const status = err.status ?? 502;
        if (status === 429 || status >= 500) return { kind: "retryable", status, message: err.message };
        if (status === 404) return { kind: "next-model", status, message: err.message };
        // 400 (hatalı istek), 401/403 (anahtar/yetki) vb.: başka model denemek sonucu değiştirmez.
        return { kind: "fatal", status, message: err.message };
    }
    if (err instanceof UnusableResponseError) {
        return { kind: "next-model", status: 502, message: err.message };
    }
    // Ağ hatası gibi beklenmeyen durumlar geçici kabul edilir.
    return { kind: "retryable", status: 502, message: err instanceof Error ? err.message : String(err) };
}

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function attempt(model: string, options: GenerateTextOptions, timeoutMs: number): Promise<GenerateTextResult> {
    const generativeModel = getClient().getGenerativeModel(
        {
            model,
            systemInstruction: options.systemInstruction,
            generationConfig: {
                maxOutputTokens: options.maxOutputTokens,
                temperature: options.temperature,
            },
        },
        { timeout: timeoutMs }
    );

    const { response } = await generativeModel.generateContent(options.prompt);

    let text: string;
    try {
        text = response.text().trim(); // Engellenmiş / boş yanıtta hata fırlatır
    } catch (err) {
        throw new UnusableResponseError(err instanceof Error ? err.message : "Yanıt okunamadı");
    }
    if (!text) {
        throw new UnusableResponseError("Boş yanıt");
    }

    const usage = response.usageMetadata;
    if (usage) {
        console.info(
            `[AI] ${model} token: prompt=${usage.promptTokenCount} çıktı=${usage.candidatesTokenCount} toplam=${usage.totalTokenCount}`
        );
    }

    const truncated = response.candidates?.[0]?.finishReason === FinishReason.MAX_TOKENS;
    if (truncated) {
        console.warn(`[AI] ${model} yanıtı maxOutputTokens (${options.maxOutputTokens}) sınırında kesildi.`);
    }

    return { text, model, truncated };
}

function toApiError(last: Failure): ApiError {
    if (last.status === 429) return new ApiError(429, "AI servisi şu anda yoğun, lütfen birazdan tekrar deneyin.");
    if (last.status === 504) return new ApiError(504, "AI servisi zamanında yanıt vermedi, lütfen tekrar deneyin.");
    if (last.status === 401 || last.status === 403) return new ApiError(500, "AI servisi yapılandırma hatası.");
    return new ApiError(502, "AI analizi şu anda gerçekleştirilemiyor.");
}

export async function generateText(options: GenerateTextOptions): Promise<GenerateTextResult> {
    const deadline = Date.now() + TOTAL_BUDGET_MS;
    let lastFailure: Failure | null = null;

    for (const model of getModelChain()) {
        for (let tryNo = 0; tryNo < 2; tryNo++) {
            const remaining = deadline - Date.now();
            if (remaining < MIN_ATTEMPT_MS) {
                throw toApiError(lastFailure ?? { kind: "retryable", status: 504, message: "bütçe doldu" });
            }

            try {
                return await attempt(model, options, Math.min(ATTEMPT_TIMEOUT_MS, remaining));
            } catch (err) {
                const failure = classifyError(err);
                lastFailure = failure;
                console.warn(`[AI] ${model} deneme ${tryNo + 1} başarısız (${failure.status}, ${failure.kind}): ${failure.message}`);

                if (failure.kind === "fatal") {
                    throw toApiError(failure);
                }
                if (failure.kind === "next-model") break;

                // Geçici hata: ilk denemeden sonra kısa, jitter'lı bekleme ile aynı modeli bir kez daha dene.
                if (tryNo === 0) await sleep(RETRY_BASE_DELAY_MS + Math.random() * RETRY_BASE_DELAY_MS);
            }
        }
    }

    throw toApiError(lastFailure ?? { kind: "fatal", status: 502, message: "bilinmeyen hata" });
}
