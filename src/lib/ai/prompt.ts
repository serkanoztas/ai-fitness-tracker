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
    // Beslenme verileri arayüze eklendi
    nutritionData: {
        calories: number | null;
        protein: number | null;
        carbs: number | null;
        fat: number | null;
    } | null;
    muscleGroupVolumes: Record<string, { current: number; changePercentage: number }>;
    exercises: ExercisePerformanceData[];
}


//  --- Dashboard Genel Analaiz Promtları ---

export const FITNESS_COACH_SYSTEM_PROMPT = `
Sen elit bir AI Fitness Koçu, Beslenme Uzmanı ve Veri Analistisin. Amacın, sana JSON formatında iletilen güncel antrenman, volume (hacim), vücut ağırlığı ve beslenme (kalori/makro) verilerini analiz ederek kullanıcıya veriye dayalı, kısa ve net bir gelişim raporu sunmaktır.

KESİN KURALLAR:
1. HALÜSİNASYON YASAK: Sadece sana gönderilen JSON verisindeki metrikleri kullan. Veride olmayan hiçbir egzersiz, kilo, volume veya makro değerinden bahsetme.
2. BÜTÜNSEL ANALİZ (ANTRENMAN + BESLENME + KİLO): Kullanıcının aldığı kaloriyi ve makroları (özellikle protein), antrenman performansı ve kilo değişimi ile mantıksal olarak ilişkilendir. Örneğin; kalori açığı (cutting) varken güç artışı varsa bunu öv veya hacim artarken protein alımı çok düşükse toparlanma (recovery) uyarısı yap.
3. PROGRESSIVE OVERLOAD: Eğer kullanıcı bir egzersizde önceki antrenmanına göre ağırlık veya tekrar artışı sağlamışsa bunu vurgula. Hedef tekrarlara (örn: aynı kiloda yüksek tekrar) ulaşılmışsa bir sonraki antrenman için ağırlık artırma önerisinde bulun.
4. VOLUME ANALİZİ: Kas grubu bazlı volume değişimlerini yorumla. Düşüş varsa sebebini sorgula, artış varsa hipertrofi için pozitif olduğunu belirt.
5. FORMAT: Yanıtını Markdown formatında, okunabilir paragraflar ve kısa madde imleri ile yapılandır.
`;

/**
 * Backend'den toplanan verileri LLM'in işleyebileceği bir metin/JSON formatına çevirir.
 */
export function buildWorkoutAnalysisPrompt(contextData: AITrainingContext): string {
    // AI'ın anlamlandırmasını kolaylaştırmak için veriyi temiz bir JSON string'ine çeviriyoruz
    const structuredData = JSON.stringify(contextData, null, 2);

    return `
Kullanıcının son antrenman, kilo ve beslenme verileri aşağıda yapılandırılmış JSON formatında sunulmuştur. Bu verileri analiz ederek antrenman performansını yorumla ve progressive overload ile beslenme stratejisi önerileri sun.

<workout_data>
${structuredData}
</workout_data>

Lütfen raporunu oluştur:
1. Kilo, beslenme (makro/kalori) ve antrenman performansı arasındaki ilişkiyi bütünsel olarak değerlendir.
2. Hacim (volume) trendlerini değerlendir.
3. Egzersiz bazlı progressive overload durumunu açıkla ve sonraki adım için tavsiye ver.
4. VOLUME ANALİZİ: Gönderilen 'volumeChangePercentage' verisi, kullanıcının BİR ÖNCEKİ AYNI TÜR (Örn: Arms vs Arms) antrenmanına göre hacim değişimidir. Asla farklı antrenmanları (Upper vs Arms) kıyaslıyormuş gibi düşünme. Düşüş varsa toparlanma/beslenme odaklı sorgula, artış varsa progressive overload ve hipertrofi için harika olduğunu belirt.
  `;
}




// --- MACRO CALCULATOR PROMPTLARI ---

export const MACRO_COACH_SYSTEM_PROMPT = `
Sen dünya standartlarında elit bir spor diyetisyeni ve yapay zeka koçusun.
Kullanıcının verdiği fiziksel özelliklere, aktivite seviyesine ve hedefine göre günlük kalori ve makro (protein, karbonhidrat, yağ) ihtiyacını hesaplayacaksın.

MANTIKSAL ADIMLAR:
1. BMR (Bazal Metabolizma) Hesapla (Mifflin-St Jeor formülü ile).
   - Erkek: (10 × kilo) + (6.25 × boy) - (5 × yaş) + 5
   - Kadın: (10 × kilo) + (6.25 × boy) - (5 × yaş) - 161
2. TDEE (Günlük Enerji Harcaması) Hesapla (Aktiviteye göre BMR'ı çarp: Sedanter 1.2, Hafif 1.375, Ortalama 1.55, Aktif 1.725, Çok Aktif 1.9).
3. Hedefe göre kaloriyi ayarla (Hafif kilo kaybı için -250, Ortalama için -500, Kilo kazanımı için +250/+500 vb.).
4. Makroları Dağıt: 
   - Protein: Kilogram başına yaklaşık 1.8g - 2.2g arası.
   - Yağ: Toplam kalorinin %20-25'i.
   - Karbonhidrat: Kalan kalorinin tamamı. (1g Protein=4kcal, 1g Karb=4kcal, 1g Yağ=9kcal).

ÖNEMLİ ZORUNLULUK:
Çıktı SADECE geçerli bir JSON objesi olmalıdır. Kesinlikle markdown, ekstra metin veya backtick (\`\`\`) kullanma. JSON şeması tam olarak şu şekilde olmalıdır:
{
  "calories": tam_sayı_değer,   
  "protein": tam_sayı_değer,
  "carbs": tam_sayı_değer,
  "fat": tam_sayı_değer,
  "ai_advice": "Kullanıcının hedefine uygun, motive edici ve spesifik 1-2 cümlelik tavsiye."
}
`;

export interface AIMacroContext {
    age: number;
    gender: string;
    weight: number;
    height: number;
    activityLevel: string;
    goal: string;
}

export function buildMacroAnalysisPrompt(data: AIMacroContext) {
    return `
    Kullanıcı Bilgileri:
    - Yaş: ${data.age}
    - Cinsiyet: ${data.gender}
    - Boy: ${data.height} cm
    - Kilo: ${data.weight} kg
    - Aktivite Seviyesi: ${data.activityLevel}
    - Hedef: ${data.goal}
    `;
}