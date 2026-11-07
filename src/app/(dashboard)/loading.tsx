import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

// Sayfa verisi sunucuda hazırlanırken gösterilir (Server Component akışı / navigasyon geçişleri).
// Gerçek dashboard yerleşimini taklit eden iskelet: içerik gelince yer değiştirme (layout shift) olmaz.
export default function Loading() {
    return (
        <LoadingRegion label="Sayfa yükleniyor" className="max-w-6xl mx-auto p-4 md:p-6 space-y-8">
            <div className="space-y-3">
                <Skeleton className="h-9 w-72 max-w-full" />
                <Skeleton className="h-4 w-80 max-w-full" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="h-40" />
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Skeleton className="h-80 lg:col-span-2" />
                <Skeleton className="h-80" />
            </div>
        </LoadingRegion>
    );
}
