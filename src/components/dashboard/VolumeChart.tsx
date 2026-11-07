"use client";

import { useId } from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceDot,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    CHART_AXIS_TICK,
    CHART_COLORS,
    CHART_TOOLTIP_LABEL_STYLE,
    CHART_TOOLTIP_STYLE,
} from "@/components/dashboard/chart-theme";

interface VolumeChartProps {
    /** Eskiden yeniye sıralı olmalıdır */
    data: { date: string; volume: number }[];
}

interface PillLabelProps {
    /** Recharts'ın verdiği konum bilgisi (kartezyen ya da polar olabilir; yalnızca x/y/width okunur) */
    viewBox?: object;
    text: string;
}

/** Son noktanın üstünde değeri gösteren neon hap (referans tasarımdaki BPM rozeti gibi). */
function PillLabel({ viewBox, text }: PillLabelProps) {
    const box = viewBox as { x?: number; y?: number; width?: number } | undefined;
    if (!box || box.x === undefined || box.y === undefined) return null;

    const width = text.length * 6.6 + 18;
    const cx = box.x + (box.width ?? 0) / 2;
    const top = box.y - 28;

    return (
        <g>
            <rect x={cx - width / 2} y={top} width={width} height={20} rx={10} fill={CHART_COLORS.brandSoft} />
            <text x={cx} y={top + 14} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>
                {text}
            </text>
        </g>
    );
}

// recharts yalnızca tarayıcıda çalıştığı için bu bileşen client'tır; recharts bundle'ı sadece buraya bağlıdır.
export function VolumeChart({ data }: VolumeChartProps) {
    const gradientId = `${useId().replace(/:/g, "")}-volume`;
    const last = data[data.length - 1];

    return (
        <div className="h-64 w-full" role="img" aria-label="Antrenman hacmi trend grafiği">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 34, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={CHART_COLORS.brandSoft} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={CHART_COLORS.brandSoft} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={CHART_COLORS.grid} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} dy={8} />
                    <YAxis axisLine={false} tickLine={false} tick={CHART_AXIS_TICK} />
                    <Tooltip
                        contentStyle={CHART_TOOLTIP_STYLE}
                        labelStyle={CHART_TOOLTIP_LABEL_STYLE}
                        itemStyle={{ color: CHART_COLORS.brand, fontWeight: 700 }}
                        cursor={{ stroke: CHART_COLORS.tick, strokeDasharray: "3 3" }}
                    />
                    <Area
                        type="monotone"
                        dataKey="volume"
                        name="Hacim (kg)"
                        stroke={CHART_COLORS.brand}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        className="neon-glow"
                        activeDot={{ r: 5, fill: CHART_COLORS.brand, stroke: "#fff", strokeWidth: 2 }}
                    />
                    {last && (
                        <ReferenceDot
                            x={last.date}
                            y={last.volume}
                            r={5}
                            fill={CHART_COLORS.brand}
                            stroke="#fff"
                            strokeWidth={2}
                            ifOverflow="extendDomain"
                            label={{ content: (props) => <PillLabel viewBox={props.viewBox} text={`${last.volume.toLocaleString("tr-TR")} kg`} /> }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
