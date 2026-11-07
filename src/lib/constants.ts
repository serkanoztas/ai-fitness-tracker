/**
 * Alan değerlerinin tek kaynağı. Mongoose şemaları, zod doğrulaması, TypeScript tipleri
 * ve arayüzdeki seçim listeleri buradan beslenir. (Hiçbir import içermez: istemciye güvenle taşınabilir.)
 */

export const WORKOUT_SPLITS = ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Arms", "Other"] as const;

export const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Other"] as const;

/** Günlük toplamlar (beslenme vb.) bu saat dilimine göre "gün" sayılır. */
export const APP_TIME_ZONE = "Europe/Istanbul";

// --- Makro hesaplayıcı seçenekleri (arayüz etiketleri + sunucu doğrulaması aynı listeden) ---

export const MACRO_GENDERS = ["Erkek", "Kadın"] as const;

export const ACTIVITY_LEVELS = [
    { id: "sedanter", label: "Sedanter (Çok az/hiç egzersiz)" },
    { id: "hafif", label: "Hafif (Haftada 1-3 gün)" },
    { id: "ortalama", label: "Ortalama (Haftada 4-5 gün)" },
    { id: "aktif", label: "Aktif (Hergün veya yoğun)" },
    { id: "cok_aktif", label: "Çok Aktif (Haftada 6-7 çift idman)" },
] as const;

export const MACRO_GOALS = [
    { id: "koruma", label: "Kilo Korumak" },
    { id: "hafif_kayip", label: "Hafif Kilo Kaybı (-0.25kg/hafta)" },
    { id: "ortalama_kayip", label: "Ortalama Kilo Kaybı (-0.5kg/hafta)" },
    { id: "asiri_kayip", label: "Hızlı Kilo Kaybı (-1kg/hafta)" },
    { id: "hafif_kazanim", label: "Hafif Kilo Kazanımı (+0.25kg/hafta)" },
    { id: "ortalama_kazanim", label: "Ortalama Kilo Kazanımı (+0.5kg/hafta)" },
] as const;

export type ActivityLevelId = (typeof ACTIVITY_LEVELS)[number]["id"];
export type MacroGoalId = (typeof MACRO_GOALS)[number]["id"];
export type MacroGender = (typeof MACRO_GENDERS)[number];
