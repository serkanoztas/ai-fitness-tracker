import { z } from "zod";
import {
    ACTIVITY_LEVELS,
    MACRO_GENDERS,
    MACRO_GOALS,
    WORKOUT_SPLITS,
    type ActivityLevelId,
    type MacroGoalId,
} from "@/lib/constants";
import { normalizeText } from "@/lib/text";

// --- Ortak yapı taşları ---

/** Formlardan string olarak gelebilen sayılar için: "12" -> 12, "" -> 0 */
const num = (label: string, min: number, max: number) =>
    z.coerce
        .number({ error: `${label} sayı olmalıdır.` })
        .min(min, `${label} en az ${min} olmalıdır.`)
        .max(max, `${label} en fazla ${max} olabilir.`);

const objectId = z.string({ error: "Geçersiz id." }).regex(/^[a-f\d]{24}$/i, "Geçersiz id.");
const splitType = z.enum(WORKOUT_SPLITS, { error: "Geçersiz antrenman tipi." });

/**
 * Kullanıcının serbest metin alanları: Unicode (NFKC) normalizasyonu, boşluk sadeleştirme ve
 * görünmez/denetim karakteri temizliği uygulanır; ardından uzunluk doğrulanır.
 */
const cleanText = (max: number, messages: { required: string; empty: string; tooLong: string }) =>
    z
        .string({ error: messages.required })
        .transform(normalizeText)
        .pipe(z.string().min(1, messages.empty).max(max, messages.tooLong));

const exerciseName = cleanText(80, {
    required: "Egzersiz adı gereklidir.",
    empty: "Egzersiz adı boş olamaz.",
    tooLong: "Egzersiz adı en fazla 80 karakter olabilir.",
});

export const idParamSchema = objectId;

// --- Antrenman ---

export const createWorkoutSchema = z.object({
    splitType,
    exercises: z
        .array(
            z.object({
                exerciseName,
                sets: z
                    .array(
                        z.object({
                            weight: z.number({ error: "Ağırlık sayı olmalıdır." }).positive("Ağırlık 0'dan büyük olmalıdır.").max(1000, "Ağırlık en fazla 1000 olabilir."),
                            reps: z.number({ error: "Tekrar sayı olmalıdır." }).int("Tekrar tam sayı olmalıdır.").positive("Tekrar 0'dan büyük olmalıdır.").max(1000, "Tekrar en fazla 1000 olabilir."),
                        })
                    )
                    .min(1, "Her egzersizde en az bir set olmalıdır.")
                    .max(50, "Bir egzersizde en fazla 50 set olabilir."),
            })
        )
        .min(1, "En az bir egzersiz gereklidir.")
        .max(30, "Bir antrenmanda en fazla 30 egzersiz olabilir."),
});

export const updateWorkoutSchema = z.object({
    workoutId: objectId,
    splitType,
});

// --- Rutin ---

export const createRoutineSchema = z.object({
    routineName: cleanText(60, {
        required: "Rutin adı gereklidir.",
        empty: "Rutin adı boş olamaz.",
        tooLong: "Rutin adı en fazla 60 karakter olabilir.",
    }),
    splitType,
    exercises: z
        .array(
            z.object({
                exerciseName,
                sets: z.number({ error: "Set sayısı sayı olmalıdır." }).int("Set sayısı tam sayı olmalıdır.").min(1, "En az 1 set olmalıdır.").max(50, "En fazla 50 set olabilir."),
            })
        )
        .min(1, "En az bir egzersiz gereklidir.")
        .max(30, "Bir rutinde en fazla 30 egzersiz olabilir."),
});

// --- Beslenme / Kilo / Hedef ---

export const createNutritionLogSchema = z.object({
    calories: num("Kalori", 1, 20000),
    protein: num("Protein", 0, 2000).default(0),
    carbs: num("Karbonhidrat", 0, 3000).default(0),
    fat: num("Yağ", 0, 2000).default(0),
});

export const createWeightLogSchema = z.object({
    weight: num("Kilo", 20, 500),
});

export const dailyGoalsSchema = z.object({
    calories: num("Kalori", 1, 20000),
    protein: num("Protein", 0, 2000),
    carbs: num("Karbonhidrat", 0, 3000),
    fat: num("Yağ", 0, 2000),
});

// --- Kullanıcı ---

export const updateProfileSchema = z.object({
    name: cleanText(60, {
        required: "İsim alanı boş bırakılamaz",
        empty: "İsim alanı boş bırakılamaz",
        tooLong: "İsim en fazla 60 karakter olabilir.",
    }),
    // Boş string / null "değiştirme" anlamına gelir. Base64 data URL (en fazla ~1.5MB) veya https URL kabul edilir.
    image: z
        .string()
        .max(1_500_000, "Profil resmi çok büyük.")
        .regex(/^(data:image\/(png|jpe?g|webp|gif);base64,|https:\/\/)/, "Geçersiz profil resmi formatı.")
        .or(z.literal(""))
        .nullish()
        .transform((v) => (v ? v : undefined)),
});

export const registerSchema = z.object({
    name: cleanText(60, {
        required: "İsim gereklidir.",
        empty: "İsim gereklidir.",
        tooLong: "İsim en fazla 60 karakter olabilir.",
    }),
    email: z.string({ error: "E-posta gereklidir." }).trim().toLowerCase().max(254).pipe(z.email("Geçerli bir e-posta giriniz.")),
    // bcrypt yalnızca ilk 72 byte'ı kullanır; daha uzun parolalar sessizce kırpılmasın.
    password: z.string({ error: "Şifre gereklidir." }).min(8, "Şifre en az 8 karakter olmalıdır.").max(72, "Şifre en fazla 72 karakter olabilir."),
});

// --- AI ---

// Seçenekler sabit listelerden gelir: serbest metin prompt'a girmez (prompt injection yüzeyi yok).
const ACTIVITY_LEVEL_IDS = ACTIVITY_LEVELS.map((a) => a.id) as [ActivityLevelId, ...ActivityLevelId[]];
const MACRO_GOAL_IDS = MACRO_GOALS.map((g) => g.id) as [MacroGoalId, ...MacroGoalId[]];

export const macroRequestSchema = z.object({
    age: num("Yaş", 10, 100),
    gender: z.enum(MACRO_GENDERS, { error: "Geçersiz cinsiyet." }),
    weight: num("Kilo", 20, 400),
    height: num("Boy", 80, 260),
    activityLevel: z.enum(ACTIVITY_LEVEL_IDS, { error: "Geçersiz aktivite seviyesi." }),
    goal: z.enum(MACRO_GOAL_IDS, { error: "Geçersiz hedef." }),
});

// --- Giriş ---

/**
 * Giriş formu. Biçim hataları da "geçersiz bilgi" olarak ele alınır (hangi alanın yanlış olduğu ele verilmez);
 * bu yüzden şemada ayrıntılı mesaj yok. E-posta kayıttakiyle aynı biçimde normalize edilir.
 */
export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1).max(254),
    // Kayıt şeması 72 karakterden uzun parolayı zaten kabul etmez; daha uzunu doğrulanamaz, bcrypt'e hiç gitmesin.
    password: z.string().min(1).max(72),
});
