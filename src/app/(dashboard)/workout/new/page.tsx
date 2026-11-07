"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Dumbbell, BookmarkPlus, LibraryBig, Loader2 } from "lucide-react";
import { WORKOUT_SPLITS } from "@/lib/constants";

const SPLIT_TYPES: readonly string[] = WORKOUT_SPLITS;
const DRAFT_KEY = "workoutDraft";
const DRAFT_DEBOUNCE_MS = 400;

// --- Tipler ---

interface SetForm {
    id: string;
    weight: string;
    reps: string;
}

interface ExerciseForm {
    id: string;
    exerciseName: string;
    sets: SetForm[];
}

interface RoutineTemplate {
    _id: string;
    routineName: string;
    splitType: string;
    exercises: { exerciseName: string; sets: number }[];
}

// --- Yardımcılar ---

// Listelerde stabil key için benzersiz id (crypto.randomUUID yalnızca güvenli bağlamlarda vardır)
const makeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);

const createSet = (): SetForm => ({ id: makeId(), weight: "", reps: "" });
const createExercise = (): ExerciseForm => ({ id: makeId(), exerciseName: "", sets: [createSet()] });

/** localStorage'dan gelen (eski formatlı / bozuk olabilecek) veriyi forma uygun hale getirir. */
function normalizeExercises(raw: unknown): ExerciseForm[] {
    if (!Array.isArray(raw)) return [createExercise()];

    const result = raw
        .filter((ex) => ex && typeof ex === "object")
        .map((ex) => {
            const sets = Array.isArray(ex.sets) ? ex.sets : [];
            return {
                id: makeId(),
                exerciseName: typeof ex.exerciseName === "string" ? ex.exerciseName : "",
                sets: (sets.length > 0 ? sets : [{}]).map((s: Partial<SetForm>) => ({
                    id: makeId(),
                    weight: typeof s?.weight === "string" ? s.weight : "",
                    reps: typeof s?.reps === "string" ? s.reps : "",
                })),
            };
        });

    return result.length > 0 ? result : [createExercise()];
}

function isDefaultForm(splitType: string, exercises: ExerciseForm[]) {
    return (
        splitType === "Upper" &&
        exercises.length === 1 &&
        exercises[0].exerciseName === "" &&
        exercises[0].sets.length === 1 &&
        exercises[0].sets[0].weight === "" &&
        exercises[0].sets[0].reps === ""
    );
}

function loadDraft(): { splitType: string; exercises: ExerciseForm[] } {
    try {
        const saved = localStorage.getItem(DRAFT_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Eski format: doğrudan egzersiz dizisi
            const rawExercises = Array.isArray(parsed) ? parsed : parsed?.exercises;
            const splitType = !Array.isArray(parsed) && SPLIT_TYPES.includes(parsed?.splitType) ? parsed.splitType : "Upper";
            return { splitType, exercises: normalizeExercises(rawExercises) };
        }
    } catch {
        console.error("Taslak okunamadı");
    }
    return { splitType: "Upper", exercises: [createExercise()] };
}

function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_KEY);
    } catch {
        // yoksay
    }
}

function persistDraft(splitType: string, exercises: ExerciseForm[]) {
    try {
        if (isDefaultForm(splitType, exercises)) {
            localStorage.removeItem(DRAFT_KEY);
        } else {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({ splitType, exercises }));
        }
    } catch {
        // Depolama dolu/erişilemez olabilir; taslak kaydı kritik değildir
    }
}

/** Yalnızca tarayıcıda true döner; localStorage'a bağlı form SSR çıktısıyla uyuşmazlık yaratmasın diye. */
const useIsClient = () =>
    useSyncExternalStore(
        () => () => {},
        () => true,
        () => false
    );

// --- Sayfa ---

export default function NewWorkoutPage() {
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    return <WorkoutForm />;
}

