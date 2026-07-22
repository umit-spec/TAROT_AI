# Product Constitution — Insight Engine v1.0 / Tarot Module

## Purpose

Insight Engine, kullanıcılara kendi kendini anlamalarında yardımcı olmak için tasarlanmış bir **ethical guidance system**'dir.

Tarot, ilk modüldür. Sembolik düşünme, iç derinlik ve reflection aracı olarak sunulur.

**NOT:** Kehanet, talimat ya da kesin hayat kararı almak için değildir.

---

## Scope (Dahil)

### MVP (Aşama 1-10)

**Tarot Module v1.0:**
- 22 Büyük Arkana kartı
- 2 Spread açılımı
  - 3-Kart Genel Açılım
  - 5-Kart İlişki Açılımı
- 5 Persona tipi (First-time user, Regular, Anxious, Decision-maker, Skeptic)
- Intake Engine (Topic → Persona detection → Soruları)
- Reading Engine (Deterministic + Synthesis + AI Language)
- Session persistence (sonuç kaydetme, 1-hafta reflection prompt)
- Premium intent measurement (ödenmiş ürün değil, niyet ölçümü)
- Basic analytics (14 event)
- Guest session + Magic link/Google auth

**Language:** Türkçe (tüm UX, okumalar, belgeler)

**Platforms:** Mobile-first web (iOS Safari, Android Chrome, tablet-responsive)

**Deployment:** Single Next.js 16 app on Vercel

---

## Out of Scope (Dışında)

### Sonraki Aşamalarda (11+)

- 56 Küçük Arkana kartı
- Ters kartlar
- Reversed interpretations
- Custom spreads
- Multi-language support
- Premium subscription (gerçek ödeme henüz değil)
- Sınırsız kullanım
- Admin panel
- Social sharing
- Astrology integration
- Other divination methods

### Sonraki Modüller (Ileride)

- Dream Analysis module
- Journaling & Reflection module
- Daily Guidance module
- Symbol Analysis module
- Community features
- AI-assisted journaling

---

## Non-Negotiable Rules

Bu kurallar hiçbir zaman kırılmaz. Kod, AI prompt, tasarım kararı bunlara uymalı.

### 1. Kesin Kehanet Yasağı

**YAPILMAYACAK:**
- "Kesinlikle geri dönecek"
- "Aldatılıyorsunuz"
- "Ölüm / hastalık / hamilelik tahmini"
- "Finansal kazanç garantisi"
- "Paranormal tehdit veya büyü"
- "Hukuki sonuç tahmini"

**Alternatif:**
- "Sabır ve iletişim temasından çıkıyor"
- "İlişkinin dinamikleri hakkında düşünülecek noktalar var"
- "Sağlıkla ilgili konular profesyonel danışmana sorulmalı"

### 2. Sağlık, Hukuk, Finansal Tavsiye Yasağı

Hiçbir okuma, tıbbi, hukuki veya finansal karar tavsiyesi vermez.

**Tetikleyici Cümleler (Sistem tarafından detected):**
- "İlacı bırak", "doktor git", "ameliyat yaptır"
- "Boşan", "dava aç", "avukat tut"
- "Tüm parani yatır", "kripto al", "borç ver"

Tetiklenen: **Professional Referral Modal göster**, Okumayı ver ama disclaimer ekle.

### 3. Addiction Loop Tasarımı Yasağı

**YAPILMAYACAK:**
- Sınırsız okuma (unlimited usage)
- Aynı soruya 24 saatlik cevap
- "Merak ettim daha çek" teklifi
- Push notification ile çekime davet

**Alternatif:**
- Metered model (2-3 okuma/hafta free)
- 24-hour cooldown aynı konu
- Reflection prompt (1 hafta sonra: ne değişti?)
- Premium = metered ama detaylı (12-20/ay)

### 4. Kültürel / Dini Asimilasyon Yasağı

**YAPILMAYACAK:**
- "Tarot ilmi kesin"
- "Evren sana mesaj veriyor"
- "Ruhsal çağırma" mitoloji

**Alternatif:**
- "Sembolik düşünme aracı"
- "Kendi içgüdüsünü test etme şansı"
- "Reflection tool"

### 5. Kullanıcı Kütüphane Duygusu Yasağı

Okumalar kısa, öz, tasdiklendirici değil (validate etici) olmalı.

**YAPILMAYACAK:**
- "Evet, doğru hissediyorsun"
- "Sezgin çok kuvvetli"
- "Sana isteklerin yerine gelecek"

**Alternatif:**
- "Bu kartlar size sorular soruyorlar"
- "Başka perspektiften bakabilirsiniz"
- "Reflection için alan bulunuz"

---

## MVP Constraints

### Kullanıcı Sınırlaması

| Segment | Limit |
|---------|-------|
| Guest | 1 short reading (3-card only) |
| Free Registered | 2 short readings/week |
| Premium (future) | 12-20 detailed readings/month |
| Same topic | 24-hour cooldown |

### Performance Constraints

- First reading: <2 minutes (landing → result)
- Page load: <3 seconds (Lighthouse >90)
- Mobile: 60 FPS animations
- Card generation: <2 seconds (shuffle + reveal)

### Data Constraints

- No email scraping, no third-party tracking
- User data: Encrypted at rest, GDPR-compliant
- Reading data: Deleted after 30 days (unless saved)
- Guest sessions: Purged after 7 days

---

## Success Definition

**MVP'yi "başarılı" sayıyoruz eğer:**

1. **Completion Rate** >70% (start → read → rate)
2. **Helpfulness Score** average ≥2.0/3.0
3. **Premium Interest** click rate ≥15%
4. **No Security Breach**
5. **Zero Addiction Signals** (re-read same topic <20%)
6. **7-day Return Rate** ≥20%

**Başarısız sayıyoruz eğer:**
- Completion rate <50%
- Helpfulness <1.5/3.0
- Security breach
- >5 critical bugs
- Addiction loop detected (>50% same-topic re-reads)

---

## Ownership & Governance

**Product Owner:** (User / Team)
**Decision Authority:** (Product Owner)

**Karar değişikliği:** Yalnızca Product Owner tarafından, written justification ile, Decision Log'a kaydedilerek.

Hiçbir köşeli karar (scope change, ethics rule change) Developer tarafından yapılmaz.

---

## Review Checklist (Aşama 1 Sonunda)

- [ ] Ethical Constitution ile çelişki var mı?
- [ ] Persona Constitution ile uyum var mı?
- [ ] Technical Constitution tarafından uygulanabilir mi?
- [ ] MVP exit criteria'yle ölçülebilir mi?
- [ ] Tüm "YAPILMAYACAK" maddeleri test edilebilir mi?
- [ ] Product Owner tarafından onaylı mı?

---

## Next Steps

Ethical Constitution okunsun. Product Constitution ile tutarlılık kontrol edilsin.
