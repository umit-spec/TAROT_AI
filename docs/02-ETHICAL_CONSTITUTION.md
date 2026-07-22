# Ethical Constitution — Insight Engine Safety Framework

## Purpose

Kullanıcıları korumak. Yasal risk azaltmak. Sistem davranışını belirlemek.

Her okuma, kriz algılama, ve AI output bu belgede tanımlanan kurallara uymalı.

---

## Core Ethical Principles

1. **Transparency:** Tarot sembolik araçtır, kesin değildir.
2. **Autonomy:** Kullanıcı karar verir, sistem suggerir.
3. **Non-harm:** Korkutucu, manipülatif, bağımlılık yok.
4. **Professional Boundaries:** Danışman değiliz.
5. **Equity:** Tüm seçmeler eşit itibarda.

---

## Prohibited Interpretations

### Kategori 1: Sağlık & Tıbbi

**Tetikleyici Kelimeler:**
- hastalık, rahatsızlık, ağrı, korona, covid, grip, grip, kanser, tümör, kalp, kan basıncı, diyabet
- rahim, hamilelik, doğum, miscarriage, kısırlık, tıbbi prosedür
- mental health, depresyon, anksiyete, bipolar, şizofreni, PTSD
- ilaç, tedavi, ameliyat, anestezi, endoskopi
- doktor, hastane, klinik, tıbbi yardım

**Yasaklı Çıktılar:**
- "Bu hastalığı geçeceksin" 
- "Şu ilacı bırak"
- "Hamile kalacaksın / kalmayacaksın"
- "Ağrın geçecek"
- "Ruh hali düzelecek"

**İzin Verilen Çıktılar:**
- "Sağlığı merkez alan bir karar vermelisin"
- "Profesyonel tıbbi tavsiyesi almayı düşün"
- "Bu dönemde bedene kulak vermelisin"
- "Profesyonel destek almayı öner"

**Sistem Davranışı:**
1. Tetikleyici kelime detected → User Input saniye cinsinden işaretlenir
2. "Health Disclaimer Modal" gösterilir
3. Reading hala verilir AMA başına disclaimer eklenir:
   > "Bu okuma sağlık tavsiyesi değildir. Tıbbi konuları profesyonel sağlık çalışanlarıyla danışınız."
4. Event log: `health_disclaimer_shown` + tetikleyici kelime

---

### Kategori 2: Hukuki & Mali

**Tetikleyici Kelimeler:**
- boşanma, evlilik sözleşmesi, veraset, miras, vesayet
- dava, mahkeme, avukat, karar, ceza, hapsetme
- kredi, borç, faiz, yatırım, hisse, kripto, forex
- işe alınma, iş sözleşmesi, maaş, terfi

**Yasaklı Çıktılar:**
- "Davayı kazanacaksın"
- "Paraların artacak"
- "Kripto al, zengin olacaksın"
- "Boşan, daha iyi olacaksın"

**İzin Verilen Çıktılar:**
- "Bu kararı almanız öncesi tüm seçenekleri değerlendir"
- "Mali danışmana başvurmayı düşün"
- "Hukuki danışmanlık almayı öner"
- "Risk-reward dengesini düşün"

**Sistem Davranışı:**
1. Tetikleyici detected → `legal_financial_disclaimer_shown`
2. Modal: "Hukuki/Mali konuları profesyonellerle danışınız"
3. Reading: disclaimer + generic reflection

---

### Kategori 3: Şiddet, Suça Teşvik, Tehdit

**Tetikleyici Kelimeler:**
- ölüm, öldürmek, cinayet, intikam, zarar, yaralamak
- intihar, kendine zarar, otuz, intihara teşvik
- tecavüz, cinsel saldırı, taciz
- hırsızlık, dolandırıcılık, suç, kaçak
- kurban, çelik, hapsetme, işkence
- lanet, kötü göz, büyü, paranormal tehdit

**Yasaklı Çıktılar:**
- Tüm bunlar (sistem hiçbir şekilde output vermez)

**Sistem Davranışı:**
1. Tetikleyici detected → `CRISIS_ALERT` log
2. Reading verilmez
3. Modal gösterilir: "Bu konularda yardım alabileceğiniz kaynaklar" (links to crisis hotlines)
4. Background: Sistem yöneticisine email gönderilir (monitoring için)

**Crisis Resources (Türkiye):**
- İntihar Önleme Derneği Çağrı Hattı: 0312 380 9098
- ALO 183: Çocuk İhbar Hattı
- 155: Polis İmdat
- 112: Acil Tıp

---

### Kategori 4: Manipülasyon & Addiction Tetikleyicileri

**Yasaklı Frases:**
- "Kesinlikle / Mutlaka / Garantili"
- "Kaderin yazılı"
- "Evren sana mesaj veriyor"
- "Senin özel enerjin var"
- "Biz special souls"
- "Sadece tarot bunu bilir"

**Izin Verilen Frases:**
- "Bu kartlar şu desenleri gösteriyor"
- "Başka perspektif olabilir"
- "Düşünülmesi gereken noktalar"
- "Reflection için soru"

**Sistem Davranışı:**
Tüm okumalar, bu frases için scanned. Detected ise:
- Output rewrite (düzeltilmiş versiyon generate edilir)
- Event: `manipulation_phrase_detected` + rewrite
- AI instruction: "Bu output manipülatif sesliyor, daha neutral yapabilir misin?"

---

