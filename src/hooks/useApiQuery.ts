"use client";

import { useEffect, useState } from "react";
import { apiRequest, getErrorMessage, isAbortError } from "@/lib/api/client";

/**
 * Sayfa açılışında bir GET endpoint'inden veri çeker (yükleniyor / hata durumlarıyla).
 * Mutasyon sonrası listeyi güncellemek için `setData`, yeniden çekmek için `refetch` döner.
 * Sayfadan çıkılırsa istek iptal edilir.
 */
export function useApiQuery<T>(url: string, initialData: T) {
    const [data, setData] = useState<T>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        apiRequest<T>(url, { signal: controller.signal })
            .then(setData)
            .catch((err) => {
                if (isAbortError(err)) return;
                setError(getErrorMessage(err, "Veriler yüklenemedi."));
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [url, reloadKey]);

    // Yükleniyor durumuna dönmeden veriyi sessizce yeniler
    const refetch = () => setReloadKey((k) => k + 1);

    return { data, setData, isLoading, error, refetch };
}
