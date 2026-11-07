// Görünmez/denetim karakterleri: C0/C1 kontrol karakterleri, sıfır genişlikli boşluklar, BOM, word joiner, yön işaretleri
const INVISIBLE_CHARS = /[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

/**
 * Kullanıcı metnini kaydetmeden / prompt'a koymadan önce temizler:
 *  - NFKC normalizasyonu (tam genişlikli harfler, ligatürler, görünüşte aynı karakterler tek biçime iner)
 *  - her türlü boşluk (sekme, satır sonu, NBSP...) tek boşluğa iner
 *  - görünmez ve denetim karakterleri silinir
 *  - baştaki/sondaki boşluk kırpılır
 * Böylece "Bench  Press", "Bench Press" ve "Bench​Press" ayrı kayıtlar olarak birikemez.
 */
export function normalizeText(input: string): string {
    return input
        .normalize("NFKC")
        .replace(/\s+/g, " ")
        .replace(INVISIBLE_CHARS, "")
        .trim();
}
