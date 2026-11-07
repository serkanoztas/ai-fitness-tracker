import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { AiReport } from "@/models/AiReport";
import { ApiError, withAuth } from "@/lib/api/handler";
import { buildTrainingContext } from "@/lib/ai/context";
import { generateText } from "@/lib/ai/gemini";
import { ANALYSIS_PROMPT_VERSION, FITNESS_COACH_SYSTEM_PROMPT, buildWorkoutAnalysisPrompt } from "@/lib/ai/prompt";
import { loadAiInputs } from "@/lib/data/aiInputs";

/** Önbellekte bulunmayan (= LLM maliyeti doğuracak) iki istek arasındaki asgari süre */
const GENERATION_COOLDOWN_MS = 30_000;
/** ~250 kelimelik Türkçe rapor için yeterli, kontrolsüz uzamayı engelleyen çıktı sınırı */
const MAX_OUTPUT_TOKENS = 1024;

const NO_WORKOUT_MESSAGE = "Analiz için henüz yeterli antrenman veriniz bulunmuyor. Lütfen ilk antrenmanınızı kaydedin.";

// LLM maliyeti olan bir işlem olduğu için GET değil POST.
export const POST = withAuth(async ({ userId }) => {
    const inputs = await loadAiInputs(userId);
    if (!inputs) {
        return NextResponse.json({ analysis: NO_WORKOUT_MESSAGE, cached: false }, { status: 200 });
    }

    const context = buildTrainingContext({ ...inputs, now: new Date() });

    // Aynı veri + aynı prompt sürümü = aynı rapor. Veri (antrenman, kilo, beslenme) değişince hash de değişir.
    const contextHash = createHash("sha256")
        .update(`v${ANALYSIS_PROMPT_VERSION}:${JSON.stringify(context)}`)
        .digest("hex");

    const cached = await AiReport.findOne({ user: userId, contextHash }).select("analysis createdAt").lean();
    if (cached) {
        return NextResponse.json(
            { analysis: cached.analysis, cached: true, generatedAt: cached.createdAt },
            { status: 200 }
        );
    }

    // Önbellek ıskalandı: yeni LLM çağrısı yapılacak, art arda istekleri sınırla.
    const lastReport = await AiReport.findOne({ user: userId }).sort({ createdAt: -1 }).select("createdAt").lean();
    if (lastReport) {
        const waitMs = GENERATION_COOLDOWN_MS - (Date.now() - lastReport.createdAt.getTime());
        if (waitMs > 0) {
            throw new ApiError(429, `Yeni bir rapor için lütfen ${Math.ceil(waitMs / 1000)} saniye bekleyin.`);
        }
    }

    const result = await generateText({
        systemInstruction: FITNESS_COACH_SYSTEM_PROMPT,
        prompt: buildWorkoutAnalysisPrompt(context),
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
    });

    // Eşzamanlı iki istek aynı raporu üretirse unique indeks nedeniyle ikincisi mevcut kaydı korur.
    const saved = await AiReport.findOneAndUpdate(
        { user: userId, contextHash },
        {
            $setOnInsert: {
                workout: inputs.latest._id,
                analysis: result.text,
                model: result.model,
                createdAt: new Date(),
            },
        },
        { upsert: true, returnDocument: "after" }
    ).lean();

    return NextResponse.json(
        { analysis: saved?.analysis ?? result.text, cached: false, generatedAt: saved?.createdAt ?? new Date() },
        { status: 200 }
    );
}, "AI Analiz");
