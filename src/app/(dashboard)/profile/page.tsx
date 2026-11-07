"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Camera, User, Save, Loader2, ImagePlus } from "lucide-react";
import { apiRequest, getErrorMessage } from "@/lib/api/client";
import { useProfileImage } from "@/hooks/useProfileImage";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

export default function ProfilePage() {
    const { data: session, update } = useSession();

    // Kullanıcı düzenleme yapana kadar (null) oturumdan/yerel depodan gelen değerler gösterilir.
    // Böylece session yüklenince state'i effect ile senkronlamaya gerek kalmaz.
    const [nameInput, setNameInput] = useState<string | null>(null);
    const [imageInput, setImageInput] = useState<string | null>(null);
    const storedImage = useProfileImage();
    const name = nameInput ?? session?.user?.name ?? "";
    const image = imageInput ?? storedImage;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Gizli dosya seçiciyi tetiklemek için referans
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Dosyayı Base64 stringine çeviren yardımcı fonksiyon
    const convertToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => resolve(fileReader.result as string);
            fileReader.onerror = () => reject(fileReader.error);
        });

    // Resim seçildiğinde çalışacak fonksiyon
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_IMAGE_BYTES) {
            toast.error("Fotoğraf boyutu 2MB'dan küçük olmalıdır.");
            return;
        }

        try {
            setImageInput(await convertToBase64(file));
        } catch (error) {
            console.error("Resim dönüştürme hatası", error);
            toast.error("Resim işlenirken bir hata oluştu.");
        }
    };

    // Formu Gönderme (API'ye İstek Atma)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await apiRequest("/api/user/profile", { method: "PATCH", body: { name, image } });
            toast.success("Profil başarıyla güncellendi!");

            await update({ name });

            if (image) {
                try {
                    localStorage.setItem("userProfileImage", image);
                    // Layout ve diğer bileşenlerin haberdar olması için event fırlatıyoruz
                    window.dispatchEvent(new Event("profileImageUpdated"));
                } catch {
                    toast.warning("Resim kaydedildi ancak bu cihazda önbelleğe alınamadı.");
                }
            }
        } catch (err) {
            toast.error(getErrorMessage(err, "Güncellenirken bir hata oluştu."));
        } finally {
            setIsSubmitting(false);
        }
    };

    const userInitial = name.charAt(0).toUpperCase() || "Ş";

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <User className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Profil Ayarları
                </h1>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Resim Yükleme Alanı */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            {image ? (
                                // next/image yerine <img>: kaynak çoğunlukla base64 data URL (önizleme), optimize edilecek bir dosya değil
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={image} 
                                    alt="Profil" 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-50 dark:border-gray-900 shadow-md group-hover:opacity-75 transition-opacity"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-4xl border-4 border-gray-50 dark:border-gray-900 shadow-md group-hover:opacity-75 transition-opacity">
                                    {userInitial}
                                </div>
                            )}
                            
                            {/* Hover Edit İkonu */}
                            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-8 h-8 text-white" />
                            </div>

                            {/* Sağ Alt Köşe İkonu */}
                            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                                <ImagePlus className="w-4 h-4" />
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 font-medium">Değiştirmek için fotoğrafa tıkla</p>
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                    </div>

                    {/* İsim Değiştirme Alanı */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Ad Soyad
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3.5 outline-none transition-all"
                                placeholder="Adınız Soyadınız"
                                required
                            />
                        </div>
                    </div>

                    {/* Kaydet Butonu */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !name}
                        className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...</>
                        ) : (
                            <><Save className="w-5 h-5" /> Değişiklikleri Kaydet</>
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}