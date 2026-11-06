import { Activity } from "lucide-react";

// Sayfa verisi sunucuda hazırlanırken gösterilir (Server Component akışı / navigasyon geçişleri).
export default function Loading() {
    return (
        <div className="flex h-[80vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-gray-400">
                <Activity className="w-10 h-10 animate-spin text-blue-500" />
                <p className="font-medium animate-pulse">Verileriniz hazırlanıyor...</p>
            </div>
        </div>
    );
}
