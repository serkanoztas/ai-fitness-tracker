import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db/connect";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Şifre", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Lütfen email ve şifre girin.");
                }

                await connectToDatabase();

                const user = await User.findOne({ email: credentials.email });
                if (!user) {
                    throw new Error("Bu email ile kayıtlı kullanıcı bulunamadı.");
                }

                // Şifre boşsa direkt işlemi reddet
                if (!user.password) {
                    throw new Error("Şifre bulunamadı.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    throw new Error("Hatalı şifre.");
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        }
    },
    pages: {
        signIn: "/login", // Kullanıcı giriş yapmamışsa bu sayfaya yönlendirilecek
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};