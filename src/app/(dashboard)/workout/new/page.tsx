"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, Dumbbell, BookmarkPlus, LibraryBig, Loader2 } from "lucide-react";

// Tip tanımlamaları
import { IRoutine } from "@/types"; // Veya tip dosyan neredeyse

const SPLIT_TYPES = ["Upper", "Lower", "Push", "Pull", "Legs", "FullBody", "Other", "Arms"];

export default function NewWorkoutPage() {
    // --- STATELER ---

    // Veritabanından gelecek listeler
    const [dbExercises, setDbExercises] = useState<{ _id: string; name: string }[]>([]);
    const [routines, setRoutines] = useState<any[]>([]); // Rutinler için state
    const [isLoadingExercises, setIsLoadingExercises] = useState(true);
    const [isLoadingRoutines, setIsLoadingRoutines] = useState(true);

    // Form stateleri
    const [splitType, setSplitType] = useState("Upper");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingRoutine, setIsSavingRoutine] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Dinamik Egzersiz ve Set State'i
    const [exercises, setExercises] = useState<{
        exerciseName: string;
        sets: { weight: string; reps: string; }[];
    }[]>([
        {
            exerciseName: "",
            sets: [{ weight: "", reps: "" }],
        },
    ]);

    // Sayfa ilk açıldığında LocalStorage'da yarım kalan antrenman var mı diye bak
    useEffect(() => {
        const savedDraft = localStorage.getItem("workoutDraft");
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                setTimeout(() => {
                    if (Array.isArray(parsedDraft)) {
                        setExercises(parsedDraft);
                    } else {
                        setExercises(parsedDraft.exercises);
                        if (parsedDraft.splitType) {
                            setSplitType(parsedDraft.splitType);
                        }
                    }
                    setIsLoaded(true);
                }, 0);
            } catch (e) {
                console.error("Taslak okunamadı");
                setIsLoaded(true);
            }
        } else {
            setIsLoaded(true);
        }
    }, []);

    // Egzersiz listesinde değişiklik oldukça taslağı kaydet
    useEffect(() => {
        if (!isLoaded) return;

        const isDefaultState = 
            splitType === "Upper" &&
            exercises.length === 1 && 
            exercises[0].exerciseName === "" && 
            exercises[0].sets.length === 1 &&
            exercises[0].sets[0].weight === "" &&
            exercises[0].sets[0].reps === "";

        if (isDefaultState) {
            localStorage.removeItem("workoutDraft");
        } else {
            localStorage.setItem("workoutDraft", JSON.stringify({ splitType, exercises }));
        }
    }, [exercises, splitType, isLoaded]);

    // --- VERİ ÇEKME İŞLEMLERİ (Egzersizler ve Rutinler) ---
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [exRes, routRes] = await Promise.all([
                    fetch("/api/exercises"),
                    fetch("/api/routines")
                ]);

                if (exRes.ok) {
                    const exData = await exRes.json();
                    setDbExercises(exData);
                }
                if (routRes.ok) {
                    const routData = await routRes.json();
                    setRoutines(routData);
                }
            } catch (error) {
                console.error("Veriler çekilemedi", error);
            } finally {
                setIsLoadingExercises(false);
                setIsLoadingRoutines(false);
            }
        };

        fetchInitialData();
    }, []);

    // --- ŞABLON (ROUTINE) İŞLEMLERİ ---
    
    // Şablon Yükleme
    const loadRoutine = (routine: any) => {
        const confirmLoad = window.confirm(`"${routine.routineName}" şablonunu yüklemek mevcut formu temizleyecektir. Onaylıyor musunuz?`);
        if (!confirmLoad) return;

        setSplitType(routine.splitType);
        
        // Şablondaki egzersizleri ve set sayılarını forma göre haritala (boş ağırlık ve tekrar ile)
        const mappedExercises = routine.exercises.map((ex: any) => ({
            exerciseName: ex.exerciseName,
            sets: Array(ex.sets).fill({ weight: "", reps: "" })
        }));
        
        setExercises(mappedExercises);
    };

    // Şablon Olarak Kaydetme
    const saveAsRoutine = async () => {
        const isFormEmpty = exercises.length === 1 && exercises[0].exerciseName === "";
        if (isFormEmpty) {
            alert("Boş bir formu şablon olarak kaydedemezsiniz!");
            return;
        }

        const routineName = window.prompt("Şablonunuz için bir isim girin (Örn: Push - Güç Günü):");
        if (!routineName || routineName.trim() === "") return;

        setIsSavingRoutine(true);

        try {
            const payload = {
                routineName,
                splitType,
                exercises: exercises
                    .filter((ex) => ex.exerciseName !== "")
                    .map((ex) => ({
                        exerciseName: ex.exerciseName,
                        sets: ex.sets.length // Sadece set sayısını alıyoruz
                    }))
            };

            const res = await fetch("/api/routines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const newRoutine = await res.json();
                setRoutines([newRoutine, ...routines]); // Listeye anında ekle
                alert("Şablon başarıyla kaydedildi!");
            } else {
                alert("Şablon kaydedilirken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            alert("Sunucuya bağlanılamadı.");
        } finally {
            setIsSavingRoutine(false);
        }
    };


    // --- HANDLER FONKSİYONLARI ---
    const addExercise = () => {
        setExercises([...exercises, { exerciseName: "", sets: [{ weight: "", reps: "" }] }]);
    };

    const removeExercise = (index: number) => {
        const newExercises = exercises.filter((_, i) => i !== index);
        if (newExercises.length === 0) {
            setExercises([{ exerciseName: "", sets: [{ weight: "", reps: "" }] }]);
        } else {
            setExercises(newExercises);
        }
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
        // Referans kopması olmaması için objeyi kopyalayarak güncelliyoruz
        newExercises[exerciseIndex].sets[setIndex] = { 
            ...newExercises[exerciseIndex].sets[setIndex], 
            [field]: value 
        };
        setExercises(newExercises);
    };

    const updateExerciseName = (exerciseIndex: number, value: string) => {
        const newExercises = [...exercises];
        newExercises[exerciseIndex].exerciseName = value;
        setExercises(newExercises);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                splitType,
                exercises: exercises
                    .map((ex) => ({
                        exerciseName: ex.exerciseName,
                        sets: ex.sets.map((set) => ({
                            weight: Number(set.weight),
                            reps: Number(set.reps),
                        })).filter(set => set.weight > 0 && set.reps > 0), // Boş setleri engelle
                    }))
                    .filter((ex) => ex.exerciseName !== "" && ex.sets.length > 0), 
            };

            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("Antrenman başarıyla kaydedildi!");
                localStorage.removeItem("workoutDraft");
                setExercises([{ exerciseName: "", sets: [{ weight: "", reps: "" }] }]);
                setSplitType("Upper");
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
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                    <Dumbbell className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Yeni Antrenman</h1>
            </div>

            {/* Kayıtlı Şablonlarım Alanı */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-700 dark:text-gray-300 font-semibold">
                    <LibraryBig className="w-5 h-5 text-indigo-500" />
                    <h2>Şablonlarım</h2>
                </div>
                
                {isLoadingRoutines ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500"><Loader2 className="w-4 h-4 animate-spin"/> Yükleniyor...</div>
                ) : routines.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        Henüz kaydedilmiş bir şablonunuz yok. Antrenman formunu doldurup "Şablon Olarak Kaydet" butonunu kullanabilirsiniz.
                    </p>
                ) : (
                    <div className="flex overflow-x-auto pb-2 gap-3 custom-scrollbar">
                        {routines.map((routine) => (
                            <button
                                key={routine._id}
                                type="button"
                                onClick={() => loadRoutine(routine)}
                                className="flex-shrink-0 bg-white dark:bg-gray-800 px-4 py-3 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left flex flex-col min-w-[140px] group"
                            >
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {routine.routineName}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">{routine.splitType} • {routine.exercises.length} Hareket</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Split Seçimi */}
                <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Antrenman Tipi (Split)</label>
                    <div className="flex flex-wrap gap-2">
                        {SPLIT_TYPES.map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setSplitType(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${splitType === type
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                            <div className="w-full relative">
                                <input
                                    type="text"
                                    list={`exercise-suggestions-${exerciseIndex}`}
                                    value={exercise.exerciseName || ""}
                                    onChange={(e) => updateExerciseName(exerciseIndex, e.target.value)}
                                    placeholder={isLoadingExercises ? "Yükleniyor..." : "Egzersiz seçin veya yazın..."}
                                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 outline-none font-semibold transition-all"
                                    required
                                />
                                <datalist id={`exercise-suggestions-${exerciseIndex}`}>
                                    {dbExercises.map((dbEx) => (
                                        <option key={dbEx._id} value={dbEx.name} />
                                    ))}
                                </datalist>
                            </div>

                            <button
                                type="button"
                                onClick={() => removeExercise(exerciseIndex)}
                                className="ml-3 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Setler */}
                        <div className="space-y-2">
                            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-400 text-center px-1 mb-1">
                                <div className="col-span-2">SET</div>
                                <div className="col-span-4">KG</div>
                                <div className="col-span-4">TEKRAR</div>
                                <div className="col-span-2"></div>
                            </div>

                            {exercise.sets.map((set, setIndex) => (
                                <div key={setIndex} className="grid grid-cols-12 gap-2 items-center group">
                                    <div className="col-span-2 text-center text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                                        {setIndex + 1}
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            value={set.weight}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, "weight", e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-center text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="0"
                                            step="0.5"
                                        />
                                    </div>
                                    <div className="col-span-4">
                                        <input
                                            type="number"
                                            value={set.reps}
                                            onChange={(e) => updateSet(exerciseIndex, setIndex, "reps", e.target.value)}
                                            placeholder="0"
                                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-center text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                            min="1"
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button
                                            type="button"
                                            onClick={() => removeSet(exerciseIndex, setIndex)}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"
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
                            className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Yeni Set
                        </button>
                    </div>
                ))}

                {/* Aksiyon Butonları Alanı */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    
                    {/* Egzersiz Ekle */}
                    <button
                        type="button"
                        onClick={addExercise}
                        className="w-full sm:flex-1 py-3.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                    >
                        <Plus className="w-5 h-5" /> Egzersiz
                    </button>
                    
                    {/* Şablon Olarak Kaydet */}
                    <button
                        type="button"
                        onClick={saveAsRoutine}
                        disabled={isSavingRoutine}
                        className="w-full sm:flex-1 py-3.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors disabled:opacity-70"
                    >
                        {isSavingRoutine ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookmarkPlus className="w-5 h-5" />}
                        Şablon Yap
                    </button>

                    {/* Antrenmanı Bitir */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full sm:flex-[2] py-3.5 bg-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-md shadow-blue-500/20"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...</>
                        ) : (
                            <><Save className="w-5 h-5" /> Antrenmanı Bitir</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}