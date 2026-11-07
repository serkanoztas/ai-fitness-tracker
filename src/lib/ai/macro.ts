import type { ActivityLevelId, MacroGender, MacroGoalId } from "@/lib/constants";

/**
 * Günlük kalori ve makro hedefi — tamamen deterministik hesap (Mifflin-St Jeor).
 * AI yalnızca açıklama/tavsiye metni için kullanılır; sayılar buradan gelir.
 */

export interface MacroInput {
    age: number;
    gender: MacroGender;
    weightKg: number;
    heightCm: number;
    activityLevel: ActivityLevelId;
    goal: MacroGoalId;
}

export interface MacroTargets {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MacroResult extends MacroTargets {
    bmr: number;
    tdee: number;
    /** Güvenlik için kalori alt sınırı uygulandıysa true */
    flooredToMinimum: boolean;
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevelId, number> = {
    sedanter: 1.2,
    hafif: 1.375,
    ortalama: 1.55,
    aktif: 1.725,
    cok_aktif: 1.9,
};

/** Hedefe göre günlük kalori farkı (kcal). ~1 kg/hafta ≈ 1000 kcal/gün kabulüyle. */
const GOAL_CALORIE_DELTA: Record<MacroGoalId, number> = {
    koruma: 0,
    hafif_kayip: -250,
    ortalama_kayip: -500,
    asiri_kayip: -1000,
    hafif_kazanim: 250,
    ortalama_kazanim: 500,
};

/** Genel kabul gören asgari günlük kalori tabanları; bunun altına inen öneriler yukarı çekilir. */
const MIN_CALORIES: Record<MacroGender, number> = { Erkek: 1500, Kadın: 1200 };

const PROTEIN_G_PER_KG = 2.0; // 1.8–2.2 g/kg aralığının ortası
const MAX_PROTEIN_CALORIE_SHARE = 0.35;
const FAT_CALORIE_SHARE = 0.25;

export function calculateMacros(input: MacroInput): MacroResult {
    const genderOffset = input.gender === "Erkek" ? 5 : -161;
    const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + genderOffset;
    const tdee = bmr * ACTIVITY_MULTIPLIER[input.activityLevel];

    const target = tdee + GOAL_CALORIE_DELTA[input.goal];
    const minimum = MIN_CALORIES[input.gender];
    const flooredToMinimum = target < minimum;
    const calories = Math.round(Math.max(target, minimum));

    const protein = Math.round(Math.min(PROTEIN_G_PER_KG * input.weightKg, (calories * MAX_PROTEIN_CALORIE_SHARE) / 4));
    const fat = Math.round((calories * FAT_CALORIE_SHARE) / 9);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

    return { calories, protein, carbs, fat, bmr: Math.round(bmr), tdee: Math.round(tdee), flooredToMinimum };
}

/** AI çalışmadığında kullanılan, hedefe göre sabit tavsiye cümleleri. */
export function fallbackAdvice(goal: MacroGoalId): string {
    switch (goal) {
        case "hafif_kayip":
        case "ortalama_kayip":
        case "asiri_kayip":
            return "Kalori açığını sürdürülebilir tut: proteini yüksek tutarak kas kütleni koru ve haftalık kilo değişimini takip ederek hedefini gerekirse güncelle.";
        case "hafif_kazanim":
        case "ortalama_kazanim":
            return "Kalori fazlasını kuvvet antrenmanıyla destekle: proteini her gün hedefinde tut ve haftalık kilo artışını yavaş ve kontrollü izle.";
        default:
            return "Kilonu korumak için bu değerleri bir hafta uygula, kilo trendini izle ve gerekirse kalorini 100-150 kcal ayarla.";
    }
}

export const MIN_CALORIE_NOTICE = (calories: number) =>
    `Not: Güvenlik için günlük kalori önerisi alt sınır olan ${calories} kcal'de tutuldu; daha düşük bir hedef için bir uzmana danış.`;
