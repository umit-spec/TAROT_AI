# TAROT AI MVP v1.0 — Final Plan (8.8/10)

## Ön Söz

Plan 8.8/10 seviyesine çıkarıldı. 3 kritik katman eklendi:
- **Persona Engine** (kullanıcı tipi tanımlama)
- **Memory & Journal** (reflection ve continuity)
- **Asset Constitution** (görsel tutarlılığı garantileyen anayasa)

Mimari, "Tarot"dan öte, **Insight Engine** olarak tasarlanmıştır. Tarot ilk modül, sonradan rüya analizi, journaling, vb. eklenebilir.

**Yeniden başlama ilkesi:**
> Kullanıcı 22 kartlık kontrollü bir deneyimden aldığı yorumu gerçekten kişisel, güvenli ve tekrar kullanmaya değer buluyor mu?

Bu cevap güçlü "evet" olmadan, 78 kart, tam abonelik, ayrı backend ve monorepo kurulmamalı.

---

## MVP Kapsamı (Kesin)

### Dahil
- Türkçe
- 22 Büyük Arkana kartı (düz anlamlar)
- 3 Kart Genel Açılım
- 5 Kart İlişki Açılımı
- Misafir olarak ilk okuma
- Basit sonuç kaydetme (magic link/Google)
- Premium talep ve fiyat niyeti
- Okuma fayda puanı
- Temel analytics
- Deterministic + AI hibrid reading

### Dışında
- 56 Küçük Arkana kartı
- Ters kartlar
- 78 kartlık grid UX
- Drag-and-drop
- Tam Stripe abonelik
- Sınırsız okuma
- Kendi özel auth sistemi
- Ayrı Express backend
- Admin paneli
- Çok dillilik
- Custom spread
- Sosyal özellikler

---

## Teknik Stack (Güncel)

```
Frontend:        Next.js 16 + React 19 + App Router
Styling:         Tailwind CSS + CSS Modules
Database:        PostgreSQL
ORM:             Drizzle
Auth:            Auth.js (NextAuth v5)
Validation:      Zod
API:             Route Handlers + Server Actions
Testing:         Vitest + React Testing Library + Playwright
Build:           pnpm
Deployment:      Vercel
Analytics:       Custom event logging (Posthog ya da simple)
```

**Başlangıçta tek Next.js app.** Modül sınırları net. Backend ayrıştırması, ürün doğrulanınca yapılır.

---

## Revize 10 Aşama

### Aşama 1: Ürünün Anayasası — 10 Kurucu Belge

**Net Hedef:**
Tüm sonraki geliştirme kararlarına referans olacak ürün anayasasını oluştur. Bu belge daha sonra hiç değiştirilmez; ürünü korur.

**Kullanıcı Değeri:**
Tutarlı, öngörülebilir, etik bir deneyim.

**Yatırımcı Değeri:**
Ölçümlenebilir hedefler, hukuki uyum, ölçeklenebilir mimari.

**Kapsama Dahil:**

1. **Product Vision** — Neden var oluyoruz? 5-10 yıl ufkunda.
   
2. **Product Principles** — Hangi değerler taşıyoruz? (e.g., Transparency, Empowerment, Non-Harm, Scalability)

3. **Non-Negotiable Rules** — MVP'de asla yapılmayacak şeyler.
   - Hiçbir "kesin kehanet"
   - Sağlık/finansal tavsiye yok
   - Kültürel asimilasyon yok
   - Addiction loop tasarımı yok

