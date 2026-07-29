# Bounded Prompt Composer (IG-3 pilot)

**Runtime entegrasyonu yoktur. Canlı Anthropic/OpenAI API çağrısı
yoktur. API anahtarı kullanılmaz. Network erişimi gerekmez.**

IG-2'nin bounded context packet'ini, provider-neutral, trust-boundary'si
yapısal olarak ayrıştırılmış, makine-doğrulanabilir bir prompt bundle'a
dönüştüren offline pilot.

## Dosyalar

- `schema/prompt-bundle.schema.json` — bundle'ın tam şekli.
- `schema/interpretation-output.schema.json` — modelin dönmesi gereken
  TEK şekil (4 sabit alan, kapalı şema, chain-of-thought alanı yok).
- `templates/tower-bounded-template.json` — sabit system-prompt
  bölümleri (ROLE/PRODUCT BOUNDARY/TRUST BOUNDARY/…).
- `evaluation/prompt-composer-cases.json` — 78 pozitif+negatif vaka.
- `evaluation/prompt-injection-cases.json` — 36 sentetik injection
  vakası; yalnız **yapısal containment** kanıtlar, canlı model
  davranışını değil.
- `evaluation/output-contract-cases.json` — 33 vaka (10 geçerli + 23
  geçersiz çıktı).
- `evaluation/reports/tower-prompt-composer-evaluation.md` — otomatik
  üretilen sonuç raporu.
- `examples/synthetic-prompt-bundles.json` — yalnız örnek/dokümantasyon
  amaçlı, hiçbir modele gönderilmedi.

## Trust boundary (özet)

Kullanıcı sorusu yalnız `userMessage.untrustedUserQuestion.text`
alanında taşınır; `systemPrompt` veya `boundedContext` içine asla string
interpolation ile yerleştirilmez. Bu, `compose_bounded_prompt.py`'nin
mimari garantisidir — 36 injection vakasının tamamı bunu doğrudan test
eder (bkz. `docs/INTERPRETATION_GRAPH_PROMPT_COMPOSER_V1.md` §8).

## Nasıl çalıştırılır

```
python3 tools/interpretation-graph/compose_bounded_prompt.py <input.json>
python3 tools/interpretation-graph/validate_interpretation_output.py <output.json> <expected-refs.json> <preference>
python3 tools/interpretation-graph/evaluate_prompt_composer.py
npm test -- interpretation-graph-prompt-composer
```

## Bilinen sınırlamalar

- Bu faz yapısal sınırları ve output contract'ı doğrular; canlı bir
  LLM'in prompt-injection'a davranışsal direncini kanıtlamaz.
- IG-2'nin golden case'leri "concise" (35-60 kelime) aralığına
  giriyor, "balanced" (50-90) değil — golden replay bunu yansıtır.
- Yalnız Kule kartı kapsanır.
