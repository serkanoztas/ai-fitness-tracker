import { withAuth } from "next-auth/middleware";


export default withAuth({
    pages: {
        signIn: "/login", // Kullanıcı giriş yapmamışsa yönlendirilecek sayfa
    },
});

// Güvenlik duvarının HANGİ sayfalarda çalışacağını belirliyoruz
export const config = {
    matcher: [
        "/",                  // Ana sayfa (Dashboard)
        "/workout/:path*",    // Antrenman ve altındaki tüm sayfalar (new, history)
        "/weight/:path*",     // Kilo takibi sayfası


    ],
};