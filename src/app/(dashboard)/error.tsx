"use client";

import { useEffect } from "react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center p-6">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">Veriler yüklenirken bir sorun oluştu.</p>
            <button
                onClick={reset}
                className="px-4 py-2 rounded-xl bg-gradient-coral shadow-glow-sm text-white font-semibold hover:brightness-110 active:scale-[0.98] transition-all duration-200"
            >
                Tekrar dene
            </button>
        </div>
    );
}