4. **Success Metrics** — 10 KPI (Aşama 10'da ölçülecek)
   - Reading completion rate
   - Helpfulness score
   - Premium intent rate
   - etc.

5. **Ethical Constitution** — Etik kırmızı çizgiler + müdahale protokolü
   - Crisis (intihar, şiddet, sağlık) → Human referral
   - Sağlık, hukuk, finansal → Disclaimer
   - Manipulation → Blocked

6. **Persona Definitions** — 5 kullanıcı tipi + her biri için okuma tarzı
   - First-time tarot user (eğitsel, açıklamacı)
   - Regular practitioner (derinlik, sembolik)
   - Highly anxious (üstü kapalı, empovrmentli)
   - Decision-maker (action-oriented, clarity)
   - Curious skeptic (bilimsel, psikolojik frame)

7. **Visual Constitution** — TAROT_VISUAL_CONSTITUTION.md
   - Işık yönü, kamera açısı, sembol dili, renk kuralları
   - Yüz anatomisi, kıyafet dili, çerçeve sistemi
   - Negatif promptlar, seed tracking, kalite rubric'i
   (Kart üretimine başlamadan önce *bu* belge kesinleşmelidir)

8. **Reading Constitution** — Okuma nasıl üretilir?
   - Deterministic layer (kontrollü anlamlar)
   - Synthesis layer (tema desenleri)
   - AI language layer (doğal Türkçe)
   - Validation schema (Zod)

9. **Technical Constitution** — Teknik mimari prensipleri
   - Single Next.js app (Insight Engine core)
   - Modular design (Tarot modul, sonradan Dream Analysis, vb.)
   - Rate limiting (bağımlılık kontrolü)
   - GDPR-compliant data handling

10. **MVP Exit Criteria** — Aşama 10'da ne başarılı sayılır?
    - Completion rate >70%
    - Helpfulness >2.0/3.0
    - Premium interest >10%
    - No security breaches
    - No addiction signals

**Oluşturulacak Dosyalar:**
```
docs/
├── 01-PRODUCT_VISION.md
├── 02-PRODUCT_PRINCIPLES.md
├── 03-NON_NEGOTIABLE_RULES.md
├── 04-SUCCESS_METRICS.md
├── 05-ETHICAL_CONSTITUTION.md
├── 06-PERSONA_DEFINITIONS.md
├── 07-VISUAL_CONSTITUTION.md
├── 08-READING_CONSTITUTION.md
├── 09-TECHNICAL_CONSTITUTION.md
├── 10-MVP_EXIT_CRITERIA.md
└── ANALYTICS_SCHEMA.json
```

**Testler:**
- PRD'nin stakeholder tarafından onayı
- Metrik tanımlarının spesifik olup olmadığı kontrolü

**Risk ve Red Team:**
- Hangi metrik "kullanıcı memnuniyetini" gerçekten ölçüyor?
- Hangi davranış bağımlılık sinyali veriyor?
- Hangi okuma sonucu danışman müdahalesi gerekli?

**Geçiş Kriteri:**
- ✅ PRD final ve onaylı
- ✅ 10 metrik tanımlı
- ✅ Etik red lines yazılı
- ✅ Test protokolü hazırlanmış
- ✅ Analytics schema tamamlanmış

---

### Aşama 2: Mobil Kullanıcı Akışı ve Tıklanabilir Wireframe (+ Persona Engine)

**Net Hedef:**
Kullanıcının 2 dakikada ilk okumayı tamamlayabileceği akışı tasarla. **Persona Engine katmanını dahil et.**

**Akış:**
```
Landing (değer gösterim)
  ↓
Konu Seçimi (4 seçenek: İlişki, Kariyer, Ruh Hali, Genel)
  ↓
PERSONA ENGINE (Yeni katman!)
  → "İlk kez tarot mı?"
  → "Kaygılı mı, karar-verici mi, merak eden mi?"
  → Persona tanımlandı: First-time + Anxious → okumalar "eğitsel, üstü kapalı" üslupla sunulacak
  ↓
3–5 Dinamik Soru (konuya göre)
  ↓
Sistem Açılım Önerisi (3-Kart mi 5-Kart mı?)
  ↓
Kapalı Deste Görseli (tüm kart arka yüzü)
  ↓
Dokunarak Seçim (3 veya 5 kart pozisyonu)
  ↓
Shuffle Animasyonu (1-2 sn)
  ↓
Kartlar Sırayla Açılır + Anlam (Persona-uyumlu dil)
  ↓
Okuma Özeti
  ↓
"Fayda puanı: Buna ihtiyaç duymadım / Kısmen yardımcı / Çok yardımcı oldu"
  ↓
"1 hafta sonra bunu not ettiniz mi? Yorum ekleyin." (Memory katmanı)
  ↓
Sonucu Kaydet mi? (Magic link / Google ile)
  ↓
Premium Teklif (modal, basit)
```

**Persona Engine Tanımları:**
```
1. First-time tarot user (beginner)
   → Okuma tarzı: Eğitsel, her kartı açıklayan
   → Ses tonu: Rahatlatıcı, ciddiyetini saygılı ama sıcak

2. Regular practitioner (experienced)
   → Okuma tarzı: Derinlik, sembolik, çok katmanlı
   → Ses tonu: Profesyonel, introspektif

3. Highly anxious user (needs reassurance)
   → Okuma tarzı: Üstü kapalı, empovrmentli, olumlu
   → Ses tonu: Empatik, güven verici, seçim hakkı vurgulayan

4. Decision-maker (action-oriented)
   → Okuma tarzı: Açık, spesifik, action-ready
   → Ses tonu: Direktif, net, clarity-focused

5. Curious skeptic (analytical)
   → Okuma tarzı: Psikolojik frame, verilere dayalı
   → Ses tonu: Bilimsel, saygılı şüphecilik
```

**Kullanıcı Değeri:**
Hızlı, açık, korkutucu olmayan bir deneyim.

**Yatırımcı Değeri:**
Completion rate, time-to-reading, helpfulness score ölçümü.

**Kapsama Dahil:**
- Tüm ekran wireframe'i (Figma ya da SVG)
- Ekran başı user story
- Mobil breakpoint (375px, 768px)
- Dark mode color palette (yukarıda tanımlı)
- Typography hierarchy
- Tap target sizes (minimum 44px)
- Empty states ve loading states

**Kapsam Dışı:**
- Interactive prototype
- Visual asset (kartlar, ikon)

**Teknik Karar:**
- Wireframe format: Figma (paylaşılabilir) veya SVG (code-friendly)
- Dark mode default (opsiyonel light mode)
- Responsive CSS grid / flexbox plannı

**Oluşturulacak Dosyalar:**
```
design/WIREFRAMES.md
design/SCREENS/
  - landing.svg
  - topic-selection.svg
  - questions.svg
  - card-selection.svg
  - reading-display.svg
  - result-confirmation.svg
  - premium-modal.svg
design/COLOR_PALETTE.md
design/TYPOGRAPHY.md
design/COMPONENT_SPEC.md
```

**Testler:**
- Wireframe'i 3 test kullanıcı ile kontrol et (mobil fiziksel cihazda)
- 2 dakika timing kriterine ulaşıp ulaşmadığını ölçü

**Risk ve Red Team:**
- Kapalı deste görseli gerçekten bir grid yerine geçer mi?
- Dinamik sorular çok mu karmaşık?
- Premium modal agresif mi görünüyor?

**Geçiş Kriteri:**
- ✅ Tüm ekranlar wireframe'lenmemiş
- ✅ 2 dakika timing doğrulandı
- ✅ Test kullanıcı feedback'i alındı
- ✅ Design spec finalize edildi

---

### Aşama 3: Design System ve 3 Temel Ekran Prototipi

**Net Hedef:**
Premium hissi veren, erişilebilir bir visual language oluştur.

**Kullanıcı Değeri:**
Güven, göz yorulmama, okunabilirlik.

**Yatırımcı Değeri:**
Tarot kategori standartlarından ayrışan bir görsel kimlik.

**Kapsama Dahil:**
- Renk sistemi (semantic tokens)
- Typography scale
- Spacing system (4px grid)
- Component library (Button, Card, Modal, Input, etc.)
- Icon set (Feather Icons + custom)
- Animation principles (subtle, <300ms)
- 3 temel ekranın HTML/Figma prototipi
  - Landing
  - Card Reveal
  - Premium Modal

**Kapsam Dışı:**
- Kart görselleri
- Full application implementation

**Teknik Karar:**
- Tailwind CSS config (custom colors, spacing)
- CSS Modules ya da Tailwind?
  → **Tailwind sadece** (basitlik)
- Font: Inter (sans) + Playfair Display (serif başlıklar)
- Dark mode: `prefers-color-scheme: dark` + manual toggle

**Oluşturulacak Dosyalar:**
```
src/styles/
  - globals.css (reset, base)
  - tailwind.config.ts (colors, spacing, fonts)
  - animations.css (transition, fade, reveal)

src/components/
  - Button.tsx
  - Card.tsx
  - Modal.tsx
  - Input.tsx
  - Badge.tsx
  - Skeleton.tsx

design/
  - DESIGN_SYSTEM.md
  - PROTOTYPES/
    - landing.html
    - card-reveal.html
    - premium-modal.html
```

**Testler:**
- Lighthouse score >90 (performance, accessibility)
- WCAG AA compliance (color contrast, keyboard navigation)
- 3 prototype'ı real device'ta test et (iPhone 12, Samsung Galaxy A20)

**Risk ve Red Team:**
- Koyu tema gerçekten premium hissettiriyor mu?
- Animasyon çok mu fazla, çok mu az?
- Premium modal escape route'ları net mi?
- Yazı boyutları mobilde okunabilir mi?

**Geçiş Kriteri:**
- ✅ Tailwind config finalize edildi
- ✅ 7 temel component hazır
- ✅ 3 prototype interaktif ve mobile-tested
- ✅ Lighthouse >90, WCAG AA passed
- ✅ Design token dokumentasyonu tamamlandı

---

### Aşama 4: Visual Constitution + 22 Büyük Arkana Batch Üretim

**Net Hedef:**
Tutarlı, sembolik, premium bir 22 kart deck oluştur. **Aşama 3'ten TAROT_VISUAL_CONSTITUTION.md alınıp, kart üretimini rehberleyen detaylı rehber olmalı.**

**Kullanıcı Değeri:**
Güzel, kişisel, "bana özel" hissettiren—VE birbirine ait hissi veren kartlar.

**Yatırımcı Değeri:**
Ürün farklılaşması, paylaşılabilir aset (sosyal, PR), tekrarlanabilir üretim pipeline.

**KRITIK KURAL:**
Aşama 4'e başlamadan önce TAROT_VISUAL_CONSTITUTION.md **kesinleşmiş** olmalı. Bu belge olmadan kart üretimine başlanmaz. Bu belge, sırası gelmeli olan tüm 22 kartı yapılandırır.

**Kapsama Dahil:**
- **Aşama 3'ten gelen TAROT_VISUAL_CONSTITUTION.md**
  - Işık yönü, kamera açısı (sabit kalması için)
  - Sembol dili (tekrar eden motifler, anlam)
  - Renk paleti kuralları (harmony, palette gradients)
  - Yüz anatomisi kuralları (proportion, expression consistency)
  - Kıyafet dili (çağ ve sembolik tutarlılık)
  - Çerçeve sistem (border, yazı yerleşimi, ölçüler)
  - Negatif prompt sistemi (önlemek istediğimiz görsel hatalalar)
  - Seed ve parameter tracking (repro-ability)
  - Kalite rubric (consistency score 1-10)

- Batch generation script (seed + params ile)
- Kart tutarlılık rubric'i
- Mobil thumbnail readability test
- Lisans ve provenance kaydı (AI model, seed, date, approver)

**Kapsam Dışı:**
- Video prodüksiyonu (Aşama 5)
- Sound design (Aşama 5)
- Animasyon (Aşama 8)

**Teknik Karar:**
- Visual generation: Midjourney batch API ya da Stable Diffusion
- Seed tracking: JSON manifest (seed, params, version, approval_date)
- QA: Consistent color, anatomy, composition rubric
- Format: 512x768px PNG (mobil thumbnail), 2048x3072px full (print/share)
- Storage: Git LFS (binary versionning)

**Oluşturulacak Dosyalar:**
```
visual-assets/
  - VISUAL_CONSTITUTION.md
  - CARD_TEMPLATE.psd / Figma
  - SYMBOL_GLOSSARY.md
  - NEGATIVE_PROMPTS.txt
  - GENERATION_PARAMS.json
  - cards/
    - 00-fool.png (512x768)
    - 00-fool-hq.png (2048x3072)
    - [etc, 22 cards]
  - CARD_QA_RUBRIC.md
  - PROVENANCE.json

scripts/
  - generate-batch.py (API call, seed tracking)
  - qc-cards.py (consistency check)
```

**Testler:**
- Kart tutarlılık puanlaması >8/10
- Mobil thumbnail (375px) okunabilirlik test
- Seed yeniden çalıştırma sonucu aynı kartı üretip üretmediği

**Risk ve Red Team:**
- AI kartlar gerçekten güzel mi, bozuk anatomiye mi sahip?
- Tüm kartlar "aynı desteymiş" hissini veriyor mu?
- Başlık yazısı mobilde okunabilir mi?
- Telif hakkı riski var mı? (Seed tracking önemli)

**Geçiş Kriteri:**
- ✅ 22 kart final ve approved
- ✅ Tüm seed'ler ve params kaydedilmiş
- ✅ Mobil thumbnail test passed
- ✅ QA rubric >8/10 für all cards
- ✅ High-res ve web-res her kart için var

---

### Aşama 5: Tarot Bilgi Tabanı ve Etik Anlam Sistemi

**Net Hedef:**
Deterministic, etik, psikolojik bir kart anlamları sistemi oluştur. AI'nin kafasından üretmesi için değil, kontrollü bilgiye dayanması için.

**Kullanıcı Değeri:**
Tutarlı, kişisel, korumacı okumalar.

**Yatırımcı Değeri:**
Tekrarlanabilir, brand-uyumlu, hukuki risk azaltılmış reading.

**Kapsama Dahil:**
```json
{
  "cardId": "00-fool",
  "name_tr": "Aptal",
  "name_en": "The Fool",
  "arcana": "major",
  "number": 0,
  "symbolicMeaning": "Yeni başlangıç, macera, risk alma, bilinmeyene adım.",
  "psychologicalReflection": "Farkındalığımızda yerleşmiş sınırları aşma.",
  "keywords": ["başlangıç", "cesaret", "bilinmeyenlik"],
  
  "positionMeanings": {
    "past": "Geçişe hazırlık",
    "present": "Şu anda bir kararın eşiğindesiniz",
    "future": "Bir kapaı açılmaya hazır"
  },
  
  "contextualMeanings": {
    "relationship": "İlişkinin yeni evresine giriş",
    "career": "Kariyer değişikliği ya da yeni proje",
    "general": "Hayattaki bir dönüş noktası"
  },
  
  "reflectionQuestions": [
    "Neyi riske atmaya hazırsınız?",
    "Hangi inancınız sınırlayıcı olabilir?"
  ],
  
  "redFlags": {
    "avoid": ["kesin iş değişikliği", "garanti", "tehlike tahmini"],
    "instead": "Bu değişim size ne öğretebilir?"
  }
}
```

**Sistem:**
- Her kartın base meaning
- Pozisyon bağlamı (past, present, future, etc.)
- Konu bağlamı (relationship, career, mood, general)
- Psikolojik perspektif
- Reflection soruları
- Yasaklı yorum kalıpları

**Kapsama Dahil:**
- 22 kart için tam JSON şema
- Pozisyon ve konu matrisi
- Etik red lines (kesin kehanet yapılmayan konular)
- Danışman müdahale protokolü (sağlık, şiddet, intihar sinyali)
- Türkçe kalite kontrol

**Kapsam Dışı:**
- AI generation, sadece structured data

**Teknik Karar:**
- Format: JSON + TypeScript types
- Versioning: Git
- Collaboration: Spreadsheet template → JSON converter
- Validation: Zod schema check
- Localization ready: name_en, meaning_en fields (future)

**Oluşturulacak Dosyalar:**
```
data/
  - cards/
    - 00-fool.json
    - 01-magician.json
    - [... 22 cards]
  - positions.json (position meanings)
  - contexts.json (relationship, career, etc.)

src/types/
  - card.ts (TypeScript types)
  - reading.ts

data/ETHICS_GUIDELINES.md
scripts/
  - validate-cards.ts (Zod schema check)
```

**Testler:**
- JSON Zod schema validation
- Ethical red lines checklist (tüm kartlara karşı)
- Türkçe dilbilgisi ve yazım kontrolü
- Psikolojik uygunluk review (danışman)

**Risk ve Red Team:**
- Herhangi bir kart "kesin kehanet" yapacak şekilde yazılmış mı?
- Reflection soruları manipülatif mi?
- Kullanıcıyı korumacılık aşırı mı, aksi mi?
- Konu bağlamları yeterli mi kapsamlı?

**Geçiş Kriteri:**
- ✅ 22 kart JSON finalize edilmiş
- ✅ Tüm red lines passed
- ✅ Dilbilgisi kontrol yapılmış
- ✅ Danışman review tamamlandı
- ✅ TypeScript types ve validation çalışıyor

---

### Aşama 6: Intake Engine ve Spread Recommendation

**Net Hedef:**
Kullanıcıyı tanı. Dinamik sorularla tema çıkar. Doğru açılımı öner.

**Kullanıcı Değeri:**
Sorular bana "neden" sorduğu anlaşılıyor, okuma ilgili geliyor.

**Yatırımcı Değeri:**
Daha kişisel okumalar, daha yüksek fayda puanı.

**Kapsama Dahil:**
- Topic flow (4 seçenek)
- Dinamik soru sistemi (3–5 soru, konuya göre değişen)
- Soru cevaplarını context object'ine topla
- Spread recommendation logic (3-Kart mi 5-Kart mı?)
- UI: TopicSelector, QuestionFlow bileşenleri

**Örnek Akış:**

```
Topic: İlişki
  ↓ Q1: Mevcut ilişkiniz var mı?
    → Evet
      ↓ Q2: İletişimde sorun mu var?
        → Evet
          ↓ Q3: Bu sorunu çözmek mi istiyorsunuz, yoksa ilişkiyi sonlandırmak mı?
        → Hayır
          ↓ Q2b: Peki neyi öğrenmek istiyorsunuz?
  ↓ Recommendation: "5-Kart İlişki Açılımı sana perfect"
```

**Kapsam Dışı:**
- AI-driven recommendation (şimdilik hard-coded rules)

**Teknik Karar:**
- Question flow: JSON config ya da React state machine
  → **JSON config** (değiştirilebilir, test edilebilir)
- Spread recommendation: Rule engine (simple if-then)
- Storage: Context object (session state + optional save)

**Oluşturulacak Dosyalar:**
```
src/config/
  - questions.json (tüm soru akışı)
  - spread-recommendation.ts (rules engine)

src/components/
  - TopicSelector.tsx
  - QuestionFlow.tsx
  - SpreadRecommendation.tsx

src/types/
  - intake.ts

src/hooks/
  - useIntake.ts

data/
  - INTAKE_FLOWS.md (documentation)
```

**Testler:**
- Unit test soru flow'u (farklı cevap kombinasyonları)
- Recommendation logic test
- UI test (dokunabilir elementler, mobile)

**Risk ve Red Team:**
- Sorular çok mu direkt, çok mu ince?
- Soru sayısı (3–5) tutarlı mı?
- Recommendation her zaman doğru mu?
- Kullanıcı soruların sonra "niye sordum?" hissini yaşıyor mu?

**Geçiş Kriteri:**
- ✅ Soru flow'u finalize edilmiş
- ✅ Recommendation rules test passed
- ✅ UI/UX test kullanıcı feedback alındı
- ✅ 2 dakika timing korundu

---

### Aşama 7: Deterministic Reading Engine + AI Language Layer

**Net Hedef:**
Reading Engine 3 katmanda çalışıyor:
1. Deterministic Knowledge Layer (kontrollü anlamlar)
2. Synthesis Layer (kartlar arası bağlantılar)
3. AI Language Layer (doğal dil)

AI kart anlamını icat etmiyor; bizim controlled data'yı sentezliyor.

**Kullanıcı Değeri:**
Tutarlı, kişisel, korkutucu olmayan okumalar.

**Yatırımcı Değeri:**
Tekrarlanabilir kalite, brand uyumluluğu, hukuki risk azaltılması.

**Kapsama Dahil:**

**Layer 1: Deterministic**
```
Input: cardId, position, context, intakAnswers
  ↓
Lookup:
  - Card's symbolic meaning
  - Position meaning
  - Context-specific meaning
  - Reflection question
  - Forbidden interpretations
  
Output: structured data (JSON)
```

**Layer 2: Synthesis**
```
Input: [3 or 5 structured cards]
  ↓
Analyze:
  - Repeated themes
  - Contradictions
  - Narrative arc
  - Relationship to intake answers
  
Output: Patterns, insights (JSON)
```

**Layer 3: AI Language**
```
Input: Layer 1 + Layer 2 output + intake context
  ↓
Claude API:
  "Bana verilen kartlar: [JSON]
   Tema desenleri: [JSON]
   Kullanıcı bağlamı: [JSON]
   
   Lütfen bunu Türkçe, doğal, kişisel bir okumaya dönüştür.
   Asla yeni kart anlamı icat etme.
   Asla kesin kehanet yapma.
   JSON output: {...}"
  
Output: Natural language reading (Türkçe)
```

**Validation:**
Tüm output bu schema'dan geçmeli:
```typescript
type ReadingResult = {
  opening: string;
  cards: {
    cardId: string;
    position: string;
    symbolicMeaning: string;
    relevanceToQuestion: string;
    reflection: string;
  }[];
  patterns: string[];
  practicalReflection: string;
  uncertaintyNotice: string;
  safetyFlags: string[];
};
```

**Kapsama Dahil:**
- Deterministic layer (DB lookup)
- Synthesis engine (pattern matching)
- Claude API integration (prompt template)
- Output validation (Zod)
- Error handling ve fallback (API down → deterministic only)
- Rate limiting (ücretsiz: 1 okuma/saat)

**Kapsam Dışı:**
- Custom LLM fine-tuning

**Teknik Karar:**
- API: Claude Sonnet (speed/cost)
- Caching: Reading output cache (aynı kartlar = same reading)
- Retry: 3 attempts, exponential backoff
- Fallback: Deterministic-only okuma (AI offline)

**Oluşturulacak Dosyalar:**
```
src/services/
  - reading-engine.ts (main orchestrator)
  - deterministic-layer.ts (DB lookup)
  - synthesis-layer.ts (patterns)
  - claude-integration.ts (API call)
  - reading-validator.ts (Zod validation)

src/types/
  - reading.ts (ReadingResult schema)

lib/
  - prompts.ts (Claude system message)

tests/
  - reading-engine.test.ts
```

**Testler:**
- Unit test her layer (mock data)
- Integration test entire flow
- Claude API test (real call, sandbox)
- Schema validation test
- Ethical red lines test (prompt injection gibi)

**Risk ve Red Team:**
- Claude prompt'u injection'a açık mı?
- Kesin kehanet çıktısı verebilir mi?
- Deterministic layer'ı AI bypass edip yeni anlam uydurabilir mi?
- Rate limit yeterli mi? (bağımlılık riski)
- Cache timeout kaç saat?

**Geçiş Kriteri:**
- ✅ 3 layer test passed
- ✅ Tüm output Zod validated
- ✅ Ethical red lines passed
- ✅ Claude API cost/latency acceptable
- ✅ Fallback mode çalışıyor (deterministic-only)

---

### Aşama 8: Kart Seçimi, Reveal Animasyonu ve Sound DNA

**Net Hedef:**
Kapalı desteden seçim yap. Kartlar sırayla açılır. Ses ve visual harmony.

**Kullanıcı Değeri:**
Ritüelik hissiyat, meraklandırma, sakinleştirici tempo.

**Yatırımcı Değeri:**
Paylaşılabilir, ön izlemesi çekilebilir deneyim (Instagram, TikTok).

**Kapsama Dahil:**
- Kapalı deste görüntüsü (CSS, SVG, ya da static)
- Tap-to-select (3 veya 5 pozisyon)
- Selected position highlight
- Shuffle animation (CSS, 1-2 sn)
- Card reveal sequence (stagger, one-by-one)
- Reading display (card + meaning)
- Subtle sound design:
  - Tap sound (feedback, ~50ms)
  - Shuffle sound (ambient, loop)
  - Card flip sound (2x, once per reveal)
  - Transition ambience (fade-in reading)

**Kapsam Dışı:**
- Full music composition (nice-to-have future)

**Teknik Karar:**
- Animasyon: Framer Motion ya da CSS Animations
  → **CSS Animations** (performance, offline)
- Ses: Web Audio API (oscillator) ya da compressed audio files
  → **Compressed audio** (.mp3, 50-200KB, bitmapped)
- Shuffle state: Client-side random selection + server validation
- Reveal order: Database'de kaydedilir (audit trail)

**Oluşturulacak Dosyalar:**
```
src/components/
  - CardSelector.tsx (tap-to-select UI)
  - ShuffleAnimation.tsx
  - CardReveal.tsx
  - ReadingDisplay.tsx

src/styles/
  - animations.css (shuffle, reveal, fade)

public/audio/
  - tap.mp3
  - shuffle-loop.mp3
  - flip.mp3
  - transition.mp3

lib/
  - sound.ts (Web Audio API wrapper)
  - shuffle.ts (algorithm)

tests/
  - animations.test.tsx
```

**Testler:**
- Animation performance (60fps mobile)
- Sound volume / mute toggle
- Tap responsiveness
- Reveal timing (3-5 kartın reveal süresi)
- Accessibility (ARIA labels, keyboard navigation)

**Risk ve Red Team:**
- Animasyon çok mu fazla, mobilde janky olabilir mi?
- Ses mobil browserda (autoplay?) çalışıyor mu?
- Kapalı deste görüntüsü "Grid mi değil de" hissini veriyor mu?
- Reveal sırası güvenli mi server-side validate edildi mi?

**Geçiş Kriteri:**
- ✅ Animations 60fps passed (Chrome DevTools)
- ✅ Sound cross-browser tested
- ✅ Tap responsiveness <200ms
- ✅ Reveal validation server-side
- ✅ Accessibility audit passed

---

### Aşama 9: Guest Session, Sonuç Kaydetme ve Premium Niyet Testi

**Net Hedef:**
Kullanıcı ilk okumayı misafir olarak yapıyor. Sonra magic link ya da Google ile kaydolarak sonuç kaydediyor. Premium talep ölçülüyor.

**Kullanıcı Değeri:**
Hiç giriş yapmadan okuma al. Sonra kaydol. Premium'a geçmek istersen bak.

**Yatırımcı Değeri:**
0-to-1 conversion funnel. Premium niyeti ölçümü (Stripe entegrasyonu henüz yok).

**Kapsama Dahil:**
- Guest session (ephemeral, session storage)
- Reading result persistence (cookie / local state)
- Magic link auth (email only, no password)
- Google OAuth (Auth.js integration)
- Result save prompt (reading after display)
- Premium modal (görsel, fiyat yok, "Merak ettim" CTA)
- Premium modal tracking (viewed, clicked, dismissed)

**Kapsam Dışı:**
- Tam abonelik yönetimi (Aşama 10)
- Gerçek ödeme (MVP'nin ötesi)
- Email doğrulama (magic link'te basit email gönder)

> **SUPERSEDED (Sprint 0, 2026-07-23):** The Prisma recommendations in this
> section are **SUPERSEDED by ADR-009 (PostgreSQL + Drizzle, Accepted)** and
> reaffirmed by the Product Owner's Phase 2 decision D2 (Drizzle authoritative;
> Prisma must not be introduced). Read `schema.prisma` below as a Drizzle
> schema (`src/db/schema.ts`). Persistence is designed in Phase 2 Sprint 4
> against Neon PostgreSQL + Drizzle, not this section's stack.

**Teknik Karar:**
- Session: Auth.js (NextAuth v5)
- Magic link: ~~Prisma~~ **Drizzle (ADR-009)** + Resend (email)
- Google OAuth: Auth.js + Google Console
- Reading cache: Database (readings table), guest okumalar sonra silinebilir
- Premium modal: Plain text fiyat, link to landing (Stripe dashboard'a değil)

**Oluşturulacak Dosyalar:**
```
src/auth/
  - auth.config.ts (Auth.js configuration)
  - providers.ts (Google, magic link)

src/api/auth/
  - [...nextauth]/route.ts
  - callback.ts
  - signin.ts

src/components/
  - SaveReadingPrompt.tsx
  - PremiumModal.tsx

src/db/
  - schema.ts (Drizzle schema — SUPERSEDES schema.prisma per ADR-009)
  - seed.ts

src/actions/
  - save-reading.ts (Server Action)
  - send-magic-link.ts

lib/
  - email.ts (Resend integration)

tests/
  - auth.test.ts
  - reading-save.test.ts
```

**Database Schema (+ Memory & Journal Hazırlık):**
```sql
table users {
  id
  email
  name
  provider (google | magic-link)
  persona_type (first_time | regular | anxious | decision_maker | skeptic)
  created_at
  last_reading_at
}

table readings {
  id
  user_id (nullable, guest okumalar da kaydedilir)
  session_id (guest session tracking)
  persona_at_time (snapshot, ileride persona değişirse history korunur)
  cards (JSON)
  interpretation (JSON)
  topic
  spread_type
  helpful_score (1-3 scale)
  created_at
  reflection_prompt_shown_at (1 hafta sonra: "Ne gerçekleşti?")
}

table reading_reflections {
  id
  reading_id
  user_note (text, "Gerçekten sabırlı oldum")
  outcome_status (happened | partial | not_yet | different)
  reflection_date
  created_at
}

table premium_events {
  id
  session_id
  event (viewed | clicked | dismissed)
  timestamp
}

-- İleride (Aşama 9+):
-- table journal_entries
-- table reading_continuity (bir hafta sonra kişiselleştirilmiş "geçen haftanızda...")
```

**Memory & Journal Stratejisi (MVP'de veri modeli hazır, UI'ı simplify):**
- İlk MVP: Reading sonrası "1 hafta sonra buna döneceğiz" mesajı + email reminder
- Week 2: User kendi notlarını ekleyebilir (simple textarea)
- Premium: Detaylı reflection, journaling, pattern detection
- Ileride: Çok okumanın beraber analizi, learning arcs

**Testler:**
- Magic link auth flow (email gönder, link tıkla, login)
- Google OAuth test (mock)
- Reading save operation
- Premium modal tracking
- Guest session persistence
- Conversion funnel (guest → registered → premium interest)

**Risk ve Red Team:**
- Guest okumalar silinme politikası GDPR uyumlu mu?
- Magic link expiry (15 min?) yeterli mi?
- Google OAuth consent screen'i yeterince basit mi?
- Premium modal agresif mi?
- Conversion rates beklentileri realistik mi?

**Geçiş Kriteri:**
- ✅ Auth flow tested (magic link + Google)
- ✅ Reading save tested
- ✅ Premium modal analytics fired
- ✅ Database schema validated
- ✅ GDPR compliance checked
- ✅ 100 kullanıcı signup'a hazır

---

### Aşama 10: Analytics, Güvenlik, Red Team ve 100 Kullanıcı Testi

**Net Hedef:**
MVP production-ready. 100 kullanıcı ile kontrollü test. Metrikler ölçülüyor. Major bugs fix edildi.

**Kullanıcı Değeri:**
Bugfree, güvenli, kişisel ve faydalı bir deneyim.

**Yatırımcı Değeri:**
Data-driven ürün kararları için sağlam metrikler.

**Kapsama Dahil:**

**Analytics Setup:**
- Event tracking (all 14 defined events)
- Session tracking (ID, duration, device)
- Funnel: landing → reading → result save → premium interest
- Heatmaps (optional: Hotjar free tier)
- Dashboarding (Metabase / simple SQL)

**Security Checklist:**
```
[ ] SQL injection tests (Zod validation)
[ ] XSS protection (React auto-escaping + Content-Security-Policy)
[ ] CSRF tokens (Auth.js automatic)
[ ] Rate limiting (API + form submission)
[ ] Password-less auth (no password storage)
[ ] GDPR: Privacy policy, data retention, delete account
[ ] HTTPS (Vercel automatic)
[ ] Error messages (no sensitive info leak)
[ ] Secrets management (.env.local, Vercel secrets)
[ ] Dependency scanning (npm audit, Dependabot)
```

**Red Team Kontrol Listesi (Aşama 1'den):**
```
[ ] Ürün gerçekten premium hissettiriyor mu?
[ ] Flow gereksiz karmaşık mı?
[ ] Yeni kullanıcı 2 dk'de tamamlayabiliyor mu?
[ ] Hukuki risk var mı? (etik okumalar, veri privacy)
[ ] Addiction loop kurulmuş mu? (cooldown working?)
[ ] Kod sürdürülebilir mi? (SOLID, DRY, testable)
[ ] Mobil performansı ≥90 (Lighthouse)
[ ] Premium niyet ölçümü yapılan mı?
[ ] 100 kullanıcı test protokolü hazır mı?
```

**KPI Targets (Başarı):**
```
Reading completion rate: >70%
Median time-to-reading: <2 min
Helpful score average: ≥2.0/3.0
"Bana özel hissettirdi" rate: >60%
Premium view rate: >40%
Premium click rate: >15%
Signup conversion: >30%
7-day return rate: >25%
Same-topic re-read rate: <20% (addiction check)
Bugs per 100 sessions: <2
```

**Kapsama Dahil:**
- Event tracking infrastructure
- Dashboard (SQL queries, CSV export)
- 100-user recruitment plan
- Test protocol ve screener survey
- Security audit (OWASP top 10)
- Performance profiling (Lighthouse, WebVitals)
- Error logging (Sentry)
- Crash reporting

**Test Protocol:**
```
Screener:
- 18+
- Tarot/spiritual interest: medium or above
- Mobile device (primary usage)
- Willing to share feedback

Test Duration: 2 weeks

Tasks:
1. Land on app, understand value (1 min)
2. Select topic, answer questions (2 min)
3. Complete reading, rate helpfulness
4. See premium offer
5. Feedback form (5 min)

Measurement:
- Task completion rate
- Time per step
- Helpfulness score
- Premium interest (yes/no)
- Qualitative feedback
- System Usability Scale (SUS)
```

**Kapsama Dışı:**
- Marketing campaign (post-MVP)
- Community management
- Advanced analytics (cohort, retention modeling)

**Teknik Karar:**
- Analytics: Posthog Community (self-hosted) ya da Segment (edge case)
  → **Posthog Community** (GDPR-friendly, open-source)
- Error tracking: Sentry (10k monthly free tier)
- Secrets: Vercel env vars
- Monitoring: Vercel Analytics + custom logs

**Oluşturulacak Dosyalar:**
```
src/analytics/
  - events.ts (event definitions)
  - tracking.ts (fire events)

src/security/
  - SECURITY_CHECKLIST.md
  - CSP.md

src/api/
  - /api/health (status check)
  - /api/metrics (metrics export)

scripts/
  - deploy-checklist.sh
  - security-audit.sh

docs/
  - TEST_PROTOCOL.md
  - ANALYTICS_DASHBOARD.md
  - DEPLOYMENT_GUIDE.md
  - PRIVACY_POLICY.md
  - TERMS_OF_SERVICE.md
```

**Testler:**
- Security: OWASP ZAP scanner, manual pen test
- Performance: Lighthouse, Web Vitals
- Compatibility: iOS Safari, Android Chrome, tablet
- Accessibility: axe-core scanner, keyboard nav
- Analytics: Event firing validation
- Load: 100 concurrent sessions (k6 or JMeter)

**Risk ve Red Team:**
- Data breach riski var mı? (auth, storage)
- Privacy disclosure yeterli mi?
- Okumalar gerçekten faydalı mı, yoksa placebo mu?
- Addiction cycle başlattık mı?
- Sadece destek kullananlar premium geçiyor mu, başarısızlar mı?
- Launch public'i mi, beta private mi?

**Geçiş Kriteri:**
- ✅ Security audit all items passed
- ✅ Lighthouse score >90 (mobile, desktop)
- ✅ WCAG AA compliance verified
- ✅ 100 test users recruited ve onboarded
- ✅ Test protocol completed, feedback collected
- ✅ KPI thresholds >80% met
- ✅ Deployment checklist all items ✓
- ✅ Production database backed up
- ✅ Error logging active
- ✅ Privacy policy + Terms published

---

## Nihai MVP Mimarisi — Insight Engine v1.0

**Proje Felsefesi:**
Bu proje "Tarot" uygulaması değil; **Insight Engine** çekirdeği. Tarot ilk modüldür. Ileride şu modüller eklenebilir:
- Tarot (current)
- Dream Analysis
- Journaling & Reflection
- Daily Guidance
- Symbol Analysis

Her modül aynı çekirdek üzerine oturur: Persona-aware, memory-enabled, ethical guidance.

**Mimarisi:**

```
┌─ Insight Engine Core ──────────────────────────────────────┐
│                                                              │
│  [Persona System] ← User type detection & adaptation        │
│  [Deterministic Layer] ← Controlled knowledge base           │
│  [Synthesis Layer] ← Pattern & relationship extraction      │
│  [AI Language Layer] ← Natural language generation          │
│  [Memory System] ← Reflection & continuity                  │
│  [Ethics Guardian] ← Safety checks, crisis detection       │
│                                                              │
└────────────────────────────────────────────────────────────┘
         ↓
┌─ Tarot Module v1 ─────────────────────────────────────────┐
│  - 22 Büyük Arkana                                          │
│  - 2 Spreads (3-card, 5-card)                              │
│  - Intake Engine (topic → persona → questions)              │
│  - Reading Constitution                                     │
└────────────────────────────────────────────────────────────┘
         ↓
┌─ Platform Layer ──────────────────────────────────────────┐
│  Frontend: Next.js 16 + React 19 + Tailwind               │
│  Backend: Route Handlers + Server Actions                  │
│  Database: PostgreSQL + Drizzle ORM                        │
│  Auth: Auth.js (magic link, Google OAuth)                 │
│  Analytics: Posthog Community                              │
│  Errors: Sentry                                            │
│  Email: Resend                                             │
│  Deployment: Vercel + Railway                              │
└────────────────────────────────────────────────────────────┘

Monetization:
  - Premium interest modal (no payment yet)
  - Premium landing page
  - Waitlist / intent collection
  - Metrics: clicks, signups, intent signals
```

---

## İlk 100 Kullanıcı Test Protokolü

### Recruitment
- LinkedIn tarot/wellness communities
- Reddit r/tarot (karma required)
- Instagram spiritual accounts
- Screener survey (18+, interest level)
- Target: 100 users, 2 hafta active

### Daily Standartlar
- Morning: Server health + uptime check
- Afternoon: Error log review
- Evening: Analytics dashboard update

### Feedback Collection
- Post-reading helpfulness prompt (1-3 score)
- Post-reading open text ("Ne oldu, ne hissettiniz?")
- Day 3, 7: Retention check-in email
- End of week: Full feedback form (SUS + open)

### Data Capture
```
Per user:
- Signup date, device, location (anon)
- Topic selected
- Spread type recommended vs accepted
- Cards selected + order
- Reading viewing duration
- Helpful score
- Premium interest
- Churn date (if applicable)

Per session:
- Duration
- Events fired
- Errors
- Performance metrics
```

### Go/No-Go Criteria
```
GO (Proceed to Beta):
- Completion rate ≥70%
- Helpfulness average ≥2.0
- No critical bugs
- Premium interest ≥10%
- 7-day return ≥20%
- SECURITY all passed

NO-GO (Iterate):
- Completion rate <50%
- Helpfulness <1.5
- >5 critical bugs
- Premium click 0%
- Data security breach
```

---

## Aşama 1 için Uygulanabilir Görev Listesi

**Hemen yapılacak:**

1. **Ürün Sözleşmesi (PRD) — 2 gün**
   - MVP scope tanımlama
   - Success metrics (10 key metrics)
   - Risk matrix (ethics, security, addiction)

2. **Analytics Schema — 1 gün**
   - Event definitions (14 events)
   - Dashboard wireframe
   - Metric calculation

3. **Test Protocol — 1 gün**
   - Screener survey tasarı
   - Test tasks
   - Feedback form template

4. **Ethical Red Lines — 1 gün**
   - Prohibitied topics
   - Forbidden phrases
   - Crisis referral templates

5. **Security Checklist — 1 gün**
   - OWASP mapping
   - Auth flows
   - Data handling rules

**Dosyalar:**
```
docs/PRD.md ← PRD complete
docs/ANALYTICS_SCHEMA.json ← Event definitions
docs/TEST_PROTOCOL.md ← Screener + tasks
docs/ETHICS_RED_LINES.md ← Prohibitions + referrals
docs/SECURITY_CHECKLIST.md ← OWASP mapping
```

**Acceptance Criteria for Aşama 1:**
- [ ] PRD final ve stakeholder onaylı
- [ ] 10 metric tanımlanmış ve measurable
- [ ] Etik kırmızı çizgiler yazılı
- [ ] Security checklist yapılmış
- [ ] Analytics schema JSON valid
- [ ] Test protocol > screener + tasks
- [ ] Dosyaların tümü committed

**Sonra Aşama 2'ye geç: Wireframing**

---

## Sonuç

Bu revize plan:
- ✅ MVP kapsamını küçültüyor (22 kart, 2 açılım)
- ✅ Ürün doğrulanmadan altyapı kurmamıştır
- ✅ Veri-driven kararlar alabilmek için metrikleri erken tanımlar
- ✅ Teknik borcu minimiza eder (single Next.js app, no custom auth)
- ✅ Etik limitleri yazılı hale getirir
- ✅ 100 kullanıcı testini strukturlü yapıyor

**En kritik başarı metriği:**
> Kullanıcı, 22 kartlık kontrollü bir deneyimden aldığı yorumu gerçekten kişisel, güvenli ve tekrar kullanmaya değer buluyor mu?

Bu cevap "evet" olmadan, herhangi bir ölçeklemeden kaçınılmalı.
