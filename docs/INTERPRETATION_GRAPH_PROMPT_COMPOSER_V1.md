# Interpretation Graph Prompt Composer V1 — IG-3 Bounded Prompt Composer Pilot

**Faz:** IG-3 — Bounded Prompt Composer Pilot
**Branch:** `feature/ig3-bounded-prompt-composer`
**Baseline:** `feature/ig2-tower-offline-evaluation` @ `a16816a`
**Bu fazda runtime entegrasyonu, canlı API çağrısı, network erişimi yoktur.**

## 1. Amaç

IG-2'nin doğruladığı bounded context packet'i, bir LLM'e gönderilebilecek
sınırlı, deterministik, izlenebilir, trust-boundary'si yapısal olarak
ayrıştırılmış, makine-okunabilir çıktı sözleşmesine sahip, provider-
neutral bir prompt bundle'a dönüştürmek.

## 2. Production mimarisiyle mevcut ilişki

Kod değiştirmeden önce gerçek production mimarisi incelendi (yalnız
uyumluluk için, hiçbiri bu fazda değiştirilmedi):

| Bileşen | Gerçek dosya | Not |
|---|---|---|
| Provider interface | `src/server/reading-engine/providers/types.ts` | `InterpretationProvider.generate()`, tek narration-only sözleşme |
| Anthropic provider | `src/server/reading-engine/providers/claude/index.ts` | `buildSystemPrompt()`+`buildUserMessage()` çağırır, `assertNoForbiddenPhrases` ile red-line kontrolü yapar |
| Prompt oluşturucular | `src/server/reading-engine/providers/claude/prompt.ts` | `developerInstruction`/`userData` ayrımı zaten var — `treatAsDataOnly: true` |
| MockProvider | `src/server/reading-engine/providers/mock.ts` | Network'süz, deterministik, persona-bazlı sabit metin |
| Output parser | `src/server/reading-engine/providers/claude/mapper.ts` | `ClaudeInterpretationOutputSchema` (zod), `parseClaudeResponseText` |
| Output validator | `src/server/reading-engine/validate.ts` | `assertNoForbiddenPhrases`, `validateReflectionPrompt`, `validateInterpretation` |
| API route | `src/app/api/readings/route.ts` | Kriz kısa devresi, rate limit, redakte edilmiş log |
| Soru şeması | `src/types/api.ts` → `ReadingRequestSchema` | `question: z.string().default('')` — **gerçek bir maksimum uzunluk yok** |
| Reflection prompt validator | `src/server/reading-engine/validate.ts` → `validateReflectionPrompt` | Tek `?`, kesinlik/üçüncü-kişi/teşhis regex guard'ları |
| Kriz kısa devresi | `src/app/api/readings/route.ts` + `src/server/intake/` | Kriz varsa hiçbir provider çağrısı yapılmaz |

### Mevcut mimariden fark eden noktalar (dürüstçe dokümante edildi)

- **Mevcut sistemde soru uzunluğu için gerçek bir üst sınır yok.**
  IG-3'ün 1000 karakterlik sınırı bu pilotun kendi kararıdır, production'ı
  yansıtmaz — bu, üretimi taklit ettiği iddiası taşımadan açıkça
  belirtilmiştir.
- Mevcut sistemin `developerInstruction`/`userData` ayrımı (prompt.ts)
  zaten bu fazın "trust boundary" kavramının bir öncülüdür; IG-3 bunu
  daha ayrıntılı bir şemaya (`untrustedUserQuestion.treatAsInstructions`)
  genişletir ama aynı temel ilkeyi tekrar keşfetmez.
