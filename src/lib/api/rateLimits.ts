import type { RateLimitRule } from "@/lib/api/rateLimit";

/** Uygulamadaki tüm istek sınırları tek yerde. Sayılar bilinçli olarak cömert: amaç kötüye kullanımı kesmek. */

const MINUTE = 60;
const HOUR = 60 * MINUTE;

export const RATE_LIMITS = {
    // Giriş: parola denemelerini hem IP hem hesap bazında sınırla (bcrypt aynı zamanda CPU maliyeti).
    loginIp: { name: "login-ip", limit: 30, windowSeconds: 15 * MINUTE },
    loginAccount: { name: "login-acct", limit: 10, windowSeconds: 15 * MINUTE },

    // Kayıt: hesap çoğaltmayı (ve onunla AI bütçesini aşmayı) zorlaştırır.
    registerIp: { name: "register-ip", limit: 10, windowSeconds: HOUR },

    // AI uç noktaları: Gemini maliyeti doğurur.
    aiAnalysisUser: { name: "ai-analysis-user", limit: 20, windowSeconds: HOUR },
    aiAnalysisIp: { name: "ai-analysis-ip", limit: 60, windowSeconds: HOUR },
    aiMacroUser: { name: "ai-macro-user", limit: 15, windowSeconds: HOUR },
    aiMacroIp: { name: "ai-macro-ip", limit: 45, windowSeconds: HOUR },
} satisfies Record<string, RateLimitRule>;
