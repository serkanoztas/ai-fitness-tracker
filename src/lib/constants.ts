/**
 * Alan değerlerinin tek kaynağı. Mongoose şemaları, zod doğrulaması, TypeScript tipleri
 * ve arayüzdeki seçim listeleri buradan beslenir. (Hiçbir import içermez: istemciye güvenle taşınabilir.)
 */

export const WORKOUT_SPLITS = ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Arms", "Other"] as const;

export const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Other"] as const;