- Mevcut sistemin output şeması (`ClaudeInterpretationOutputSchema`)
  `summary`/`cardInsights`/`synthesis`/`reflectionPrompt` alanlarını
  kullanır (üç kartlık okuma için); IG-3'ün `interpretation-output.schema.json`'ı
  tek kart, tek pozisyon için `primaryInterpretation`/
  `alternativePerspective`/`reflectionQuestion`/`usedContextRefs`
  kullanır — **bunlar aynı sözleşme değildir**, ikisi arasında bir eşleme
  bu fazın kapsamı dışındadır (açık sorular §15'e bakınız).

## 3. Provider-neutral bundle

`data/interpretation-graph/prompt-composer/schema/prompt-bundle.schema.json`
— Draft 2020-12, her nested seviyede `additionalProperties: false`.
`provenance.runtimeEnabled` ve `provenance.liveModelValidated` şema
düzeyinde `const: false`.

## 4. Trusted/untrusted sınırı

Üç güven alanı:

1. **Trusted fixed policy** — `ontology/global-guardrails.json`'dan
   üretilir, kullanıcı metni asla giremez.
2. **Trusted bounded context** — IG-2'nin `compile_context_packet.py`'si
   **tekrar yazılmadı, doğrudan çağrıldı** (`compose_bounded_prompt.py`
   içinde `from compile_context_packet import compile_context_packet`).
3. **Untrusted user question** — yalnız
   `userMessage.untrustedUserQuestion.text` alanında taşınır. Asla
   `systemPrompt`'a string interpolation ile yerleştirilmez — bu,
   36 prompt-injection vakasının tamamında (bkz. §8) doğrudan test
   edildi: her vakada soru metninin `systemPrompt` ve `boundedContext`
   içinde **hiç geçmediği** doğrulandı.

## 5. Bounded context minimization

`compose_bounded_prompt.py` → `_build_bounded_context()`: yalnız kart
çekirdeği (tek `coreMeaning`), pozisyon lensi (en fazla 2
`safeInterpretation`), seçilmişse bağlam/amaç/ilişki lensi, en fazla 2
sinyal lensi, ve **tam 23 guardrail'in kompakt hali** (id+rule+severity,
uzun rationale olmadan) taşınır. Context packet'te bulunmayan hiçbir
bilgi prompta girmez — bu, `compile_context_packet.py`'nin kendi
garantisinin doğal bir uzantısıdır.

## 6. Output contract

`schema/interpretation-output.schema.json` — 4 sabit alan, kapalı şema.
Presentation preference'e göre kelime sınırları:

| Preference | primaryInterpretation | alternativePerspective |
|---|---:|---:|
| concise | 35–60 | 15–45 |
| balanced | 50–90 | 15–45 |
| detailed | 75–120 | 15–45 |

## 7. Integrity hash'leri

SHA-256, canonical JSON (UTF-8, sorted keys, compact separators,
ensure_ascii=false) — `tools/interpretation-graph/lib/prompt_integrity.py`.
`bundleHash`, bütün `integrity` bloğu boşaltılmış bundle'ın hash'idir
(yalnız kendi alanı değil, dört alanın tamamı) — bu, `contextHash`/
`questionHash`/`templateHash` arasında garip bir sıralama bağımlılığı
olmaması için bilinçli bir tasarım kararıdır.

**Bu hash'ler güvenlik imzası değildir** — yalnız kazara sürüklenmeyi ve
sonradan yapılan değişikliği tespit eder, mesajın kaynağını
kriptografik olarak doğrulamaz.

## 8. Prompt injection sınırları

`evaluation/prompt-injection-cases.json` — 36 sentetik vaka, 7 kategori
(instruction override, role override, output override, secret
extraction, context injection, 9 delimiter/data-attack alt türü,
dependency/prophecy). **36/36 yapısal olarak containe edildi**
(`evaluate_prompt_composer.py` → Trust boundary bölümü).

**Bu testler yapısal containment'ı kanıtlar — canlı bir modelin bu
saldırılara davranışsal olarak direnmesini kanıtlamaz.** Bu sınır hem
`evaluation/prompt-injection-cases.json`'ın kendi `note` alanında hem
`reports/tower-prompt-composer-evaluation.md`'de tekrarlanır.

## 9. Türkçe input normalization

