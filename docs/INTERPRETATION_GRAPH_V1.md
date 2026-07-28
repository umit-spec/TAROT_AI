# Interpretation Graph V1 — IG-1 Tower Pilot

**Faz:** IG-1 — Tower Interpretation Graph Pilot
**Branch:** `feature/ig1-tower-interpretation-graph`
**Baseline:** `governance/crg1-commercial-release-review` @ `f05a74a` (itself RC-2 `80ec612` + governance docs only, zero `src/` diff)
**Bu fazda runtime entegrasyonu yoktur.**

> **IG-2 correction note (2026-07-28):** IG-1'in kapanış raporunda iki
> sayım hatası yapıldı ve IG-2'nin repo doğrulaması sırasında
> yakalandı: (1) oluşturulan dosya sayısı "13" olarak raporlandı, gerçek
> sayı **14**'tür; (2) toplam global guardrail sayısı "23" olarak
> raporlandı (bu rakam aslında bir kartın `safetyRefs` referans
> listesinin uzunluğuydu — 9 must + 14 mustNot, "may" hariç), oysa
> `ontology/global-guardrails.json`'daki gerçek toplam **29**'dur
> (9 must + 6 may + 14 mustNot). Bu, yalnız kapanış raporundaki bir
> aritmetik/raporlama hatasıydı — hiçbir veri dosyası, şema veya commit
> geçmişi bu düzeltmeyle değiştirilmedi/silinmedi; hata burada açıkça
> kayıt altına alınıyor, gizlenmiyor.

## Problem statement

Mevcut ürün, her kart için tek, sabit, konudan bağımsız bir yorum
metni üretir (`data/cards/*.json` → deterministic reading engine →
Claude narration). Bu basit ve güvenli bir model, ama bağlama duyarlı
değil: aynı kart, aynı pozisyonda, kullanıcının konusu/amacı/açık
sinyalleri ne olursa olsun aynı temel içerikten türer.

Interpretation Graph, ileride bağlama duyarlı bir yorum motorunun
kullanabileceği, **doğrulanabilir referanslara sahip, üç katmanlı**
bir bilgi modeli sorusuna cevap arar: kaynağa dayalı sembolik anlam
ile ürünün kendi tasarladığı yansıtma mantığı nasıl ayrı tutulur, ve
bu ayrım nasıl makine tarafından denetlenebilir hale getirilir?

Bu doküman yalnız **mimariyi ve pilotu** kaydeder; bir rollout kararı
değildir.

## Architecture

```
data/interpretation-graph/
├── README.md                          — kapsam, ilkeler, nasıl-eklenir
├── schema/                            — JSON Schema Draft 2020-12
│   ├── card-node.schema.json          — tek kart node'unun şekli
│   ├── ontology.schema.json           — 4 ontology dosyasının kayıt şekilleri
│   └── session-context.schema.json    — gelecekteki eşleştirme girdisi
├── ontology/                          — karttan bağımsız, paylaşılan tanımlar
│   ├── relationship-types.json        — 7 kart-ilişkisi türü
│   ├── user-signals.json              — 10 normalize edilmiş kullanıcı sinyali
│   ├── user-goals.json                — 5 kullanıcı amacı
│   └── global-guardrails.json         — 9 must + 6 may + 14 mustNot
├── cards/
│   └── 16-tower.json                  — tek pilot kart node'u
├── evidence/
│   └── 16-tower-source-notes.md       — provenance/normalizasyon kaydı
└── maps/
    └── 16-tower-mind-map.md           — Mermaid + metinsel outline

tools/interpretation-graph/
└── validate_interpretation_graph.py   — stdlib-only structural validator

src/__tests__/unit/
└── interpretation-graph.test.ts       — 30 test (structure/refs/safety/isolation)
```

## Data layers

Her kart node'u üç katmanı ayırır:

1. **Source-backed symbolic layer** (`sourceLayer`) — kart kaynaklarına
   dayalı temalar, çekirdek anlam, gerilim, "anlatmadığı şeyler",
   yalnız governed artwork'te doğrulanmış semboller.
2. **Product-designed reflection layer** (`reflectionLayer`) — ürünün
   kendi tasarımı: pozisyon lensleri (past/present/direction), 8
   konu bağlamı, 10 kullanıcı-sinyali lensi, 8 adaptif soru, 7 kart-
   ilişkisi türüne referans. Bunların hiçbiri "evrensel tarot
   gerçeği" olarak sunulmaz.
3. **Global safety layer** (`safetyRefs` → `ontology/global-guardrails.json`)
   — karttan bağımsız. Guardrail metinleri hiçbir kart dosyasına
   kopyalanmaz; tek kaynak ontology dosyasıdır.

## Kule pilotu

Tek kart: `16-tower`. Gerçek governed artwork
(`public/assets/tarot-cards/v2/16_Kule.webp`) doğrudan incelenerek 4
sembol doğrulandı (lightning, tower, flames, falling-figures); aday
listedeki `crown` görselde bulunmadığı için elendi. Mevcut
`data/cards/16-tower.json` değiştirilmedi; her iki dosyanın
`id`/`displayName`/çekirdek anlamı bilinçli olarak tutarlı tutuldu
ama dosyalar bağımsızdır (bkz. `data/interpretation-graph/README.md`
"Neden ayrı" bölümü).

## Matching model (açıklama düzeyinde)

