import { ISet } from "@/types";

/**
 * Tek bir egzersizin toplam volume (hacim) değerini hesaplar.
 * Formül: Toplam(Ağırlık × Tekrar)
 */
export function calculateExerciseVolume(sets: Omit<ISet, "isPR">[]): number {
    return sets.reduce((total, set) => total + (set.weight * set.reps), 0);
}

/**
 * Tüm antrenmanın total volume (toplam hacim) değerini hesaplar.
 */
export function calculateTotalWorkoutVolume(
    exercises: { sets: Omit<ISet, "isPR">[] }[]
): number {
    return exercises.reduce((total, exercise) => {
        return total + calculateExerciseVolume(exercise.sets);
    }, 0);
}

/**
 * Bir setin Kişisel Rekor (PR - Personal Record) olup olmadığını kontrol eder.
 * Kural: 
 * 1. Geçmişteki maksimum ağırlıktan daha ağırsa -> PR
 * 2. Ağırlık aynı ama geçmişteki tekrardan daha fazlaysa -> PR
 */
export function checkIsPR(
    currentWeight: number,
    currentReps: number,
    historicalMaxWeight: number,
    historicalMaxRepsAtMaxWeight: number
): boolean {
    if (currentWeight > historicalMaxWeight) {
        return true;
    }
    if (currentWeight === historicalMaxWeight && currentReps > historicalMaxRepsAtMaxWeight) {
        return true;
    }
    return false;
}

/**
 * Gelen ham antrenman verisini işler:
 * - Her egzersizin kendi volume'ünü hesaplar
 * - Antrenmanın total volume'ünü hesaplar
 * - Geçmiş verilere (historical data) bakarak hangi setlerin PR olduğunu işaretler
 */
export function processWorkoutData(
    rawExercises: { exerciseId: string; sets: { weight: number; reps: number }[] }[],
    historicalBestRecords: Record<string, { maxWeight: number; maxReps: number }>
) {
    let totalWorkoutVolume = 0;

    const processedExercises = rawExercises.map((ex) => {
        const historicalBest = historicalBestRecords[ex.exerciseId] || { maxWeight: 0, maxReps: 0 };
        let currentBestWeight = historicalBest.maxWeight;
        let currentBestReps = historicalBest.maxReps;

        const processedSets = ex.sets.map((set) => {
            const isPR = checkIsPR(set.weight, set.reps, currentBestWeight, currentBestReps);

            // Eğer bu set bir PR ise, mevcut döngüdeki (aynı antrenman içindeki sonraki setler için) rekoru güncelle
            if (isPR) {
                currentBestWeight = set.weight;
                currentBestReps = set.reps;
            }

            return { ...set, isPR };
        });

        const exerciseVolume = calculateExerciseVolume(ex.sets);
        totalWorkoutVolume += exerciseVolume;

        return {
            exercise: ex.exerciseId,
            sets: processedSets,
            exerciseVolume,
        };
    });

    return {
        processedExercises,
        totalWorkoutVolume,
    };
}