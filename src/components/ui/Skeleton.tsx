import type { ReactNode } from "react";

/**
 * Yükleme iskeleti (design-system.md: animate-pulse bg-zinc-800/60 rounded-xl).
 * Açık temada koyu blok ağır durduğu için açık renk karşılığı kullanılır; koyu tema birebir spesifikasyondur.
 */
export function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800/60 ${className}`} />;
}

/**
 * İskeletleri saran alan: ekran okuyuculara "yükleniyor" durumunu duyurur.
 * İçerik hazır olunca bu bileşen kaldırılır.
 */
export function LoadingRegion({
    label = "Yükleniyor",
    className = "",
    children,
}: {
    label?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div role="status" aria-live="polite" aria-busy="true" className={className}>
            <span className="sr-only">{label}</span>
            {children}
        </div>
    );
}
