/** Sunucu { error } döndüğünde (veya bağlantı koptuğunda) fırlatılır. */
export class ApiClientError extends Error {
    constructor(message: string, public status: number) {
        super(message);
        this.name = "ApiClientError";
    }
}

interface RequestOptions {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
}

/**
 * Tek tip fetch yardımcısı: JSON başlıklarını ekler, hata cevabındaki `{ error }` mesajını
 * ApiClientError olarak fırlatır. Çağıran taraf yalnızca try/catch ile hata mesajını gösterir.
 */
export async function apiRequest<T>(url: string, { method = "GET", body, signal }: RequestOptions = {}): Promise<T> {
    let res: Response;
    try {
        res = await fetch(url, {
            method,
            signal,
            headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    } catch (error) {
        if ((error as Error).name === "AbortError") throw error;
        throw new ApiClientError("Sunucuya bağlanılamadı.", 0);
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiClientError(data?.error ?? "Beklenmeyen bir hata oluştu.", res.status);
    }
    return data as T;
}

/** catch bloğundaki bilinmeyen hatadan kullanıcıya gösterilecek mesajı çıkarır. */
export function getErrorMessage(error: unknown, fallback = "Bir hata oluştu."): string {
    return error instanceof ApiClientError ? error.message : fallback;
}

export const isAbortError = (error: unknown) => error instanceof Error && error.name === "AbortError";
