import { withAuth } from "next-auth/middleware";


export default withAuth({
    pages: {
        signIn: "/login", // Kullanıcı giriş yapmamışsa yönlendirilecek sayfa
    },
});

// Varsayılan olarak TÜM sayfalar korunur; yalnızca aşağıdakiler hariç tutulur:
// login/register, API route'ları (kendi session kontrollerini yapar, /api/auth zaten herkese açık olmalı)
// ve Next.js statik dosyaları. Yeni eklenen sayfalar otomatik olarak korunmuş olur.
export const config = {
    matcher: [
        "/((?!(?:login|register|api)(?:/|$)|_next/static|_next/image|favicon\\.ico|icon\\.svg).*)",
    ],
};