## Crisis Detection & Referral

### Sinyaller (Any Okumada)

1. **İntihar/Kendine Zarar:**
   - Keywords: ölüm, intihar, son, bitir, artık yaşayamam
   - Action: STOP, Crisis modal, hotline links
   - Log: `crisis_suicide_detected`

2. **Akut Şiddet:**
   - Keywords: yaralamak, öldürmek, başkasına zarar
   - Action: Crisis modal, polis linki, 155
   - Log: `crisis_violence_detected`

3. **Tıbbi Acil:**
   - Keywords: kalp, göğüs ağrısı, bayılma, solunuma, solunum, kanama
   - Action: Modal: "112 arayın", 112 linki
   - Log: `crisis_medical_detected`

4. **Cinsel Saldırı/Tecavüz:**
   - Keywords: tecavüz, cinsel saldırı, istemeyen, zorla
   - Action: Crisis modal, destek kaynakları
   - Log: `crisis_assault_detected`

### Response Flow

```
Crisis Signal Detected
  ↓
Reading PAUSE (hemen verilmez)
  ↓
Appropriate Modal göster
  - Immediate safety first
  - Professional resource links
  - Hotline numbers
  ↓
Simple acknowledgment (NOT reading)
  - "Anlıyorum bu zor bir durum"
  - "Profesyonel desteği değer"
  - "Seni destekleyen insanlar var"
  ↓
Log & Alert (system admin notified)
  ↓
No Reading delivered
  ↓
User closes modal → back to home (no further prompting)
```

---

## AI Safeguards

### Claude API Integration Rules

1. **System Prompt Enforcement:**
   ```
   Rolle: Ethical, symbolic tarot guide.
   
   Hiçbir zaman:
   - Kesin kehanet yap
   - Sağlık/hukuki/mali tavsiye ver
   - Manipulation frases kullan
   - Bağımlılık teşvik et
   - Kültürel asimilasyon yap
   
   Her zaman:
   - Belirsizliği acknowledge et
   - Autonomy vurguła
   - Reflection sor
   - Professional boundaries göz tutun
   ```

2. **Output Validation:**
   - Tüm Claude outputs, Zod schema validate edilir
   - Prohibited phrases scanned (regex)
   - Tone checked (manipulative detected → rewritten)
   - If AI is "off" → fallback to deterministic-only reading

3. **Fallback Mode:**
   - AI API down / rate limit → Deterministic-only reading delivered
   - User experience affected ama safety maintained
   - "AI-enhanced insights" hidden, deterministic shown

### Prompt Injection Defense

- User input (topic, answers) hiçbir zaman Claude prompt'a directly concatenate edilmez
- Her input, parameterized ve sanitized
- Claude'a JSON gönderilir, freetext değil

---

## Consent & Transparency

### On-Boarding (First Time)

User landing page'den geçmeden, şu modal'ı görür:

> **Tarot Nedir?**
> 
> Bu uygulama, sembolik düşünme ve iç reflection aracıdır.
> 
> **YAPILMAZ:**
> - Kesin kehanet
> - Tıbbi tavsiye
> - Hukuki tavsiye
> - Mali tavsiye
> 
> **NASIL KULLANILIR:**
> - Sorunuzu düşünün
> - Kartları çekin
> - Okumayı reflection için kullanın
> - Önemli kararlar için profesyonellere danışın
> 
> □ Anlıyorum
> 
> [Devam Et] / [Çıkış]

### Result Disclaimer

Her okuma sonunda:

> **Hatırlatma**
> 
> Bu okuma sembolik bir perspektiftir.
> 
> Sağlık, hukuki, mali veya duygusal kriz için profesyonel destek alınız.
> 
> Siz karar verirsiniz. Kartlar sadece ayna.

---

## Legal Compliance

### GDPR

- User data minimum (email, timestamp)
- No third-party data sharing
- User delete request: instant compliance
- Data retention: 90 days max (then auto-delete)
- Privacy policy: clear, simple Turkish

### Liability

Terms of Service'te açıkça:
- "Bu uygulama danışmanlık, terapı veya tıbbi hizmet sağlamaz"
- "Tarot sembolik araçtır, kesin değildir"
- "Kullanıcı kendi kararlarından sorumludur"
- "Sistem hiçbir kararı tavsiye etmez"

### Medical Disclaimer

App'de visible: 
> "Tıbbi, psikolojik veya hukuki krisler için profesyonel yardım alınız. [Kaynaklar]"

---

## Testing Checklist

Her aşamada, bu maddeleri test edilecek:

- [ ] Sağlık keywords tetikliyor mu health disclaimer?
- [ ] Mali keywords tetikliyor mu legal disclaimer?
- [ ] Crisis keywords system'i stop ediyor mu?
- [ ] Manipulative frases output'ta yok mu?
- [ ] Addiction loop mekanizması çalışıyor mu? (cooldown, limits)
- [ ] Prompt injection korunmuş mu?
- [ ] Fallback mode (AI down) çalışıyor mu?
- [ ] Crisis resources linkleri çalışıyor mu?

---

## Governance

**Ethical Review Board:** (Product Owner + external ethics reviewer, ilerde)

**Karar değişiklikleri:** 
- Yalnızca Product Owner + ethical reasoning
- Decision Log'a kaydedilir
- 30-day public notice before enforcement

---

## Next Steps

Product Constitution'ı oku. Çelişki kontrolü yap.

Persona Constitution'a geç.
