"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Dumbbell, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

// searchParams kullanımı için bileşeni Suspense içine almalıyız
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // NextAuth signIn kullanımı (Credentials provider)
        const res = await signIn("credentials", {
            redirect: false,
            email: formData.email,
            password: formData.password,
        });

        if (res?.error) {
            setError(res.error);
            setIsLoading(false);
        } else {
            // Giriş başarılıysa ana sayfaya (dashboard) yönlendir ve sayfayı yenile (session'ı algılaması için)
            router.push("/");
            router.refresh();
        }
    };

    return (
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">

            {/* Logo ve Başlık */}
            <div className="flex flex-col items-center mb-8">
                <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white shadow-lg mb-4">
                    <Dumbbell className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tekrar Hoş Geldin</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 text-center">
                    Kaldığın yerden devam et ve sınırlarını zorla.
                </p>
            </div>

            {/* Başarılı Kayıt Mesajı (Register'dan geliyorsa) */}
            {registered && !error && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <p>Kayıt başarılı! Şimdi giriş yapabilirsin.</p>
                </div>
            )}

            {/* Hata Mesajı */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="email"
                        required
                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-11 p-3.5 outline-none transition-all"
                        placeholder="E-posta Adresi"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="password"
                        required
                        className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-11 p-3.5 outline-none transition-all"
                        placeholder="Şifre"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gray-900 dark:bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-blue-700 transition-colors disabled:opacity-70 mt-2"
                >
                    {isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    {!isLoading && <ArrowRight className="w-5 h-5" />}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
                Hesabın yok mu?{" "}
                <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Hemen Kayıt Ol
                </Link>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <Suspense fallback={<div className="text-gray-500 animate-pulse">Yükleniyor...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}