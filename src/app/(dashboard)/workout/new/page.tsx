"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Dumbbell } from "lucide-react";

const SPLIT_TYPES = ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Other", "Arms"];

export default function NewWorkoutPage() {
    // --- STATELER ---

    // Veritabanından gelecek egzersiz listesi
    const [dbExercises, setDbExercises] = useState<{ _id: string; name: string }[]>([]);
    const [isLoadingExercises, setIsLoadingExercises] = useState(true);

    // Form stateleri
    const [splitType, setSplitType] = useState("Upper");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dinamik Egzersiz ve Set State'i
    const [exercises, setExercises] = useState([
        {
            exerciseName: "", // BURASI DEĞİŞTİ
            sets: [{ weight: "", reps: "" }],
        },
    ]);

    // --- VERİ ÇEKME İŞLEMİ ---
    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const res = await fetch("/api/exercises");
                if (res.ok) {
                    const data = await res.json();
                    setDbExercises(data);
                }
            } catch (error) {
                console.error("Egzersizler çekilemedi", error);
            } finally {
                setIsLoadingExercises(false);
            }
        };

        fetchExercises();
    }, []);

    // --- HANDLER FONKSİYONLARI ---
    const addExercise = () => {
        setExercises([...exercises, { exerciseId: "", sets: [{ weight: "", reps: "" }] }]);
    };

    const removeExercise = (index: number) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        setExercises(newExercises);
    };

    const addSet = (exerciseIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets.push({ weight: "", reps: "" });
        setExercises(newExercises);
    };

    const removeSet = (exerciseIndex: number, setIndex: number) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets = newExercises[exerciseIndex].sets.filter((_, i) => i !== setIndex);
        setExercises(newExercises);
    };

    const updateSet = (exerciseIndex: number, setIndex: number, field: "weight" | "reps", value: string) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].sets[setIndex][field] = value;
        setExercises(newExercises);
    };
    const updateExerciseName = (exerciseIndex: number, value: string) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].exerciseName = value; // exerciseId yerine exerciseName tutuyoruz
        setExercises(newExercises);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                userId: "64a2b9f3e4b0c1a2d3e4f5f6", // Şimdilik dummy ID, ileride Auth eklenecek
                splitType,
                exercises: exercises
                    .map((ex) => ({
                        exerciseName: ex.exerciseName,
                        sets: ex.sets.map((set) => ({
                            weight: Number(set.weight),
                            reps: Number(set.reps),
                        })),
                    }))
                    .filter((ex) => ex.exerciseName !== ""), // Boş egzersizleri atla
            };

            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Antrenman başarıyla kaydedildi!");
                // Formu temizleyip sıfırla
                setExercises([{ exerciseName: "", sets: [{ weight: "", reps: "" }] }]);
            } else {
                alert("Kaydedilirken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ARAYÜZ ---
    return (
        <div className="max-w-2xl mx-auto p-4 md:p-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Dumbbell className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Antrenman</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Split Seçimi */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Antrenman Tipi</label>
                    <div className="flex flex-wrap gap-2">
                        {SPLIT_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSplitType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${splitType === type
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Egzersiz Listesi */}
                {exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-full">
                                <input
                                    type="text"
                                    list="exercise-suggestions" // Aşağıdaki datalist'e bağlanır
                                    value={exercise.exerciseName || ""}
                                    onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                                    placeholder={isLoadingExercises ? "Yükleniyor..." : "Egzersiz seçin veya yazın..."}
                                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none font-medium"
                                    required
                                />
                                {/* HTML5 Datalist özelliği - Native Autocomplete sağlar */}
                                <datalist id="exercise-suggestions">
                                    {dbExercises.map((dbEx) => (
                                        <option key={dbEx._id} value={dbEx.name} />
                                    ))}
                                </datalist>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeExercise(exerciseIndex)}
                                className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Setler */}
                        <div className="space-y-3">
                            <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-400 text-center px-1">
                                <div className="col-span-2">SET</div>
                                <div className="col-span-4">KG</div>
                                <div className="col-span-4">TEKRAR</div>
                                <div className="col-span-2"></div>
                            </div>

                            {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                                    <div className="col-span-2 text-center text-sm font-bold text-gray-500">
                                        {setIndex + 1}
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-center text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-center text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeSet(exerciseIndex, setIndex)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                                            disabled={exercise.sets.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => addSet(exerciseIndex)}
                            className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Set Ekle
                        </button>
                    </div>
                ))}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={addExercise}
                        className="flex-1 py-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Egzersiz
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] py-3.5 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Kaydediliyor...</span>
                        ) : (
                            <>
                                <Save className="w-5 h-5" /> Antrenmanı Bitir
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}