# 🏋️‍♂️ AI-Powered Fitness & Nutrition Tracker

Kişisel antrenman hacminizi (progressive overload), günlük makro/kalori tüketiminizi ve vücut ağırlığınızı takip edebileceğiniz; **Google Gemini AI** destekli akıllı bir vücut geliştirme asistanı.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-AI-blue?logo=google)

## 📸 Ekran Görüntüleri

*(Projenin arayüzüne ait görseller)*

<div align="center">
  <img src="screenshots/aifitness3.png" alt="Dashboard Görünümü" width="400" />
  <img src="screenshots/aifitness4.png" alt="Antrenman Ekleme" width="400" />
  <br/>
  <img src="screenshots/aifitness7.png" alt="Antrenman Geçmişi" width="400" />
  <img src="screenshots/aifitness5.png" alt="Beslenme Takibi" width="400" />
  <br/>
  <img src="screenshots/aifitness6.png" alt="Kilo Takibi" width="400" />
</div>

## ✨ Özellikler

- **🤖 Yapay Zeka Koçu:** Son antrenmanlarınızı ve beslenmenizi analiz ederek kas gelişimi, progressive overload ve toparlanma hakkında Gemini AI destekli özel raporlar sunar (Aynı bölge antrenmanlarını kıyaslama mantığıyla çalışır).
- **📊 Gelişmiş Dashboard:** Recharts entegrasyonu ile antrenman hacmi (volume) trendlerinizi grafiksel olarak izleyin.
- **🥩 Beslenme ve Makro Takibi:** Günlük kalori, protein, karbonhidrat ve yağ alımlarınızı kaydedin ve görselleştirin.
- **🏋️‍♂️ Antrenman Günlüğü:** Egzersizleri, setleri, tekrarları ve ağırlıkları kaydedin. Kişisel rekorlarınızı (PR) takip edin.
- **🔐 Güvenli Altyapı:** NextAuth ile kullanıcı doğrulama ve veritabanında (MongoDB) kullanıcıya özel izole veri yönetimi.

## 🛠️ Kullanılan Teknolojiler

- **Frontend:** Next.js (App Router), React, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** Next.js API Routes, Node.js
- **Veritabanı:** MongoDB (Mongoose)
- **Yapay Zeka:** Google Generative AI (Gemini 3.5 / 2.5 Flash Lite)
- **Kimlik Doğrulama:** NextAuth.js (Bcrypt şifreleme)

## 🚀 Kurulum (Local Development)

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

**1. Repoyu klonlayın:**
\`\`\`bash
git clone https://github.com/serkanoztas/ai-fitness-tracker.git
cd ai-fitness-tracker
\`\`\`

**2. Bağımlılıkları yükleyin:**
\`\`\`bash
npm install
\`\`\`

**3. Çevre Değişkenlerini (Environment Variables) ayarlayın:**
Ana dizinde bir `.env.local` dosyası oluşturun ve aşağıdaki bilgileri kendi verilerinizle doldurun:
\`\`\`env
MONGODB_URI=mongodb+srv://<kullanici_adi>:<sifre>@cluster.mongodb.net/fitnessApp
NEXTAUTH_SECRET=kendi_belirledigin_guvenlik_sifresi
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=google_gemini_api_anahtarin
\`\`\`

**4. Geliştirme sunucusunu başlatın:**
\`\`\`bash
npm run dev
\`\`\`
Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine giderek uygulamayı görüntüleyebilirsiniz.

## 🌍 Canlı Yayın (Deploy)
Bu proje [Vercel](https://vercel.com/) üzerinde yayına alınmak üzere optimize edilmiştir. Vercel paneli üzerinden GitHub reponuzu bağlayıp ortam değişkenlerini (Environment Variables) girerek tek tıkla yayına alabilirsiniz.