`tools/interpretation-graph/lib/untrusted_input.py`: NFC normalize,
kontrol karakteri reddi (`\n`/`\t`/`\r` hariç), 1000 karakter üst sınır
(production'da karşılığı yok, bkz. §2), prompt-injection frazlarını
yalnız metadata risk flag olarak işaretleyen (asla bloklamayan, asla
bağlama eklenmeyen) bir dedektör.

## 10. Token/byte budget

Gerçek ölçüm (78 composer vakasının tamamı):

| Alan | Min | Medyan | p95 | Max | Limit |
|---|---:|---:|---:|---:|---:|
| systemPrompt | ~5022 | ~5039 | ~5067 | ~5067 | 6000 |
| boundedContext | ~4615 | ~4831 | ~5697 | ~6291 | **6500** (bkz. not) |
| total bundle | ~12361 | ~12722 | ~13498 | ~14155 | 16000 |

**Not:** İlk önerilen `boundedContext` limiti (6000) gerçek ölçümde
aşıldı (max 6291, iki-sinyal + ilişki + direction-position kombinasyonu).
Kaynak: `safetyPolicy` tek başına 3782 byte (23 guardrail) — bu,
§10'un "bütün must ve mustNot davranışları promptta temsil edilmeli"
zorunluluğunun doğal sonucu, kırpılabilir bir şişkinlik değil. Limit
6500'e **gerçek ölçüme dayanarak** yükseltildi; tahminle PASS verilmedi.

Yaklaşık token tahmini (byte/4, kaba bir sezgisel değer — yeni tokenizer
bağımlılığı eklenmedi): bundle başına medyan ~3180 token.

## 11. Golden replay

IG-2'nin 18 golden case'i, gerçek `compose_bounded_prompt()` ile
paketlenip `validate_interpretation_output.py`'den geçirildi: **18/18
PASS, 0 leakage.**

**Önemli uyumluluk bulgusu:** IG-2'nin golden case'leri tek bir 35-90
kelime aralığına yazılmıştı; gerçek ölçümde 18'i de 35-48 kelime
arasında — IG-3'ün "concise" (35-60) aralığına tam giriyor, "balanced"
(50-90) aralığının altında kalıyor. Golden replay bu yüzden "concise"
tercihine karşı çalıştırıldı, "balanced"a değil. Bu, iki fazın kendi
verisinde bir hata değil, dokümante edilmiş bir arayüz notudur.

Golden metinleri prompta few-shot örnek olarak **gömülmedi** — yalnız
offline doğrulama için kullanıldı.

## 12. No chain-of-thought

System prompt §8 "SILENT VALIDATION" bölümü modelden gerekçeli düşünce
zinciri istemez; `interpretation-output.schema.json`'da `reasoning`/
`analysis`/`thoughtProcess`/`rationaleChain` alanı **yoktur** (yapısal
olarak, yalnız talimatla değil). `validate_interpretation_output.py`
ayrıca metin içinde sızmış CoT ifadelerini tarar (adım adım
düşündüğümde, iç muhakemem, vb.) — ama "bunu adım adım
değerlendirebilirsiniz" gibi kullanıcıya yönelik, tamamen güvenli
öneri cümlelerini yanlışlıkla yakalamaz (bkz. test suite "CoT leak
false positive" doğrulaması).

## 13. Runtime isolation

`git diff a16816a..HEAD -- src/app src/server src/components` boş.
Hiçbir production dosyası `prompt-composer` veya
`compose_bounded_prompt` string'ini içermez (test suite'in kendi
isolation testleri tarafından doğrulanır).

## 14. Known limitations

- Soft/golden-replay puanlaması bu fazda da (IG-2'deki gibi) kendi
  kendine değerlendirmedir.
- **Bu faz prompt bundle'ın yapısal sınırlarını ve output contract'ı
  doğrular. Canlı bir LLM'in prompt-injection girişimlerine davranışsal
  olarak direnmesini kanıtlamaz.**
- IG-2/IG-3 kelime-aralığı uyumsuzluğu (bkz. §11) çözülmedi, yalnız
  dokümante edildi.
- `interpretation-output.schema.json` ile mevcut production
  `ClaudeInterpretationOutputSchema` arasında bir eşleme/adaptasyon
  katmanı yoktur (bkz. §2 "fark eden noktalar").

## 15. Open questions (bu fazda varsayımla cevaplanmadı)

1. Anthropic adapter bundle'ı nasıl map edecek?
2. System prompt provider seviyesinde ayrı mı taşınacak?
3. Structured JSON mode kullanılabilecek mi?
4. Provider JSON schema desteği var mı?
5. Retry sayısı ne olacak?
6. Invalid output repair mi, tek retry mı?
7. Model timeout limiti ne olacak?
8. Maliyet/token bütçesi ne olacak?
9. Prompt injection için davranışsal live-model evaluation nasıl yapılacak?
10. Prompt/response loglanacak mı?
11. Hassas kullanıcı soruları nasıl redakte edilecek?
12. Kule dışındaki kartlar için template aynı mı olacak?
13. Üç kart sentezi tek çağrı mı, kart başına çağrı mı olacak?
14. Independent/blind quality reviewer kim olacak?
15. IG-2/IG-3 kelime-aralığı uyumsuzluğu nasıl çözülecek — golden
    case'ler mi yeniden yazılacak, yoksa "concise" mi kalıcı hedef
    olacak? (bu fazın kendi bulgusu, listeye eklendi)
