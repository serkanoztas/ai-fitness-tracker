import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db/connect";
import { consumeRateLimit, getClientIp } from "@/lib/api/rateLimit";
import { RATE_LIMITS } from "@/lib/api/rateLimits";
import { loginSchema } from "@/lib/validation/schemas";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

/** Oturum (JWT) geçerlilik süresi: 7 gün */
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Hangi nedenle olursa olsun başarısız girişte kullanıcıya gösterilen tek mesaj:
 * "kullanıcı yok", "parola yanlış" ve "geçersiz biçim" birbirinden ayırt edilemez.
 */
const INVALID_CREDENTIALS = "E-posta veya şifre hatalı.";
const TOO_MANY_ATTEMPTS = "Çok fazla giriş denemesi yaptınız. Lütfen birkaç dakika sonra tekrar deneyin.";

/**
 * Var olmayan kullanıcı için de bcrypt karşılaştırması yapabilmek için sahte hash (maliyet faktörü kayıttakiyle aynı: 10).
 * Böylece "kullanıcı yok" yanıtı "parola yanlış" yanıtından belirgin biçimde hızlı olmaz.
 */
const DUMMY_PASSWORD_HASH = "$2b$10$Rt402v/MpooA2LxA4Gymzuc4xQRixOddMS/IKfw2bGj6eYpmF/S4C";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials, req) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) {
                    throw new Error(INVALID_CREDENTIALS);
                }
                const { email, password } = parsed.data;

                await connectToDatabase();

                // Hız sınırı: önce IP, sonra hesap bazında (parola denemeleri ve bcrypt CPU maliyeti için)
                const ip = getClientIp((name) => {
                    const value = req?.headers?.[name];
                    return Array.isArray(value) ? value[0] : value;
                });
                const [ipResult, accountResult] = await Promise.all([
                    consumeRateLimit(RATE_LIMITS.loginIp, ip),
                    consumeRateLimit(RATE_LIMITS.loginAccount, email),
                ]);
                if (!ipResult.allowed || !accountResult.allowed) {
                    throw new Error(TOO_MANY_ATTEMPTS);
                }

                // password şemada select:false olduğu için burada açıkça isteniyor
                const user = await User.findOne({ email }).select("+password");

                const isValid = await bcrypt.compare(password, user?.password ?? DUMMY_PASSWORD_HASH);
                if (!user || !user.password || !isValid) {
                    throw new Error(INVALID_CREDENTIALS);
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;

                // Eğer resim Google URL'si ise (kısadır) al, Base64 ise (devasadır) alma!
                if (user.image && user.image.length < 1000) {
                    token.image = user.image;
                }
            }

            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                // Session.image'i burada token'a KESİNLİKLE EKMİYORUZ (Cookie sınırını aşmamak için)
            }

            return token;
        },
        async session({ session, token }) {
            // Token'daki güncel bilgileri Frontend'in göreceği Session'a aktar
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
                session.user.image = token.image as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login", // Kullanıcı giriş yapmamışsa bu sayfaya yönlendirilecek
    },
    session: {
        strategy: "jwt",
        maxAge: SESSION_MAX_AGE_SECONDS,
    },
    jwt: {
        maxAge: SESSION_MAX_AGE_SECONDS,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
