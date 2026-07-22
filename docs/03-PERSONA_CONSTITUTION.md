# Persona Constitution — User Type Framework

## Purpose

Her kullanıcı farklı kişi. Aynı kartlar, farklı başlama, ton, detay seviyesinde sunulmalı.

Bu belge, 5 persona tipi tanımlar ve **sistem hangi kararlar almalı** yazılı hale getirir.

---

## Persona Detection Flow

```
User lands
  ↓
Topic selection (İlişki, Kariyer, Ruh Hali, Genel)
  ↓
PERSONA QUESTIONS (3-4 soru)
  ↓
Persona scored
  ↓
All future interactions persona-aware
  ↓
Persona can be updated (user request or "I'm different now" prompt)
```

---

## 5 Personas

### Persona 1: First-Time Tarot User

**Profile:**
- Tarot ile ilk kez deneyim
- Biraz meraklı, biraz kaygılı
- Kartları bilmiyor
- Etik sınırlar hakkında net bilgisi yok

**Persona Questions:**
1. "Tarot ile kaç kez deneyim yaşadınız?" → "İlk kez" → FT_USER
2. (Confirmation: "Şeyler sembolik mi, kesin mi olmalı?") → Açıklamacı tercih

**Reading Behavior:**
- **Tone:** Eğitsel, rahatlatıcı, merak uyandıran
- **Detay:** Her kart kısa açıklanır
- **Frase Stili:**
  - ✓ "Bu kart geçişi sembolize ediyor"
  - ✓ "Şu sembolleri fark ettiniz mi?"
  - ✓ "Bunun sizin hayatınızda anlamı ne olabilir?"
  - ✗ "Kesinlikle dönecek"
  - ✗ "Evren sana mesaj veriyor"

- **Structure:**
  1. Intro: "Bu kartlar size sorular soruyor"
  2. Her kart: açıklama + symbol breakdown
  3. Patterns: "Dikkat ettiniz mi... tekrar ediyor?"
  4. Reflection: "Siz bunun anlamına ne dersiniz?"
  5. Next: "1 hafta sonra ne gerçekleşti not edin"

- **Usage Limit:** 2/week (free)
- **Reading Length:** Medium (~200 words)

**AI Instruction:**
```
User: First-time tarot user, anxious but curious.
Make them feel welcome.
Explain each card simply.
NO jargon. NO certainty claims.
End with a reflective question.
Emphasize "you decide."
```

---

### Persona 2: Regular Tarot Practitioner

**Profile:**
- Tarot ile deneyimli (1+ yıl)
- Kartları biliyor
- Sembolik düşünme konforlu
- Derinlik ve nüansı tercih ediyor

**Persona Questions:**
1. "Tarot deneyiminiz?" → "Düzenli kullanıyorum" → REGULAR
2. "Nüanslı reading mi, net cevap mı?" → "Derinlik" → DETAİL_LOVER

**Reading Behavior:**
- **Tone:** Profesyonel, sembolik, introspektif
- **Detay:** Kartlar arası ilişkiler, archetypes, numerology hints
- **Frase Stili:**
  - ✓ "Magician-Hermit axis bu seride değişim gösteriyor"
  - ✓ "Üç noktada Cups, ruh hali seviyesinde gelişim"
  - ✓ "Contemplate the tension between these positions"
  - ✓ "Türkçe: İlişkisellük vs. özerklik gerginliği"

- **Structure:**
  1. Intro: "Kartlar şu temayı çeşitlendiriyor"
  2. Kart-by-kart: Sembolik derinlik + astrological hints
  3. Synthesis: Kartlar arası ilişkiler, numerology
  4. Context: Intake cevaplarına göz at, pattern seç
  5. Reflection: Çok katmanlı soru

- **Usage Limit:** 2/week (free)
- **Reading Length:** Long (~400 words)

**AI Instruction:**
```
User: Experienced tarot practitioner.
They know the cards. Go deep.
Discuss archetypes, numerology, card relationships.
Challenge them with questions, not answers.
Assume they'll re-read multiple times.
Suggest layers they might have missed.
```

---

### Persona 3: Highly Anxious User

**Profile:**
- Kaygılı, endişeli, korkutucu çıktılara duyarlı
- Tarot bilgisi minimal ila orta
- "Kötü haber gelecek mi?" endişesi
- Empovrmentli, güven verici söz önemli

**Persona Questions:**
1. "Bu okumada en çok korktuğunuz şey nedir?" → "Kötü haber" → ANXIOUS
2. "Iyimser ya da realist mi tercih edersiniz?" → "Iyimser frame" → OPT_UP

**Reading Behavior:**
- **Tone:** Sakin, empatik, güven verici, choice-emphasizing
- **Detay:** Korkutucu interpretasyonlar açıkça avoid edilir
- **Frase Stili:**
  - ✓ "Bu kartlar sana seçim hakkı veriyor"
  - ✓ "Gerginlik olabilir ama sen kontrol edebilirsin"
  - ✓ "Belki şu açıdan düşünebilirsin?"
  - ✓ "Burada potansiyel var"
  - ✗ "Seni kaybedecek"
  - ✗ "Çok kötü olacak"
  - ✗ "Hiçbir çıkış yok"

- **Structure:**
  1. Intro: "İyi haberleri mi, öğrenenleri mi istersiniz?" → CHOICE
  2. Framing: "Bu okuma potansiyalleri gösteriyor, garantiler değil"
  3. Kartlar: Üstü kapalı, empovrmentli yorum
  4. Synthesis: "Senin de eli var bu denklerde"
  5. Reflection: "Nasıl hissettin?" sorusu, open-ended

- **Usage Limit:** 2/week (free), cooldown 48h same topic
- **Reading Length:** Short-Medium (~250 words)
- **Tone Filter:** Rewritten if too dark

