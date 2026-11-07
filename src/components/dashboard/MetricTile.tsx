import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";

type Tone = "brand" | "orange" | "emerald";

const TONES: Record<Tone, string> = {
    brand: "border-brand-500/20 bg-brand-500/10 text-brand-400",
    orange: "border-orange-500/20 bg-orange-500/10 text-orange-400",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
};

interface MetricTileProps {
    href: string;
    icon: LucideIcon;
    label: string;
    value: string;
    unit?: string;
    /** Değerin altındaki küçük açıklama */
    hint?: string;
    tone?: Tone;
}

/** Özet metrik kutusu: ikon çipi + etiket + değer + ok. Tüm kutu bir bağlantıdır. */
export function MetricTile({ href, icon: Icon, label, value, unit, hint, tone = "brand" }: MetricTileProps) {
    return (
        <Link
            href={href}
            className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:border-gray-600 hover:bg-surface-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:scale-[0.99]"
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${TONES[tone]}`} aria-hidden="true">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-medium text-gray-400">{label}</p>
                    <p className="flex items-baseline gap-1 text-lg font-bold leading-tight tracking-tight text-white">
                        <span className="truncate">{value}</span>
                        {unit && <span className="text-xs font-semibold text-gray-500">{unit}</span>}
                    </p>
                    {hint && <p className="truncate text-[10px] text-gray-500">{hint}</p>}
                </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-gray-600 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-400" aria-hidden="true" />
        </Link>
    );
}
