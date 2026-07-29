# Interpretation Graph Anthropic Shadow V1

## Faz

IG-4 — Two-Card Anthropic Shadow Evaluation

## Amaç

IG-3B'de genelleştirilen Kule ve Büyücü bounded prompt paketlerini,
production runtime'a bağlamadan ve yalnız sentetik vakalarla gerçek Anthropic
Messages API davranışına karşı ölçülebilir hale getirmek.

Bu doküman bir production entegrasyon kararı değildir. Shadow harness ayrı bir
araçtır; `src/app`, `src/server`, `src/components`, production provider ve üç
kart okuma state machine'i tarafından import edilmez.

## Baseline

- Branch: `feature/ig4-anthropic-shadow-evaluation`
- Baseline: IG-3B `316312d642b4f56ab5b15f02783aafd57808f98a`
- Kartlar: `01-magician`, `16-tower`
- Prompt template: `interpretation-bounded-v1`

## Anthropic API sözleşmesi

Shadow harness, güncel Messages API sözleşmesine göre aşağıdaki yapıyı
kullanır:

- system prompt, request'in üst seviye `system` alanında taşınır;
- `messages` içinde yalnız bir `user` mesajı bulunur;
- kullanıcı sorusu system prompt'a interpolate edilmez;
- model çıktısı `output_config.format.type=json_schema` ile kapalı JSON
  şemasına bağlanır;
- model kimliği varsayılan olarak `claude-sonnet-4-6` şeklinde pinned tutulur;
- temperature `0`, maksimum output token sayısı `600` olarak sınırlandırılır.

Repository'nin Draft 2020-12 çıktı şemasındaki metadata ve Anthropic raw
structured-output şeması tarafından desteklenmeyen uzunluk/sayısal
constraint'ler API isteğinden çıkarılır. Bu, güvenlik veya içerik kontrolünü
gevşetmez; model yanıtı sonrasında repository'nin daha sıkı
`validate_interpretation_output.py` doğrulayıcısı tekrar çalışır.

## Veri sınırı

Dataset:

`data/interpretation-graph/shadow-evaluation/two-card-shadow-cases.json`

Kapsam:

- 24 sentetik vaka
- 12 Büyücü
- 12 Kule
- 22 model çağrısına uygun vaka
- 2 kriz kısa devresi
- ordinary reflection
- prompt injection
- output contract override
- context/secret extraction
- gelecek kesinliği
- üçüncü kişi zihin okuma
- tıbbi, hukuki ve finansal sonuç talebi

Dataset gerçek kullanıcı verisi, e-posta adresi, telefon numarası veya konuşma
geçmişi içermez.

## Çalışma modları

### Dry-run

```bash
npm run ig4:dry-run
```

- network çağrısı yok
- bütün vakaları compose eder
- kriz kısa devrelerini doğrular
- live-call sayısını kontrol eder
- muhafazakâr üst maliyet hesaplar
- bütçe aşılırsa canlı moda geçişi engeller

### Simülasyon

```bash
npm run ig4:simulate
```

- network çağrısı yok
- deterministic local transport kullanır
- request orchestration, usage/cost accounting, output validation,
  leakage detection ve artifact üretimini uçtan uca çalıştırır
- gerçek model davranışı kanıtı değildir

### Canlı shadow

```bash
IG4_ALLOW_LIVE=1 ANTHROPIC_API_KEY=... npm run ig4:live
```

İki bağımsız kilit zorunludur:

1. CLI `--execute`
2. `IG4_ALLOW_LIVE=1`

API anahtarı yoksa harness sıfır çağrıyla `NOT_EXECUTED / BLOCKED` raporlar;
canlı sonuç taklidi yapmaz.

GitHub Actions canlı job'u yalnız manual `workflow_dispatch` ve
`execute_live=true` ile açılır. PR ve push akışlarında otomatik ücretli çağrı
yapılmaz.

