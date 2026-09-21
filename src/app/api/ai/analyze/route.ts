import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { FITNESS_COACH_SYSTEM_PROMPT, buildWorkoutAnalysisPrompt, AITrainingContext } from "@/lib/ai/prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const contextData = body.contextData as AITrainingContext;

        if (!contextData || !contextData.exercises) {
            return new Response(
                JSON.stringify({ error: "Analiz için geçerli antrenman verisi bulunamadı." }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const userMessage = buildWorkoutAnalysisPrompt(contextData);

        const result = await streamText({
            model: google("gemini-1.5-flash"),
            system: FITNESS_COACH_SYSTEM_PROMPT,
            prompt: userMessage,
            temperature: 0.7,
        });

        // Çözüm: toDataStreamResponse yerine toTextStreamResponse kullanıyoruz
        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error("Gemini AI Analysis API Hatası:", error);
        return new Response(
            JSON.stringify({ error: "Gemini AI koçu ile iletişim kurulamadı." }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}