import mongoose, { Schema, Model } from "mongoose";

/**
 * İstek sınırlama sayaçları (sabit pencere). Her (kural, kimlik, pencere) üçlüsü için tek doküman;
 * süresi dolan dokümanları MongoDB TTL indeksi kendisi siler.
 */
export interface IRateLimit {
    /** "<kural>:<kimlik>:<pencere başlangıcı>" */
    key: string;
    count: number;
    expiresAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
    {
        key: { type: String, required: true, unique: true },
        count: { type: Number, required: true, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { versionKey: false }
);

// expireAfterSeconds: 0 -> doküman expiresAt anında silinir (TTL monitörü dakikada bir çalışır)
RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RateLimit: Model<IRateLimit> =
    mongoose.models.RateLimit || mongoose.model<IRateLimit>("RateLimit", RateLimitSchema);
