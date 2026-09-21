// AI'a gönderilecek yapılandırılmış verinin tip tanımlaması
export interface ExercisePerformanceData {
    exerciseName: string;
    muscleGroup: string;
    currentPerformance: { weight: number; reps: number; isPR: boolean }[];
    previousBest: { weight: number; reps: number } | null;
}

export interface AITrainingContext {
    splitType: string;
    totalVolume: number;
    previousWorkoutVolume: number | null;
    volumeChangePercentage: number | null;
    weightData: {
        currentWeight: number | null;
        weeklyChange: number | null; // Örn: +0.6 (kg)
    };
    muscleGroupVolumes: Record<string, { current: number; changePercentage: number }>;
    exercises: ExercisePerformanceData[];
}

/**
 * AI'ın davranış kurallarını belirleyen değişmez (static) sistem mesajı.
 */
export const FITNESS_COACH_SYSTEM_PROMPT = `
Sen elit bir AI Fitness Koçu ve Veri Analistisin. Amacın, sana JSON formatında iletilen güncel antrenman, volume (hacim) ve vücut ağırlığı verilerini analiz ederek kullanıcıya veriye dayalı, kısa ve net bir gelişim raporu sunmaktır.

KESİN KURALLAR:
1. HALÜSİNASYON YASAK: Sadece sana gönderilen JSON verisindeki metrikleri kullan. Veride olmayan hiçbir egzersiz, kilo veya volume değişiminden bahsetme.
2. BAĞLANTI KUR: Kullanıcının günlük/haftalık kilo değişimi ile antrenman performansı (özellikle güç artışı) arasında mantıksal bağlantılar kur.
3. PROGRESSIVE OVERLOAD: Eğer kullanıcı bir egzersizde önceki antrenmanına göre ağırlık veya tekrar artışı sağlamışsa bunu vurgula. Hedef tekrarlara (örn: aynı kiloda yüksek tekrar) ulaşılmışsa bir sonraki antrenman için ağırlık artırma önerisinde bulun.
4. VOLUME ANALİZİ: Kas grubu bazlı volume değişimlerini yorumla. Düşüş varsa sebebini sorgula, artış varsa hipertrofi için pozitif olduğunu belirt.
5. FORMAT: Yanıtını Markdown formatında, okunabilir paragraflar ve kısa madde imleri ile yapılandır.
`;

/**
 * Backend'den toplanan verileri LLM'in işleyebileceği bir metin/JSON formatına çevirir.
 */
export function buildWorkoutAnalysisPrompt(contextData: AITrainingContext): string {
    // AI'ın anlamlandırmasını kolaylaştırmak için veriyi temiz bir JSON string'ine çeviriyoruz
    // JSON.stringify kullanımı, doğal dilde uzun uzun yazmaktan daha az token harcar
    const structuredData = JSON.stringify(contextData, null, 2);

    return `
Kullanıcının son antrenman ve kilo verileri aşağıda yapılandırılmış JSON formatında sunulmuştur. Bu verileri analiz ederek antrenman performansını yorumla ve progressive overload önerileri sun.

<workout_data>
${structuredData}
</workout_data>

Lütfen raporunu oluştur:
1. Kilo ve performans ilişkisine değin.
2. Hacim (volume) trendlerini değerlendir.
3. Egzersiz bazlı progressive overload durumunu açıkla ve sonraki adım için tavsiye ver.
  `;
}