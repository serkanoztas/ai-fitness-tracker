import { z } from "zod";

// --- Ortak yapı taşları ---

export const SPLIT_TYPES = ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Other", "Arms"] as const;

/** Formlardan string olarak gelebilen sayılar için: "12" -> 12, "" -> 0 */
const num = (label: string, min: number, max: number) =>
    z.coerce
        .number({ error: `${label} sayı olmalıdır.` })
        .min(min, `${label} en az ${min} olmalıdır.`)
        .max(max, `${label} en fazla ${max} olabilir.`);

const objectId = z.string({ error: "Geçersiz id." }).regex(/^[a-f\d]{24}$/i, "Geçersiz id.");
const splitType = z.enum(SPLIT_TYPES, { error: "Geçersiz antrenman tipi." });
const exerciseName = z
    .string({ error: "Egzersiz adı gereklidir." })
    .trim()
    .min(1, "Egzersiz adı boş olamaz.")
    .max(80, "Egzersiz adı en fazla 80 karakter olabilir.");

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
    routineName: z.string({ error: "Rutin adı gereklidir." }).trim().min(1, "Rutin adı boş olamaz.").max(60, "Rutin adı en fazla 60 karakter olabilir."),
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
    name: z.string({ error: "İsim alanı boş bırakılamaz" }).trim().min(1, "İsim alanı boş bırakılamaz").max(60, "İsim en fazla 60 karakter olabilir."),
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
    name: z.string({ error: "İsim gereklidir." }).trim().min(1, "İsim gereklidir.").max(60, "İsim en fazla 60 karakter olabilir."),
    email: z.string({ error: "E-posta gereklidir." }).trim().max(254).pipe(z.email("Geçerli bir e-posta giriniz.")),
    // bcrypt yalnızca ilk 72 byte'ı kullanır; daha uzun parolalar sessizce kırpılmasın.
    password: z.string({ error: "Şifre gereklidir." }).min(8, "Şifre en az 8 karakter olmalıdır.").max(72, "Şifre en fazla 72 karakter olabilir."),
});

// --- AI ---

export const macroRequestSchema = z.object({
    age: num("Yaş", 10, 100),
    gender: z.enum(["Erkek", "Kadın"], { error: "Geçersiz cinsiyet." }),
    weight: num("Kilo", 20, 400),
    height: num("Boy", 80, 260),
    // Prompt'a girdiği için uzunluk sınırlı tutuluyor (prompt injection yüzeyini küçültür).
    activityLevel: z.string({ error: "Aktivite seviyesi gereklidir." }).trim().min(1, "Aktivite seviyesi gereklidir.").max(100),
    goal: z.string({ error: "Hedef gereklidir." }).trim().min(1, "Hedef gereklidir.").max(100),
});
