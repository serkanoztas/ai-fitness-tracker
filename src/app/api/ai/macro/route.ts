import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MACRO_COACH_SYSTEM_PROMPT, buildMacroAnalysisPrompt, AIMacroContext } from "@/lib/ai/prompt";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
    try {
        if (!genAI) {
            return NextResponse.json({ error: "API anahtarı eksik." }, { status: 500 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const body = await req.json();
        const { age, gender, weight, height, activityLevel, goal } = body as AIMacroContext;

        if (!age || !gender || !weight || !height || !activityLevel || !goal) {
            return NextResponse.json({ error: "Lütfen tüm fiziksel özelliklerinizi doldurun." }, { status: 400 });
        }

        const userPrompt = buildMacroAnalysisPrompt(body);
        let aiResponseText = "";

        try {
            // 1. Önce Ana Modeli Dene (3.5 Flash Lite)
            const model = genAI.getGenerativeModel({
                model: "gemini-3.5-flash-lite",
                systemInstruction: MACRO_COACH_SYSTEM_PROMPT
            });

            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                generationConfig: {
                    responseMimeType: "application/json", // JSON zorlaması
                    temperature: 0.1, // Matematiksel doğruluk için düşük sıcaklık
                }
            });
            aiResponseText = result.response.text();

        } catch (primaryError) {
            console.warn("Ana model (3.5 Flash Lite) başarısız oldu, Fallback (2.5 Flash Lite) deneniyor...", primaryError);

            try {
                // 2. Fallback Modeli Dene (2.5 Flash Lite)
                const fallbackModel = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash-lite",
                    systemInstruction: MACRO_COACH_SYSTEM_PROMPT
                });

                const fallbackResult = await fallbackModel.generateContent({
                    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                        temperature: 0.1,
                    }
                });
                aiResponseText = fallbackResult.response.text();

            } catch (fallbackError) {
                console.error("AI Fallback de başarısız oldu:", fallbackError);
                return NextResponse.json({ error: "AI analizi şu anda gerçekleştirilemiyor." }, { status: 500 });
            }
        }

        // Başarılı sonucu JSON'a çevirip gönder
        const macroData = JSON.parse(aiResponseText);
        return NextResponse.json(macroData, { status: 200 });

    } catch (error) {
        console.error("AI Macro Calculator Hatası:", error);
        return NextResponse.json(
            { error: "Yapay zeka hesaplama yaparken bir hata oluştu." },
            { status: 500 }
        );
    }
}