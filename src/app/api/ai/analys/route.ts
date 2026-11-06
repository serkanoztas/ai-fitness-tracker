import { NextResponse } from "next/server";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FITNESS_COACH_SYSTEM_PROMPT, buildWorkoutAnalysisPrompt, AITrainingContext } from "@/lib/ai/prompt";
import { ApiError, withAuth } from "@/lib/api/handler";
import "@/models/Exercise";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateAnalysis(model: string, userPrompt: string): Promise<string> {
    const generativeModel = genAI!.getGenerativeModel({
        model,
        systemInstruction: FITNESS_COACH_SYSTEM_PROMPT,
    });
    const result = await generativeModel.generateContent(userPrompt);
    return result.response.text();
}

export const GET = withAuth(async ({ userId }) => {
    if (!genAI) {
        throw new ApiError(500, "API anahtarı eksik.");
    }

    // 1. Kullanıcı Verilerini (Kilo ve Beslenme) Çek
    const user = await User.findById(userId).select("weightLogs nutritionLogs").lean();
    const currentWeight = user?.weightLogs?.length ? user.weightLogs[user.weightLogs.length - 1].weight : null;
    const latestNutrition = user?.nutritionLogs?.length ? user.nutritionLogs[user.nutritionLogs.length - 1] : null;

    // 2. En son antrenmanı bul
    const latestWorkoutList = await Workout.find({ user: userId })
        .populate("exercises.exercise")
        .sort({ date: -1 })
        .limit(1)
        .lean();

    if (latestWorkoutList.length === 0) {
        return NextResponse.json(
            { analysis: "Analiz için henüz yeterli antrenman veriniz bulunmuyor. Lütfen ilk antrenmanınızı kaydedin." },
            { status: 200 }
        );
    }

    const latestWorkout = latestWorkoutList[0];

    // 3. AYNI BÖLGEYİ ÇALIŞTIRAN (Örn: Upper ise Upper) bir önceki antrenmanı bul
    const previousWorkoutList = await Workout.find({
        user: userId,
        splitType: latestWorkout.splitType, // Elma ile elmayı kıyaslıyoruz
        date: { $lt: latestWorkout.date }, // Son antrenmandan tarihi küçük olanlar
    })
        .populate("exercises.exercise")
        .sort({ date: -1 })
        .limit(1)
        .lean();

    const previousWorkout = previousWorkoutList.length > 0 ? previousWorkoutList[0] : null;

    // Hacim değişimi hesaplama (Aynı bölge antrenmanına göre)
    const volumeChangePercentage = previousWorkout?.totalVolume
        ? Number((((latestWorkout.totalVolume - previousWorkout.totalVolume) / previousWorkout.totalVolume) * 100).toFixed(2))
        : null;

    // Egzersiz performans verilerini formatla ve previousBest ekle
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formattedExercises = latestWorkout.exercises.map((ex: any) => {
        const exerciseIdStr = ex.exercise?._id?.toString();

        // Bir önceki AYNI antrenmanda bu egzersizi bul ve en iyi setini çıkar
        let previousBest = null;
        if (previousWorkout) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const prevEx = previousWorkout.exercises.find((pex: any) => pex.exercise?._id?.toString() === exerciseIdStr);
            if (prevEx && prevEx.sets && prevEx.sets.length > 0) {
                // Önceki antrenmandaki en ağır seti "previousBest" kabul ediyoruz
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const bestSet = prevEx.sets.reduce((max: any, set: any) => (set.weight > max.weight ? set : max), prevEx.sets[0]);
                previousBest = { weight: bestSet.weight, reps: bestSet.reps };
            }
        }

        return {
            exerciseName: ex.exercise?.name || "Bilinmeyen Egzersiz",
            muscleGroup: ex.exercise?.muscleGroup || "Diğer",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            currentPerformance: ex.sets.map((set: any) => ({
                weight: set.weight,
                reps: set.reps,
                isPR: set.isPR || false,
            })),
            previousBest,
        };
    });

    // 4. AI Bağlamını (Context) Oluştur
    const aiContext: AITrainingContext = {
        splitType: latestWorkout.splitType,
        totalVolume: latestWorkout.totalVolume,
        previousWorkoutVolume: previousWorkout?.totalVolume || null,
        volumeChangePercentage,
        weightData: { currentWeight, weeklyChange: null },
        nutritionData: latestNutrition
            ? {
                  calories: latestNutrition.calories,
                  protein: latestNutrition.protein,
                  carbs: latestNutrition.carbs,
                  fat: latestNutrition.fat,
              }
            : null,
        muscleGroupVolumes: {},
        exercises: formattedExercises,
    };

    const userPrompt = buildWorkoutAnalysisPrompt(aiContext);

    // 5. Gemini API Çağrısı (Fallback Mantığı İle)
    let aiResponse: string;
    try {
        aiResponse = await generateAnalysis("gemini-3.5-flash-lite", userPrompt);
    } catch (primaryError) {
        console.warn("Ana model (3.5 Flash Lite) başarısız oldu, Fallback (2.5 Flash Lite) deneniyor...", primaryError);
        try {
            aiResponse = await generateAnalysis("gemini-2.5-flash-lite", userPrompt);
        } catch (fallbackError) {
            console.error("AI Fallback de başarısız oldu:", fallbackError);
            throw new ApiError(502, "AI analizi şu anda gerçekleştirilemiyor.");
        }
    }

    return NextResponse.json({ analysis: aiResponse }, { status: 200 });
}, "AI Analiz");
