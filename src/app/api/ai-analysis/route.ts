import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { Workout } from "@/models/Workout";
import { User } from "@/models/User";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FITNESS_COACH_SYSTEM_PROMPT, buildWorkoutAnalysisPrompt, AITrainingContext } from "@/lib/ai/prompt"; // Promptları kaydettiğin dosya yolu

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY; // .env.local dosyasındaki anahtarın
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET() {
    try {
        if (!genAI) {
            return NextResponse.json({ error: "API anahtarı eksik." }, { status: 500 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        await connectToDatabase();
        const userId = session.user.id;

        // 1. Kullanıcı Verilerini (Kilo ve Beslenme) Çek
        const user = await User.findById(userId).lean();
        const currentWeight = user?.weightLogs?.length ? user.weightLogs[user.weightLogs.length - 1].weight : null;
        const latestNutrition = user?.nutritionLogs?.length ? user.nutritionLogs[user.nutritionLogs.length - 1] : null;


        // 2. En son antrenmanı bul
        const latestWorkoutList = await Workout.find({ user: new mongoose.Types.ObjectId(userId) })
            .populate("exercises.exercise")
            .sort({ date: -1 })
            .limit(1)
            .lean();

        if (!latestWorkoutList || latestWorkoutList.length === 0) {
            return NextResponse.json({ analysis: "Analiz için henüz yeterli antrenman veriniz bulunmuyor. Lütfen ilk antrenmanınızı kaydedin." }, { status: 200 });
        }

        const latestWorkout = latestWorkoutList[0];

        // 3. AYNI BÖLGEYİ ÇALIŞTIRAN (Örn: Upper ise Upper) bir önceki antrenmanı bul
        const previousWorkoutList = await Workout.find({
            user: new mongoose.Types.ObjectId(userId),
            splitType: latestWorkout.splitType, // Elma ile elmayı kıyaslıyoruz
            date: { $lt: latestWorkout.date } // Son antrenmandan tarihi küçük olanlar
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
        const formattedExercises = latestWorkout.exercises.map((ex: any) => {
            const exerciseIdStr = ex.exercise?._id?.toString();

            // Bir önceki AYNI antrenmanda bu egzersizi bul ve en iyi setini çıkar
            let previousBest = null;
            if (previousWorkout) {
                const prevEx = previousWorkout.exercises.find((pex: any) => pex.exercise?._id?.toString() === exerciseIdStr);
                if (prevEx && prevEx.sets && prevEx.sets.length > 0) {
                    // Önceki antrenmandaki en ağır seti "previousBest" kabul ediyoruz
                    const bestSet = prevEx.sets.reduce((max: any, set: any) => set.weight > max.weight ? set : max, prevEx.sets[0]);
                    previousBest = { weight: bestSet.weight, reps: bestSet.reps };
                }
            }

            return {
                exerciseName: ex.exercise?.name || "Bilinmeyen Egzersiz",
                muscleGroup: ex.exercise?.muscleGroup || "Diğer",
                currentPerformance: ex.sets.map((set: any) => ({
                    weight: set.weight,
                    reps: set.reps,
                    isPR: set.isPR || false
                })),
                previousBest: previousBest
            };
        });

        // 4. AI Bağlamını (Context) Oluştur
        const aiContext: AITrainingContext = {
            splitType: latestWorkout.splitType,
            totalVolume: latestWorkout.totalVolume,
            previousWorkoutVolume: previousWorkout?.totalVolume || null,
            volumeChangePercentage,
            weightData: { currentWeight, weeklyChange: null },
            nutritionData: latestNutrition ? {
                calories: latestNutrition.calories,
                protein: latestNutrition.protein,
                carbs: latestNutrition.carbs,
                fat: latestNutrition.fat,
            } : null,
            muscleGroupVolumes: {},
            exercises: formattedExercises
        };

        const userPrompt = buildWorkoutAnalysisPrompt(aiContext);


        // 4. Gemini API Çağrısı (Fallback Mantığı İle)
        let aiResponse = "";
        try {
            // Önce Ana Modeli Dene (3.5 Flash Lite)
            const model = genAI.getGenerativeModel({
                model: "gemini-3.5-flash-lite",
                systemInstruction: FITNESS_COACH_SYSTEM_PROMPT
            });
            const result = await model.generateContent(userPrompt);
            aiResponse = result.response.text();
        } catch (primaryError) {
            console.warn("Ana model (3.5 Flash Lite) başarısız oldu, Fallback (2.5 Flash Lite) deneniyor...", primaryError);

            try {
                // Fallback Modeli Dene (2.5 Flash Lite)
                const fallbackModel = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash-lite",
                    systemInstruction: FITNESS_COACH_SYSTEM_PROMPT
                });
                const fallbackResult = await fallbackModel.generateContent(userPrompt);
                aiResponse = fallbackResult.response.text();
            } catch (fallbackError) {
                console.error("AI Fallback de başarısız oldu:", fallbackError);
                return NextResponse.json({ error: "AI analizi şu anda gerçekleştirilemiyor." }, { status: 500 });
            }
        }

        return NextResponse.json({ analysis: aiResponse }, { status: 200 });

    } catch (error) {
        console.error("AI API Genel Hatası:", error);
        return NextResponse.json({ error: "Sunucu hatası oluştu." }, { status: 500 });
    }
}