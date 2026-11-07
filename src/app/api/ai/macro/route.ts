import { NextResponse } from "next/server";
import { ApiError, parseBody, withAuth } from "@/lib/api/handler";
import { generateText } from "@/lib/ai/gemini";
import { MIN_CALORIE_NOTICE, calculateMacros, fallbackAdvice } from "@/lib/ai/macro";
import { MACRO_ADVICE_SYSTEM_PROMPT, buildMacroAdvicePrompt } from "@/lib/ai/prompt";
import { ACTIVITY_LEVELS, MACRO_GOALS } from "@/lib/constants";
import { macroRequestSchema } from "@/lib/validation/schemas";

const MAX_ADVICE_LENGTH = 300;
const MAX_OUTPUT_TOKENS = 200;

/** Model çıktısını tek satırlık düz metne indirger (markdown/tırnak kalıntılarını temizler). */
function cleanAdvice(text: string): string {
    return text
        .replace(/[*_`#>]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^["“”']+|["“”']+$/g, "")
        .slice(0, MAX_ADVICE_LENGTH);
}

// Sayılar deterministik hesaplanır; AI çökse bile hedefler ve (sabit) tavsiye döner.
export const POST = withAuth(async ({ req }) => {
    const input = await parseBody(req, macroRequestSchema);

    const result = calculateMacros({
        age: input.age,
        gender: input.gender,
        weightKg: input.weight,
        heightCm: input.height,
        activityLevel: input.activityLevel,
        goal: input.goal,
    });

    let advice = fallbackAdvice(input.goal);
    try {
        const ai = await generateText({
            systemInstruction: MACRO_ADVICE_SYSTEM_PROMPT,
            prompt: buildMacroAdvicePrompt({
                gender: input.gender,
                age: input.age,
                weightKg: input.weight,
                goalLabel: MACRO_GOALS.find((g) => g.id === input.goal)?.label ?? input.goal,
                activityLabel: ACTIVITY_LEVELS.find((a) => a.id === input.activityLevel)?.label ?? input.activityLevel,
                result,
            }),
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.7,
        });
        const cleaned = cleanAdvice(ai.text);
        if (cleaned && !ai.truncated) advice = cleaned;
    } catch (err) {
        // Yapılandırma hatası (anahtar yok / yetki) dışında sessizce sabit tavsiyeye düşülür.
        if (err instanceof ApiError && err.status === 500) {
            console.error("AI Makro: yapılandırma hatası, sabit tavsiye kullanılıyor.", err.message);
        } else {
            console.warn("AI Makro: tavsiye üretilemedi, sabit tavsiye kullanılıyor.");
        }
    }

    if (result.flooredToMinimum) {
        advice = `${advice} ${MIN_CALORIE_NOTICE(result.calories)}`;
    }

    return NextResponse.json(
        { calories: result.calories, protein: result.protein, carbs: result.carbs, fat: result.fat, ai_advice: advice },
        { status: 200 }
    );
}, "AI Macro Calculator", { db: false });
