# Tower Offline Interpretation Evaluation (IG-2)

**Runtime entegrasyonu yoktur. Canlı Anthropic/OpenAI API çağrısı
yoktur. API anahtarı kullanılmaz. Network erişimi gerekmez.**

Bu klasör, IG-1'in Kule Interpretation Graph pilotunun gerçek kullanıcı
bağlamlarına bağlandığında (a) doğru bağlam parçalarını seçtiğini, (b)
gizli çıkarım yapmadığını, (c) pozisyon anlamını koruduğunu, (d)
kehanet/profesyonel-tavsiye üretmediğini, (e) tekrar etmeyen ve
anlaşılır yorum bağlamı oluşturabildiğini **offline** olarak test eden
sentetik bir değerlendirme setidir.

## Dosyalar

- `tower-routing-cases.json` — 63 pozitif + 12 negatif yönlendirme
  vakası. Her pozitif vaka, `compile_context_packet.py`'nin üretmesi
  beklenen referansları (`expected`) taşır; her negatif vaka bir
  `ContextCompilerError` bekler.
- `tower-golden-cases.json` — 18 insan tarafından yazılmış (LLM çıktısı
  değil) referans yorum. Söz sayısı sınırları ve yasaklı ifade
  taramaları `evaluate_tower_offline.py` tarafından doğrulanır.
- `tower-adversarial-cases.json` — 20 sentetik güvensiz çıktı, §12'nin
  20 hard-gate kategorisinin her birine en az bir vaka.
- `evaluation-rubric.json` — 8 boyutlu, 0-2 puanlı yumuşak kalite
  rubriği + PASS eşikleri. `scoringMethod` alanı, bu fazda puanların
  kendi kendine (yazarın kendisi tarafından) verildiğini açıkça
  belirtir — kör bir üçüncü taraf veya canlı LLM değerlendirmesi
  değildir.
- `reports/tower-offline-evaluation.md` — `evaluate_tower_offline.py`
  çalıştırıldığında otomatik üretilen sonuç raporu.

## Sentetik veri ilkesi

Bu klasördeki hiçbir vaka gerçek kullanıcı verisi veya gerçek kişi/
müvekkil bilgisi içermez. Kriz vakaları (bkz.
`src/__tests__/unit/interpretation-graph-evaluation.test.ts`
"Crisis isolation" bölümü) ayrıntılı veya grafik içerik taşımaz; mevcut
projenin kendi test paketinde zaten kullanılan, aynı ölçüde temkinli
sentetik örneklerle tutarlıdır (`src/__tests__/unit/api-readings.test.ts`).

## Nasıl çalıştırılır

```
python3 tools/interpretation-graph/compile_context_packet.py <input.json>
python3 tools/interpretation-graph/evaluate_tower_offline.py
python3 tools/interpretation-graph/mutate_unsafe_outputs.py [seed]
npm test -- interpretation-graph-evaluation
```

## Bilinen sınırlamalar (gizlenmedi)

- Soft rubric puanları bu fazda kendi kendine verilmiştir (yazar =
  değerlendirici). Kör/canlı-LLM değerlendirmesi IG-3'ün açık
  sorularından biridir.
- Yalnız Kule kartı kapsanır. 22 karta ölçekleme ayrı bir onay
  gerektirir.
- Adversarial kategorilerden 4'ü (unconfirmed-signal-usage,
  fabricated-visual-symbol, multiple-primary-hypotheses,
  multiple-closing-questions) yapısal kontrollerle (metin pattern'i
  değil, veri şekli/sayımı ile) yakalanır — `evaluate_tower_offline.py`
  bunu açıkça "structural" olarak etiketler, metinsel hard-gate
  detector'larıyla karıştırmaz.
