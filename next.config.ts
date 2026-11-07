import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
// HTTPS'e yükseltme yalnızca site gerçekten HTTPS ile yayınlanıyorsa açılır (http://localhost üzerinde `next start` bozulmasın).
const isHttps = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;

/**
 * Content-Security-Policy.
 * Not: Next.js'in satır içi hidrasyon script'leri nedeniyle script-src'de 'unsafe-inline' gerekir
 * (nonce tabanlı CSP tüm sayfaları dinamik render'a zorlar). Geliştirmede React yenileme için 'unsafe-eval' eklenir.
 * Diğer yönergeler (frame-ancestors, object-src, base-uri, form-action, connect-src) sıkıdır.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Profil resmi: data: (yüklenen), https: (harici URL)
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Tüm istekler aynı origin'e (API) gider; Gemini yalnızca sunucudan çağrılır.
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(!isDev && isHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  // Tarayıcılar yalnızca HTTPS üzerinden gelen bu başlığı dikkate alır; yerelde (http) etkisizdir.
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // `next dev` her çalıştığında projeye AGENTS.md üretmesin
  agentRules: false,
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