```
Card core
  + position lens (past | present | direction)
  + explicit topic                 (kullanıcının seçtiği bağlam)
  + explicit goal                  (ontology/user-goals.json)
  + explicit/user-confirmed signal (ontology/user-signals.json, en fazla — teşhis değil)
  + neighboring-card relationship  (ontology/relationship-types.json, gelecekte 2. kart eklendiğinde)
  + global guardrails              (ontology/global-guardrails.json)
  = bounded interpretation context
```

**Bu formül output metnini deterministik hale getirmez.** LLM yalnız
doğrulanmış, sınırlı bağlam parçalarını doğal Türkçede sentezler —
mevcut ürünün `buildUserMessage()` yapısındaki
"developerInstruction (yapılandırılmış, güvenilir) vs. userData
(yalnız ham kullanıcı metni)" ayrımıyla aynı ilke, genişletilmiş
haliyle.

## Güvenlik modeli

Üç savunma katmanı, mevcut ürünün kendi modeliyle aynı ruhta:

1. **Veri düzeyinde**: `safeInterpretations`/`reflectionQuestions` gibi
   alanlar zaten olasılıksal dilde yazılır (`must` guardrail'i
   `reflective-probabilistic-language`).
2. **Referans bütünlüğü**: her sinyal/amaç/ilişki/guardrail referansı
   ontology'de gerçekten var olmalı; unknown ref validator/test
   tarafından reddedilir.
3. **Statik tarama**: validator + test suite, kesinlik/teşhis/emir/
   profesyonel-sonuç/üçüncü-kişi-zihin-okuma pattern'lerini "safe"
   alanlarda tarar — ama `doesNotMean`/`avoid`/`prohibitedInferences`/
   `risk` gibi "bu YAPILMAZ" alanlarında aynı kelimelerin geçmesine
   izin verir (bunlar tanım gereği yasaklı kavramı adlandırmak
   zorundadır).

Mevcut runtime'ın kendi savunmaları
(`src/server/reading-engine/validate.ts` — `CATEGORY_1/2/4`
forbidden-phrase listeleri, `REFLECTION_PREDICTION`/
`REFLECTION_THIRD_PARTY`/`REFLECTION_DIAGNOSIS` regex'leri) bu pilot
tarafından **hiç değiştirilmedi** — ikisi paralel, birbirinden
bağımsız güvenlik katmanlarıdır.

## Session context

`schema/session-context.schema.json`, gelecekteki bir eşleştirme
motorunun okuyacağı **açık** kullanıcı verisini tanımlar:
`{ topic, goal, explicitSignals: [{ signalId, source, confidence }] }`.
`confidence` yalnız `explicit`/`user-confirmed` olabilir —
`inferred`/`diagnosed` şemada yoktur. Bu şemanın hiçbir örneği bu
pilotta üretilmedi; hiçbir route/component onu kullanmıyor.

## Future runtime integration boundary

Bu faz **hiçbir üretim kod yolunu değiştirmedi.** Kanıt:

- `git diff f05a74a..HEAD -- src/app src/server src/components` boş.
- `src/__tests__/unit/interpretation-graph.test.ts`'in "isolation"
  bölümü, `src/server/**` ve `src/app/**` içinde
  `interpretation-graph` string'inin hiçbir dosyada geçmediğini
  doğrular.
- `data/cards/16-tower.json`, CRG-1 baseline'ına göre (`f05a74a`)
  değişmedi.

Runtime entegrasyonu, ayrı, açık bir onay ve ayrı bir faz gerektirir
(bkz. Açık sorular §12).

## Validation

`tools/interpretation-graph/validate_interpretation_graph.py` —
stdlib-only (yeni npm/pip bağımlılığı eklenmedi; `jsonschema` paketi
bu repoda mevcut değil), 20 maddelik yapısal/referans/güvenlik
kontrolü. `README.md`'de bunun tam standarda-uygun bir JSON Schema
motoru olmadığı açıkça belirtilir.

```
$ python3 tools/interpretation-graph/validate_interpretation_graph.py
Interpretation Graph validator — 8 JSON file(s) scanned
PASS — all structural, reference, and safety-language checks passed.
```

## Open questions (bu fazda varsayımla cevaplanmadı)

1. User signal seçimleri UI'da ne zaman toplanacak?
2. En fazla kaç takip sorusu sorulacak?
3. Signal seçimini kullanıcı doğrulayacak mı?
4. Kartlar arası relationship type nasıl belirlenecek?
5. Bu ilişki manuel ontology mi yoksa rule engine mi olacak?
6. LLM'e kaç context parçası gönderilecek?
7. Token budget ne olacak?
8. Aynı yorum tekrarını nasıl azaltacağız?
9. Kaynak referansları kullanıcıya gösterilecek mi?
10. Pilot içerik kim tarafından editoryal onaylanacak?
11. Kule pilotu hangi offline evaluation setiyle test edilecek?
12. 22 karta ölçekleme kapısı ne olacak?

## Rollout gates

- [ ] Şema/validator PASS (bu faz: ✅)
- [ ] Test suite PASS, baseline altına düşmeden (bu faz: 520/520, ✅)
- [ ] İsimlendirilmiş bir insanın `provenance.status`'ü
      `pilot-reviewed`'in ötesine taşıması
- [ ] IG-2 — Tower Offline Interpretation Evaluation (örnek kullanıcı
      senaryolarıyla red-team testi) — **henüz başlamadı**
- [ ] 22 karta ölçekleme kararı — **henüz verilmedi**
- [ ] Runtime entegrasyonu onayı — **henüz verilmedi**
