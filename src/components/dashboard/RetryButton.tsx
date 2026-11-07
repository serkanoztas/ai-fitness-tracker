"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

/** Sunucu bileşenini yeniden çalıştırır (router.refresh); bekleme sırasında düğme devre dışı kalır. */
export function RetryButton({ label = "Tekrar dene" }: { label?: string }) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    return (
        <button
            type="button"
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-coral px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:pointer-events-none disabled:opacity-60"
        >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
            {isPending ? "Yükleniyor…" : label}
        </button>
    );
}
