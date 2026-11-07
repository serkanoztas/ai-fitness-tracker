/** Recharts grafikleri için ortak koyu tema değerleri (design-system.md: neon-on-dark). */

export const CHART_COLORS = {
    brand: "#FF416C",
    brandSoft: "#FF3E6C",
    coral: "#FF6B4A",
    grid: "#232632",
    tick: "#747888",
    surface: "#14151C",
    line: "#232632",
} as const;

/** Koyu cam görünümlü tooltip kutusu */
export const CHART_TOOLTIP_STYLE = {
    backgroundColor: "rgba(20, 21, 28, 0.92)",
    border: `1px solid ${CHART_COLORS.line}`,
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
    color: "#fff",
    backdropFilter: "blur(8px)",
} as const;

export const CHART_TOOLTIP_LABEL_STYLE = { color: "#9A9EAD", marginBottom: "4px" } as const;

export const CHART_AXIS_TICK = { fontSize: 11, fill: CHART_COLORS.tick } as const;