function WorkoutForm() {
    // Taslak yalnızca ilk render'da bir kez okunur (bu bileşen sadece tarayıcıda mount edilir)
    const [initialDraft] = useState(loadDraft);

    const [splitType, setSplitType] = useState(initialDraft.splitType);
    const [exercises, setExercises] = useState<ExerciseForm[]>(initialDraft.exercises);

    // Veritabanından gelen listeler
    const [dbExercises, setDbExercises] = useState<{ _id: string; name: string }[]>([]);
    const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loadError, setLoadError] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingRoutine, setIsSavingRoutine] = useState(false);

    // Taslağı her tuş vuruşunda değil, yazma durunca kaydet (debounce)
    useEffect(() => {
        const save = () => persistDraft(splitType, exercises);
        const timer = setTimeout(save, DRAFT_DEBOUNCE_MS);
        const flush = () => {
            clearTimeout(timer);
            save();
        };
        // Sekme kapanırken/arka plana alınırken bekleyen değişiklik kaybolmasın
        window.addEventListener("pagehide", flush);
        return () => {
            clearTimeout(timer);
            window.removeEventListener("pagehide", flush);
        };
    }, [splitType, exercises]);

    // Egzersiz ve rutin listelerini çek
    useEffect(() => {
        const controller = new AbortController();

        const fetchInitialData = async () => {
            try {
                const [exRes, routRes] = await Promise.all([
                    fetch("/api/exercises", { signal: controller.signal }),
                    fetch("/api/routines", { signal: controller.signal }),
                ]);

                if (exRes.ok) setDbExercises(await exRes.json());
                if (routRes.ok) setRoutines(await routRes.json());
                if (!exRes.ok || !routRes.ok) setLoadError(true);
            } catch (error) {
                if ((error as Error).name === "AbortError") return;
                console.error("Veriler çekilemedi", error);
                setLoadError(true);
            } finally {
                if (!controller.signal.aborted) setIsLoadingData(false);
            }
        };

        fetchInitialData();
        return () => controller.abort();
    }, []);

    // --- ŞABLON (ROUTINE) İŞLEMLERİ ---

    const loadRoutine = (routine: RoutineTemplate) => {
        const confirmLoad = window.confirm(`"${routine.routineName}" şablonunu yüklemek mevcut formu temizleyecektir. Onaylıyor musunuz?`);
        if (!confirmLoad) return;

        setSplitType(routine.splitType);
        // Her set için ayrı nesne (aynı referansın tüm slotlara kopyalanması önlenir)
        setExercises(
            routine.exercises.map((ex) => ({
                id: makeId(),
                exerciseName: ex.exerciseName,
                sets: Array.from({ length: ex.sets }, createSet),
            }))
        );
    };

    const saveAsRoutine = async () => {
        const namedExercises = exercises.filter((ex) => ex.exerciseName.trim() !== "");
        if (namedExercises.length === 0) {
            toast.error("Boş bir formu şablon olarak kaydedemezsiniz!");
            return;
        }

        const routineName = window.prompt("Şablonunuz için bir isim girin (Örn: Push - Güç Günü):")?.trim();
        if (!routineName) return;

        setIsSavingRoutine(true);

        try {
            const res = await fetch("/api/routines", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    routineName,
                    splitType,
                    exercises: namedExercises.map((ex) => ({
                        exerciseName: ex.exerciseName.trim(),
                        sets: ex.sets.length, // Sadece set sayısını alıyoruz
                    })),
                }),
            });

            if (res.ok) {
                const newRoutine: RoutineTemplate = await res.json();
                setRoutines((prev) => [newRoutine, ...prev]); // Listeye anında ekle
                toast.success("Şablon başarıyla kaydedildi!");
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.error ?? "Şablon kaydedilirken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Sunucuya bağlanılamadı.");
        } finally {
            setIsSavingRoutine(false);
        }
    };

    // --- FORM İŞLEMLERİ (hepsi immutable, id tabanlı) ---

    const addExercise = () => setExercises((prev) => [...prev, createExercise()]);

    const removeExercise = (exerciseId: string) =>
        setExercises((prev) => {
            const next = prev.filter((ex) => ex.id !== exerciseId);
            return next.length === 0 ? [createExercise()] : next;
        });

    const updateExerciseName = (exerciseId: string, value: string) =>
        setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, exerciseName: value } : ex)));

    const addSet = (exerciseId: string) =>
        setExercises((prev) => prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: [...ex.sets, createSet()] } : ex)));

    const removeSet = (exerciseId: string, setId: string) =>
        setExercises((prev) =>
            prev.map((ex) => (ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex))
        );

    const updateSet = (exerciseId: string, setId: string, field: "weight" | "reps", value: string) =>
        setExercises((prev) =>
            prev.map((ex) =>
                ex.id === exerciseId
                    ? { ...ex, sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)) }
                    : ex
            )
        );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            splitType,
            exercises: exercises
                .map((ex) => ({
                    exerciseName: ex.exerciseName.trim(),
                    sets: ex.sets
                        .map((set) => ({ weight: Number(set.weight), reps: Number(set.reps) }))
                        .filter((set) => set.weight > 0 && set.reps > 0), // Boş setleri engelle
                }))
                .filter((ex) => ex.exerciseName !== "" && ex.sets.length > 0),
        };

        if (payload.exercises.length === 0) {
            toast.error("Kaydedilecek geçerli bir egzersiz/set bulunamadı.");
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch("/api/workouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                toast.success("Antrenman başarıyla kaydedildi!");
                // Taslağı hemen sil (debounce beklenmesin), sonra formu sıfırla
                clearDraft();
                setExercises([createExercise()]);
                setSplitType("Upper");
            } else {
                const err = await res.json().catch(() => null);
                toast.error(err?.error ?? "Kaydedilirken bir hata oluştu.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Sunucuya bağlanılamadı.");
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

                {isLoadingData ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Yükleniyor...
                    </div>
                ) : routines.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                        Henüz kaydedilmiş bir şablonunuz yok. Antrenman formunu doldurup &quot;Şablon Yap&quot; butonunu kullanabilirsiniz.
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
                                <span className="text-xs text-gray-500 mt-1">
                                    {routine.splitType} • {routine.exercises.length} Hareket
                                </span>
                            </button>
                        ))}
                    </div>
                )}

                {loadError && !isLoadingData && (
                    <p className="mt-2 text-sm text-red-500">Şablonlar veya egzersiz listesi yüklenemedi. Sayfayı yenilemeyi deneyin.</p>
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

                {/* Tüm egzersiz girişleri aynı öneri listesini paylaşır */}
                <datalist id="exercise-suggestions">
                    {dbExercises.map((dbEx) => (
                        <option key={dbEx._id} value={dbEx.name} />
                    ))}
                </datalist>

                {/* Egzersiz Listesi */}
                {exercises.map((exercise) => (
                    <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        isLoadingExercises={isLoadingData}
                        onNameChange={updateExerciseName}
                        onRemove={removeExercise}
                        onAddSet={addSet}
                        onRemoveSet={removeSet}
                        onUpdateSet={updateSet}
                    />
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
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Kaydediliyor...
                            </>
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

// --- Egzersiz kartı: yalnızca kendi verisi değişince yeniden render olur ---

interface ExerciseCardProps {
    exercise: ExerciseForm;
    isLoadingExercises: boolean;
    onNameChange: (exerciseId: string, value: string) => void;
    onRemove: (exerciseId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onRemoveSet: (exerciseId: string, setId: string) => void;
    onUpdateSet: (exerciseId: string, setId: string, field: "weight" | "reps", value: string) => void;
}

function ExerciseCard({ exercise, isLoadingExercises, onNameChange, onRemove, onAddSet, onRemoveSet, onUpdateSet }: ExerciseCardProps) {
    return (
        <div className="bg-white dark:bg-gray-800 p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <div className="w-full relative">
                    <input
                        type="text"
                        list="exercise-suggestions"
                        value={exercise.exerciseName}
                        onChange={(e) => onNameChange(exercise.id, e.target.value)}
                        placeholder={isLoadingExercises ? "Yükleniyor..." : "Egzersiz seçin veya yazın..."}
                        maxLength={80}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 outline-none font-semibold transition-all"
                        required
                    />
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(exercise.id)}
                    className="ml-3 p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    aria-label="Egzersizi sil"
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
                    <div key={set.id} className="grid grid-cols-12 gap-2 items-center group">
                        <div className="col-span-2 text-center text-sm font-bold text-gray-400 group-hover:text-blue-500 transition-colors">
                            {setIndex + 1}
                        </div>
                        <div className="col-span-4">
                            <input
                                type="number"
                                value={set.weight}
                                onChange={(e) => onUpdateSet(exercise.id, set.id, "weight", e.target.value)}
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
                                onChange={(e) => onUpdateSet(exercise.id, set.id, "reps", e.target.value)}
                                placeholder="0"
                                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 text-center text-gray-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                                min="1"
                            />
                        </div>
                        <div className="col-span-2 flex justify-center">
                            <button
                                type="button"
                                onClick={() => onRemoveSet(exercise.id, set.id)}
                                className="p-2 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"
                                disabled={exercise.sets.length === 1}
                                aria-label="Seti sil"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onAddSet(exercise.id)}
                className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 rounded-xl font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-4 h-4" /> Yeni Set
            </button>
        </div>
    );
}