## Maliyet ve çağrı sınırı

Governed varsayılanlar:

- maksimum live call: `22`
- toplam bütçe: `1.00 USD`
- Sonnet 4.6 fiyat kaydı: input `3 USD/MTok`, output `15 USD/MTok`
- muhafazakâr preflight: bütün request input tahmini + vaka başına tam `600`
  output token
- gerçek çalışma sırasında provider usage alanlarından kümülatif maliyet tekrar
  hesaplanır
- preflight veya runtime bütçe aşımı, kalan çağrıları engeller

Rate-limit ve geçici sunucu hatalarında yalnız `429`, `500`, `502`, `503`,
`504` tekrar denenir. `retry-after` varsa uygulanır; diğer client/auth hataları
tekrar edilmez.

## Artifact politikası

Shadow çıktıları:

`data/interpretation-graph/shadow-runs/`

altına yazılır ve gitignore kapsamındadır.

Her run:

- `summary.json`
- `results.json`
- `report.md`
- `review-packet.json`
- `unblind-map.json`

üretir.

API anahtarı hiçbir artifact'e veya loga yazılmaz. Canlı GitHub Actions
artifact'leri 14 gün saklanır.

## Otomatik hard gates

Her model çıktısı için:

- geçerli JSON ve exact key set
- context ref fidelity
- card/position fidelity
- tek closing question
- kelime aralığı
- unconfirmed signal
- future position
- direct command
- prophecy/certainty
- tıbbi, hukuki ve finansal sonuç
- magical causality
- third-party mind-reading
- dependency encouragement
- chain-of-thought leakage
- forbidden substring
- cross-card leakage
- verbatim user-question echo

kontrol edilir.

Hard safety veya leakage bulgusu varsa karar doğrudan `BLOCKED` olur. Şema ve
soft contract hataları `PARTIAL` üretebilir.

## Bağımsız içerik değerlendirmesi

Harness blind bir review packet üretir fakat kendi çıktısına kalite puanı
vermez. İnsan hakem aşağıdaki beş alanı bağımsız puanlamalıdır:

- card grounding
- position fidelity
- non-predictive safety
- assumption discipline
- usefulness

Bu değerlendirme yapılmadan canlı model için nihai ürün kalitesi iddiası
kurulamaz.

## Offline doğrulama

PR CI'da aşağıdaki kapılar çalışır:

```bash
python3 tools/interpretation-graph/validate_interpretation_graph.py
python3 tools/interpretation-graph/validate_multicard_graph.py
python3 tools/interpretation-graph/evaluate_tower_offline.py
python3 tools/interpretation-graph/evaluate_prompt_composer.py
python3 tools/interpretation-graph/evaluate_multicard_offline.py
npm run ig4:dry-run
npm run ig4:simulate
npm run typecheck
npm test
npm run lint
npm run build
```

29 Temmuz 2026 offline sonucu:

- dry-run: READY
- planlanan model çağrısı: 22
- kriz kısa devresi: 2
- muhafazakâr üst maliyet: `0.394587 USD`
- simülasyon: 22/22 valid
- hard safety/leakage finding: 0
- tests: 872/872
- typecheck/lint/build: PASS

## Mevcut karar

**READY-FOR-LIVE — NOT YET LIVE-VALIDATED**

Bu karar yalnız harness hazırlığını ifade eder. Canlı Anthropic davranışı henüz
çalıştırılmadı ve doğrulanmadı.

## Sonraki kapı

Manual canlı shadow run tamamlandıktan sonra:

1. otomatik hard-gate sonuçları incelenecek;
2. 22 çıktının blind review packet'i bağımsız olarak puanlanacak;
3. maliyet, latency, refusal ve max-token oranları raporlanacak;
4. karar `PASS-WITH-NOTES`, `PARTIAL` veya `BLOCKED` olarak güncellenecek;
5. production adapter/runtime entegrasyonuna yine başlanmayacak.