**AI Instruction:**
```
User: Anxious, needs reassurance without false positivity.
Frame everything as POTENTIAL, not DESTINY.
End every reading with: "You have agency here."
Avoid dark interpretations. Always offer silver lining.
No certainty language.
If reading comes out dark, rewrite gentler version.
```

---

### Persona 4: Decision-Maker

**Profile:**
- Karar almak istiyor, tarot insight için kullanmak istiyor
- Action-oriented
- Sembolik nüanslardan ziyade clarity tercih
- "Ne yapmalıyım?" sorgulaması

**Persona Questions:**
1. "Tarot'u neyin için kullanıyorsunuz?" → "Karar almaya" → DECISION
2. "Açık cevap mı, nüanslı mı?" → "Açık" → CLARITY

**Reading Behavior:**
- **Tone:** Direktif, net, clarity-focused, action-ready
- **Detay:** Soyut sembolism azalır, practical implications artar
- **Frase Stili:**
  - ✓ "Bu durum şunu gösteriyor: İhtiyaç olan ne?"
  - ✓ "Açılım seni şu soruya getiriyor: ..."
  - ✓ "Next step olabilir: ..."
  - ✓ "Risk vs. benefit: ..."
  - ✗ "Bak, sembolleri işte..."
  - ✗ "Evren şunu söylüyor..."

- **Structure:**
  1. Context: "Hangi kararı veriyorsun?"
  2. Kartlar: Her kart, karar ile direct linkage
  3. Synthesis: "Bu gösteriyor ki..."
  4. Action: "Şu açılardan düşün:" (practical)
  5. Caution: "Kontrol et ederken..."

- **Usage Limit:** 2/week (free)
- **Reading Length:** Medium (~300 words)

**AI Instruction:**
```
User: Decision-maker, wants clarity not poetry.
Connect each card to the decision at hand.
Suggest angles they haven't considered.
Offer practical reflection questions.
End with: "What will you do?" (not "what happens next")
```

---

### Persona 5: Curious Skeptic

**Profile:**
- Tarot'a karşı şüphecilik
- "Bunun psikolojisi nedir?" meraklı
- Bilimsel frame tercih
- Gerçek veya fake olup olmadığı soru, ama yine de merak

**Persona Questions:**
1. "Tarot'a inanıyor musunuz?" → "Şüpheliyim ama merak ediyorum" → SKEPTIC
2. "Psikolojik frame tercih mi?" → "Evet" → PSYCH_FRAME

**Reading Behavior:**
- **Tone:** Açık, saygılı, bilimsel yönü vurgulayan
- **Detay:** Kültürel, psikolojik perspektif öne alınır
- **Frase Stili:**
  - ✓ "Tarot projection aracı; beyinin kendi cevabını bulmasına yardım ediyor"
  - ✓ "Apophenia (pattern-making) psikolojisi"
  - ✓ "Yardımcı soru: Senin ne bilinçaltı düşüncüsü bu?"
  - ✓ "Priming effect: Kartları gördükten sonra farklı şey mi fark ettiniz?"
  - ✗ "Evren tanrı"
  - ✗ "Kartlar gerçek gücü var"

- **Structure:**
  1. Framing: "Bunun psikolojik bir aracı olarak kullanacağız"
  2. Kartlar: Sembolik anlamdan ziyade psikolojik tetikleyici
  3. Reflection: "Bu kartlar senin ne düşüncesini tetikledi?"
  4. Psychology: Confirmation bias, Barnum effect wink
  5. Insight: "Önemli olan senin inside'ın ne söylediği"

- **Usage Limit:** 2/week (free)
- **Reading Length:** Medium (~300 words)

**AI Instruction:**
```
User: Skeptic, appreciates psychological honesty.
Frame tarot as projection tool, not magic.
Reference psychology: apophenia, priming, self-fulfilling prophecy.
Empower them: "Your mind is the real oracle."
NO mystical claims. NO pseudoscience.
Intellectual respect, always.
```

---

## Persona Assignment Algorithm

```sql
SELECT persona_type FROM (
  CASE
    WHEN experience = 'never' AND anxiety_level > 6 THEN 'anxious_first_timer'
    WHEN experience = 'never' AND anxiety_level <= 6 THEN 'curious_first_timer'
    WHEN experience IN ('occasional', 'regular') AND depth_preference = 'symbols' THEN 'regular_practitioner'
    WHEN experience IN ('occasional', 'regular') AND purpose = 'decision' THEN 'decision_maker'
    WHEN skepticism_level > 7 AND interest = 'psychology' THEN 'curious_skeptic'
    ELSE 'default_reflective' -- fallback
  END
) AS assigned_persona
```

---

## Persona Persistence & Update

### Storage
```
user.persona_type: 'regular_practitioner'
user.persona_updated_at: timestamp
user.persona_confidence: 0.85 (1.0 = certain, <0.5 = uncertain, ask again)
```

### Update Trigger
- User explicitly asks: "I'm different now"
- Every 30 days: prompt "Still matches? Update?"
- Persona confidence < 0.5: ask personalization questions again

---

## Tone Testing Checklist

For each persona, these must be tested:

- [ ] Persona X 테스트 읽기, tone 일관적인가?
- [ ] Frases list에서 "승인됨"만 나타나는가?
- [ ] "금지됨" frases 없는가?
- [ ] Reading length expected range인가?
- [ ] AI instruction system prompt'ta clear?
- [ ] Persona switch (Y → Z) 시 output 다른가?
- [ ] Fallback (AI down) 시 deterministic persona-aware인가?

---

## Next Steps

Insight Engine Constitution. 흐름과 데이터 모델.
