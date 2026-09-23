import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    // 1. Session (Oturum) içine id'yi ekliyoruz
    interface Session {
        user: {
            id: string;
        } & DefaultSession["user"];
    }

    // 2. User (Kullanıcı) objesinin içine id'yi ekliyoruz
    interface User {
        id: string;
    }
}

declare module "next-auth/jwt" {
    // 3. JWT Token içine id'yi ekliyoruz
    interface JWT {
        id: string;
    }
}