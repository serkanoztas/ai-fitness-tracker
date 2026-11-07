import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

// Sayfa verisi sunucuda hazırlanırken gösterilir (Server Component akışı / navigasyon geçişleri).
// Gerçek dashboard yerleşimini taklit eder: içerik gelince yer değiştirme (layout shift) olmaz.
export default function Loading() {
    return (
        <LoadingRegion label="Sayfa yükleniyor" className="mx-auto max-w-6xl space-y-6 px-5 pb-6 pt-6 md:px-8 md:pt-8">
            <div className="space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-7 w-48" />
            </div>

            <Skeleton className="h-20 w-full !rounded-3xl" />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <Skeleton className="h-[380px] !rounded-3xl lg:col-span-7" />
                <div className="flex flex-col gap-3 lg:col-span-5">
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="h-[88px] !rounded-2xl" />
                    ))}
                </div>
            </div>

            <Skeleton className="h-72 !rounded-3xl" />
        </LoadingRegion>
    );
}
