import { getServerSession } from "next-auth";
import { Activity, Dumbbell, Scale, TrendingUp } from "lucide-react";
import { authOptions } from "@/lib/authOptions";
import { APP_TIME_ZONE } from "@/lib/constants";
import { getDashboardData, type DashboardData } from "@/lib/data/dashboard";
import { RetryButton } from "@/components/dashboard/RetryButton";
import { ActivityRing } from "@/components/dashboard/ActivityRing";
import { AiCoach } from "@/components/dashboard/AiCoach";
import { MetricTile } from "@/components/dashboard/MetricTile";
import { MotivationCard } from "@/components/dashboard/MotivationCard";
import { RecentWorkouts } from "@/components/dashboard/RecentWorkouts";
import { VolumeChart } from "@/components/dashboard/VolumeChart";
import { EmptyState } from "@/components/ui/EmptyState";

function greetingFor(date: Date): string {
    const hour = Number(
        new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: APP_TIME_ZONE }).format(date)
    );
    if (hour < 5) return "İyi geceler";
    if (hour < 12) return "Günaydın";
    if (hour < 18) return "İyi günler";
    return "İyi akşamlar";
}

// Server Component: veri sunucuda çekilir, HTML hazır gelir (spinner / fetch waterfall yok).
export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    // Oturum kontrolü middleware'de yapılır; burada yalnızca tip güvenliği için.
    const userId = session?.user?.id;

    // Veri katmanı (örn. veritabanı bağlantısı) hata verirse sayfa çökmesin: Suspense sınırı bozulmadan
    // boş durumla render edilir ve kullanıcıya yeniden deneme sunulur. Asıl hata sunucu logunda görünür.
    let data: DashboardData | null = null;
    let loadFailed = false;
    if (userId) {
        try {
            data = await getDashboardData(userId);
        } catch (err) {
            console.error("Dashboard verisi yüklenemedi:", err);
            loadFailed = true;
        }
    }

    const userName = session?.user?.name?.split(" ")[0] || "Şampiyon";
    const lastWorkout = data?.historicalData[data.historicalData.length - 1] ?? null;

    return (
        <div className="mx-auto max-w-6xl space-y-6 px-5 pb-6 pt-6 md:px-8 md:pt-8">
            {/* Karşılama */}
            <header>
                <p className="text-xs font-medium text-gray-400">{greetingFor(new Date())},</p>
                <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-white">{userName} 👋</h1>
                <p className="mt-1 text-xs text-gray-400">Bugün hedeflerini ezmeye hazır mısın?</p>
            </header>

            {loadFailed && (
                <div
                    role="alert"
                    className="flex flex-col gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <p className="text-sm text-rose-300">Verilerin şu an yüklenemedi. Bağlantını kontrol edip tekrar deneyebilirsin.</p>
                    <RetryButton />
                </div>
            )}

            <AiCoach />

            {/* Günlük özet: dairesel kalori göstergesi + yan metrikler */}
            <section aria-label="Özet" className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <ActivityRing latestNutrition={data?.latestNutrition ?? null} />
                </div>

                <div className="flex flex-col gap-3 lg:col-span-5 lg:justify-between">
                    <MetricTile
                        href="/workout/history"
                        icon={Dumbbell}
                        tone="brand"
                        label="Toplam Hacim"
                        value={(data?.totalVolume ?? 0).toLocaleString("tr-TR")}
                        unit="kg"
                        hint={`${data?.totalWorkouts ?? 0} antrenman`}
                    />
                    <MetricTile
                        href="/workout/history"
                        icon={TrendingUp}
                        tone="orange"
                        label="Son Antrenman"
                        value={lastWorkout ? lastWorkout.volume.toLocaleString("tr-TR") : "-"}
                        unit={lastWorkout ? "kg" : undefined}
                        hint={lastWorkout ? lastWorkout.date : "Henüz kayıt yok"}
                    />
                    <MetricTile
                        href="/weight"
                        icon={Scale}
                        tone="emerald"
                        label="Vücut Ağırlığı"
                        value={data?.latestWeight != null ? String(data.latestWeight) : "-"}
                        unit={data?.latestWeight != null ? "kg" : undefined}
                        hint={data?.latestWeight != null ? "Son güncel kilon" : "Henüz kilo girilmedi"}
                    />
                </div>
            </section>

            {/* Hacim trendi */}
            <section aria-labelledby="volume-trend-title" className="rounded-3xl border border-line bg-surface p-5 shadow-lg shadow-black/30">
                <div className="mb-2 flex items-center justify-between">
                    <h2 id="volume-trend-title" className="text-sm font-semibold tracking-tight text-gray-200">
                        Antrenman Hacmi Trendi
                    </h2>
                    <span className="rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-400">
                        Son 30 antrenman
                    </span>
                </div>

                {!data || data.historicalData.length === 0 ? (
                    <EmptyState
                        bare
                        icon={Activity}
                        title="Grafik için henüz veri yok"
                        description="İlk antrenmanını kaydettiğinde hacim trendin burada belirecek."
                        action={{ label: "Antrenman kaydet", href: "/workout/new" }}
                    />
                ) : (
                    <VolumeChart data={data.historicalData} />
                )}
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RecentWorkouts />
                </div>
                <MotivationCard />
            </div>
        </div>
    );
}
