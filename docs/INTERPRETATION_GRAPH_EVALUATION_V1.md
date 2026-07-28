# Interpretation Graph Evaluation V1 — IG-2 Tower Offline Evaluation

**Faz:** IG-2 — Tower Offline Interpretation Evaluation
**Branch:** `feature/ig2-tower-offline-evaluation`
**Baseline:** `feature/ig1-tower-interpretation-graph` @ `f52a25d`
**Bu fazda runtime entegrasyonu, canlı API çağrısı, network erişimi yoktur.**

## Amaç

IG-1'in ürettiği Kule Interpretation Graph verisinin, gerçek kullanıcı
bağlamlarına (pozisyon × konu × amaç × açık sinyal × kart ilişkisi)
bağlandığında ölçülebilir şekilde: (a) doğru bağlam parçalarını
seçtiğini, (b) kullanıcı hakkında gizli çıkarım yapmadığını, (c)
pozisyon anlamını koruduğunu, (d) kehanet/profesyonel-tavsiye
üretmediğini, (e) tekrarsız ve anlaşılır bir yorum bağlamı
oluşturabildiğini kanıtlamak.

## IG-1 düzeltmeleri (bu fazın ilk adımı)

Evaluation'a başlamadan önce, IG-1'in kapanış raporundaki iki sayım
hatası (`docs/INTERPRETATION_GRAPH_V1.md`'deki correction note) ve
`data/interpretation-graph/cards/16-tower.json` içindeki üç yönlendirici
soru/focus metni düzeltildi:

- `contexts.family` — gerçekten gerilim olduğunu varsayan dilden
  nötrleştirildi.
- `contexts.uncertainty` — rahatsızlık/zorlanma varsayan dilden
  nötrleştirildi.
- `userSignalLenses.control-scope-clarification` — aynı şekilde.

**Dördüncü, önceden fark edilmemiş bir düzeltme de bu fazın kendi
assumption-audit aracı tarafından bulundu**:
`userSignalLenses.loss-concern.reflectionQuestion`, açık sinyal
seçilmiş olsa bile kullanıcının korktuğunu varsayıyordu
("korktuğunuz" → "ilişkilendirdiğiniz" olarak değiştirildi). Bu, aracın
gerçek değer ürettiğinin kanıtıdır — yalnız üç adı verilen düzeltmeyle
sınırlı kalmadı.

## Mimari

```
data/interpretation-graph/evaluation/
├── README.md
├── tower-routing-cases.json      — 63 pozitif + 12 negatif vaka
├── tower-golden-cases.json       — 18 insan-yazımı referans yorum
├── tower-adversarial-cases.json  — 20 sentetik güvensiz çıktı
├── evaluation-rubric.json        — 8 boyut, 0-2 puan, PASS eşikleri
└── reports/tower-offline-evaluation.md — otomatik üretilen sonuç

tools/interpretation-graph/
├── lib/
│   ├── tr_normalize.py           — Türkçe İ/ı-güvenli normalize + eşleştirme
│   ├── safety_patterns.py        — 20 hard-gate metinsel dedektörü
│   └── assumption_audit.py       — varsayım-tarayan soru denetimi
├── compile_context_packet.py     — deterministik bounded-context derleyici
├── evaluate_tower_offline.py     — tüm setleri çalıştırıp raporu üretir
├── mutate_unsafe_outputs.py      — seed'li, deterministik unsafe mutasyon üretici
├── check_hard_gates_cli.py       — TS test paketi için CLI köprüsü
└── tr_normalize_cli.py           — TS test paketi için CLI köprüsü

src/__tests__/unit/
└── interpretation-graph-evaluation.test.ts — 54 test
```

## Neden Python tarafında tek kaynak, TS tarafında subprocess?

İki paralel regex/kural kümesi tutmak, tam olarak bu projenin bu
oturumda iki kez düştüğü hatayı (Türkçe İ/ı için JS'in ASCII-only
`\b`/`\w` davranışı) tekrar üretme riski taşır. Bunun yerine
`tools/interpretation-graph/lib/` tek kaynak olarak tutulur;
`interpretation-graph-evaluation.test.ts`, gerçek Python
implementasyonunu `child_process` üzerinden **black-box** test eder —
aynı kuralın JS'te sessizce farklı davranmasını yapısal olarak
imkânsız kılar.

## Turkish İ/i/ı/I çözümü

`tr_normalize.py`, iki ayrı sorunu ele alır:

1. **Case-fold:** `İ` (noktalı büyük I) → `i`, `I` (ASCII büyük I) →
   `ı` (noktasız), İngilizce'nin tersi bir eşleme — çoğu runtime'ın
   varsayılan `.lower()`'ı bunu yanlış yapar.
2. **Word-boundary:** Python'ın `re` modülü `str` desenlerinde
   varsayılan olarak Unicode-farkındadır (JavaScript'in aksine), ama
   bu modül yine de `\b`'ye güvenmez — `str.isalpha()` tabanlı token
   ayrımı kullanır, böylece hangi regex motorunda çalıştırılırsa
   çalıştırılsın aynı sonucu verir.

**Özel durum: "tanı" (teşhis) vs "tanıdık" (aşina).** İkisi de
"tanı-" ile başlar ama farklı sözcüklerdir. Genel bir morfolojik
çözümleyici yazmak yerine, bu ikisini ayıran küçük, belgelenmiş,
kasıtlı olarak eksiksiz-olmayan bir liste kullanıldı
(`is_diagnosis_tani_token`) — §16'nın kendi talimatı ("Regex yalnız
yeterli değilse token tabanlı kontrol kullan") tam olarak bunu
öngörüyor.

## Sonuçlar özeti

Tam rapor: `data/interpretation-graph/evaluation/reports/tower-offline-evaluation.md`
(her `evaluate_tower_offline.py` çalıştırmasında yeniden üretilir).

| Kategori | Sonuç |
|---|---|
| Routing accuracy | 63/63 (%100) |
| Negative-case rejection | 12/12 (%100) |
| Golden hard-gate/structural | 18/18 temiz |
| Soft score ortalaması | 2.00 (eşik: 1.60) — **bkz. sınırlama aşağıda** |
| Adversarial detection | 20/20 (%100) |
| Mutation detection | 10/10 (%100), deterministik |
| Context leakage | 0 |
| Assumption audit (kart node + golden) | 0 kalan bulgu |
| Test suite | 574/574 (520 baseline + 54 yeni) |

**Final decision: PASS-WITH-NOTES.**

## Bilinen sınırlama: soft-score kendi kendine değerlendirme

18 golden case'in 8 boyutlu rubric puanları, bu case'leri yazan aynı
oturum tarafından verildi (`evaluation-rubric.json` →
`scoringMethod`). Bu, kör bir üçüncü taraf değerlendirmesi veya canlı-
LLM-hakemli bir puanlama değildir — bu fazda hiçbir API çağrısı
yapılmadığı için mümkün de değildi. **Bu dürüstçe açıklanmıştır, hard
gate/routing/mutation/leakage/assumption sonuçlarının aksine "kanıtlanmış"
olarak sunulmamıştır.** Bağımsız veya canlı-hakemli bir puanlama geçişi
IG-3'ün açık sorularından biridir.

## Kapsam sınırı

- Yalnız Kule kartı kapsanır.
- Gerçek kullanıcı verisi kullanılmadı; bütün vakalar sentetiktir.
- Kriz izolasyonu, mevcut `classifyIntake`/`isCrisisFlag`'i **değiştirmeden**,
  yalnız gerçek davranışını okuyarak test edildi (bkz. ilgili test
  dosyasındaki "Crisis isolation" mantığı — mevcut kriz motoru bu
  fazda hiç dokunulmadı).
- 22 karta ölçekleme, runtime entegrasyonu ve bağımsız/canlı-hakemli
  puanlama IG-3+ kararlarıdır.
