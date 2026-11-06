import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MACRO_COACH_SYSTEM_PROMPT, buildMacroAnalysisPrompt } from "@/lib/ai/prompt";
import { ApiError, parseBody, withAuth } from "@/lib/api/handler";
import { macroRequestSchema } from "@/lib/validation/schemas";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function generateMacroJson(model: string, userPrompt: string): Promise<string> {
    const generativeModel = genAI!.getGenerativeModel({
        model,
        systemInstruction: MACRO_COACH_SYSTEM_PROMPT,
    });

    const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json", // JSON zorlaması
            temperature: 0.1, // Matematiksel doğruluk için düşük sıcaklık
        },
    });
    return result.response.text();
}

export const POST = withAuth(async ({ req }) => {
    if (!genAI) {
        throw new ApiError(500, "API anahtarı eksik.");
    }

    const input = await parseBody(req, macroRequestSchema);
    const userPrompt = buildMacroAnalysisPrompt(input);

    let aiResponseText: string;
    try {
        // 1. Önce Ana Modeli Dene
        aiResponseText = await generateMacroJson("gemini-3.5-flash-lite", userPrompt);
    } catch (primaryError) {
        console.warn("Ana model (3.5 Flash Lite) başarısız oldu, Fallback (2.5 Flash Lite) deneniyor...", primaryError);
        try {
            // 2. Fallback Modeli Dene
            aiResponseText = await generateMacroJson("gemini-2.5-flash-lite", userPrompt);
        } catch (fallbackError) {
            console.error("AI Fallback de başarısız oldu:", fallbackError);
            throw new ApiError(502, "AI analizi şu anda gerçekleştirilemiyor.");
        }
    }

    let macroData: unknown;
    try {
        macroData = JSON.parse(aiResponseText);
    } catch {
        console.error("AI geçersiz JSON döndü:", aiResponseText);
        throw new ApiError(502, "AI geçersiz bir yanıt döndürdü, lütfen tekrar deneyin.");
    }

    return NextResponse.json(macroData, { status: 200 });
}, "AI Macro Calculator", { db: false });
