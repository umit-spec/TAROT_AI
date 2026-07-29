# IG-3B — Magician Normalization & Multi-Card Generalization

## Faz

IG-3B — Magician Normalization & Multi-Card Generalization

## Karar

**PASS-WITH-NOTES**

## Branch ve baseline

- Branch: `feature/ig3b-magician-multicard-generalization`
- Baseline: IG-3 `50d10602ebb03cabb9bf6b953cc0bc94e2ab688d`
- Validated implementation SHA: `74194c73ca9f67407db019f4009f420dad2facd8`
- Draft PR: `#3`

## Magician canonical identity

`data/cards/01-magician.json` üzerinden doğrulanan kimlik:

- CardId: `01-magician`
- Türkçe ad: `Büyücü`
- İngilizce ad: `The Magician`
- Arcana: `major`
- Number: `1`

NotebookLM tarafından daha önce üretilen `01-the-magician` varyantı
kullanılmadı.

## Artwork audit

- Governed derivative: `public/assets/tarot-cards/v2/01_Buyucu.webp`
- Git blob SHA: `2b0d953b01478f1ad6d136453bc18f24220fbcbd`
- İncelenen source export SHA-256:
  `3aa1b4c1bfb12fc220599fca88601279bf9ede31a5d15c9e2d4ac602e4f47a05`

Node'a alınan doğrulanmış semboller:

1. `raised-wand-and-lowered-hand`
2. `table-tools`

Doğrulanmadığı için operative node'dan çıkarılan adaylar:

- lemniscate
- ouroboros
- kırmızı güller / beyaz zambaklar
- tarihsel deste-özel dört-suit iddiası
- RWS marka ve wording'i

## Normalization

NotebookLM hammaddesinden yapılan temel normalizasyonlar:

- `01-the-magician` → `01-magician`
- eski camelCase signal kimlikleri → gerçek ontology ID'leri
- NotebookLM tarafından üretilen guardrail ID'leri → gerçek repository refs
- `manifestation / tezahür` → niyet, bilgi, kaynak ve uygulama arasındaki
  bounded ilişki
- bütün kaynaklara sahip olunduğu varsayımı kaldırıldı
- eyleme geçme baskısı kaldırıldı
- korku, erteleme, direnç, gizli yetenek ve kontrolcülük varsayımları
  nötrleştirildi
- `direction`, gelecek veya yörünge olmaktan çıkarılıp consideration lens
  olarak korundu

## Schema ve ontology

Yeni node:

`data/interpretation-graph/cards/01-magician.json`

Exact yapısı:

- `schemaVersion`
- canonical identity
- `sourceLayer`
- `reflectionLayer`
- root `safetyRefs`
- closed `provenance`

İçerik kapsamı:

- 3 exact position
- 8 exact context
- 10 exact user-signal lens
- 5 adaptive question
- 7 relationship type ref
- 23 real global guardrail ref
- `runtimeEnabled: false`
- `reviewRequiredBeforeRuntime: true`

## Composer generalization

Kule'ye özel graph ve prompt sabitleri kaldırıldı:

- context compiler canonical `cardId` üzerinden node yükler
- catalog ve node ID eşleşmesi zorunludur
- graph node'u bulunmayan kart reddedilir
- runtime-enabled node reddedilir
- generic template version: `interpretation-bounded-v1`
- system prompt karttan bağımsızdır
- kart-özel anlam yalnız bounded context içinde taşınır

Tower için varsayılan `load_graph()` davranışı yalnız IG-2/IG-3 offline API
uyumluluğunu korumak amacıyla bırakılmıştır.

## Offline dataset

Commit edilen Büyücü fixture'ları:

- Routing: 48 pozitif + 4 negatif
- Golden contract: 12
- Adversarial: 12

İki kartlı evaluator sonuçları:

- Routing: `92`
- Prompt-injection structural containment: `72`
- Golden replay: `12`
- Adversarial detection: `12`
- Cross-card integrity checks: `5`
- Cross-card core/symbol leakage: `0`
- Assumption audit remaining: `0`

## Integrity

Aynı sentetik soru, farklı kart:

- question hash aynı
- context hash farklı
- aynı pozisyon için system prompt aynı
- bounded context seçilmiş karta özgü

## Validation commands

GitHub Actions run `30458631860` içinde aşağıdaki kapılar gerçek runner'da
başarıyla çalıştı:

```bash
python3 tools/interpretation-graph/validate_interpretation_graph.py
python3 tools/interpretation-graph/validate_multicard_graph.py
python3 tools/interpretation-graph/evaluate_tower_offline.py
python3 tools/interpretation-graph/evaluate_prompt_composer.py
python3 tools/interpretation-graph/evaluate_multicard_offline.py
npm run typecheck
npm test
npm run lint
npm run build
```

Sonuçlar:

- Original Interpretation Graph validator: PASS
- Exact multi-card validator: PASS — 2 card node
- Tower offline evaluator: PASS-WITH-NOTES
- Prompt composer evaluator: PASS-WITH-NOTES
- Multi-card evaluator: PASS-WITH-NOTES
- Typecheck: PASS
- Tests: **832/832** — 29 test file
- Lint: PASS
- Build: PASS

## Runtime isolation

Bu fazda production runtime entegrasyonu yapılmadı.

Değişiklik kapsamı:

- graph data ve evidence
- offline prompt template/compiler/composer
- offline validators/evaluators
- unit tests
- PR validation workflow
- documentation

`src/app`, `src/server` ve `src/components` altında production değişikliği
yoktur. Yeni `src/` değişikliği yalnız `src/__tests__/unit/` altındadır.

## Known limitations

- Yalnız Kule ve Büyücü değerlendirilmiştir.
- Golden içerikler bağımsız/kör hakemli kalite puanı değildir.
- Küratörlü adversarial fixture'lar açık uçlu bütün semantik saldırıları
  kapsamaz.
- Yapısal injection containment canlı model davranış kanıtı değildir.
- Canlı Anthropic çağrısı yapılmamıştır.
- Production output adapter ve retry/repair politikası tasarlanmamıştır.
- Üç kart sentezi henüz bu graph ile bağlanmamıştır.

## Sonraki önerilen aşama

Yalnız:

**IG-4 — Two-Card Anthropic Shadow Evaluation**

IG-4'e geçmeden durulmuştur.
