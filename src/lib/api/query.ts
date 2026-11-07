/**
 * `?limit=` sorgu parametresini okur. Geçersiz/eksik ise varsayılanı, çok büyükse üst sınırı döndürür.
 * Liste endpoint'lerinin sınırsız veri döndürmesini engeller.
 */
export function parseLimit(req: Request, defaultLimit: number, maxLimit: number): number {
    const raw = new URL(req.url).searchParams.get("limit");
    const parsed = raw === null ? NaN : Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return defaultLimit;
    return Math.min(parsed, maxLimit);
}
