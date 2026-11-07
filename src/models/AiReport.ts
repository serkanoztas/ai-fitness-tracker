import mongoose, { Schema, Model, Types } from "mongoose";

/** Üretilmiş AI analiz raporları. Aynı veri (contextHash) için LLM'e tekrar gidilmesini önler. */
export interface IAiReport {
    user: Types.ObjectId;
    workout: Types.ObjectId;
    /** Bağlam + prompt sürümünün SHA-256 özeti */
    contextHash: string;
    analysis: string;
    model: string;
    createdAt: Date;
}

/** Raporlar bu süre sonra otomatik silinir (eski veriye ait raporlar birikmesin). */
const REPORT_TTL_SECONDS = 90 * 24 * 60 * 60;

const AiReportSchema = new Schema<IAiReport>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        workout: { type: Schema.Types.ObjectId, ref: "Workout", required: true },
        contextHash: { type: String, required: true },
        analysis: { type: String, required: true },
        model: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

// Önbellek araması + eşzamanlı isteklerde çift kayıt oluşmasını engeller
AiReportSchema.index({ user: 1, contextHash: 1 }, { unique: true });
// "Kullanıcının son raporu" (bekleme süresi kontrolü)
AiReportSchema.index({ user: 1, createdAt: -1 });
AiReportSchema.index({ createdAt: 1 }, { expireAfterSeconds: REPORT_TTL_SECONDS });

export const AiReport: Model<IAiReport> =
    mongoose.models.AiReport || mongoose.model<IAiReport>("AiReport", AiReportSchema);
