import type { ReactNode } from "react";

/**
 * Yükleme iskeleti: koyu yüzey üzerinde nabız animasyonlu blok (animate-pulse rounded-xl).
 */
export function Skeleton({ className = "" }: { className?: string }) {
    return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-surface-raised ${className}`} />;
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
