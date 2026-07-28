# Interpretation Graph (pilot)

**Faz:** IG-1 — Tower Interpretation Graph Pilot
**Durum:** deneysel veri katmanı. **Hiçbir üretim kod yolu bu dizini
import etmez.** `runtimeEnabled: false` her kart node'unda sabittir.

## Bu yapı nedir?

Kullanıcıya gösterilen mevcut okuma davranışını değiştirmeden,
ileride bağlama duyarlı bir yorum motorunda kullanılabilecek,
yapılandırılmış, referansları doğrulanabilir bir bilgi katmanı
pilotu. Bu faz yalnız Kule (`16-tower`) kartını kapsar.

## Neden mevcut `data/cards/`dan ayrı?

`data/cards/16-tower.json`, bugün gerçekten çalışan deterministic
reading engine'in (`src/server/reading-engine/`) okuduğu tek kaynak
kayıttır ve bu pilot tarafından **değiştirilmedi**. Interpretation
Graph, o kaydın yerine geçen bir şey değil — pozisyon/bağlam/kullanıcı-
sinyali/kart-ilişkisi gibi çok daha ayrıntılı, gelecekte bağlama
duyarlı eşleştirme için tasarlanmış, ayrı ve deneysel bir katmandır.
İkisi arasında `id`/`displayName`/temel `meaning` düzeyinde bilinçli
tutarlılık sağlandı, ama dosyalar bağımsızdır.

## Source layer / reflection layer / safety layer ayrımı

Her kart node'u üç katmanı açıkça ayırır:

- **`sourceLayer`** — kart kaynaklarına dayalı (temalar, semboller,
  çekirdek anlam). Bu proje "evrensel tarot gerçeği" iddiası
  taşımaz; kaynaklar `evidence/*-source-notes.md` dosyasında kayıtlıdır.
- **`reflectionLayer`** — ürün tarafından tasarlanan pozisyon lensleri,
  bağlamlar, kullanıcı sinyalleri, adaptif sorular, kart ilişkileri.
  Bunlar bu ürünün kendi tasarım kararlarıdır, dış kaynağın birebir
  aktarımı değildir.
- **`safetyRefs`** — karttan bağımsız global guardrail ID'lerine
  referans (`ontology/global-guardrails.json`). Guardrail metinleri
  hiçbir kart dosyasına kopyalanmaz; tek kaynak ontology dosyasıdır.

## RuntimeEnabled neden false?

Çünkü bu faz yalnız veri altyapısı ve doğrulama fazıdır (IG-1 §3).
Reading engine entegrasyonu, API değişikliği, UI değişikliği veya
kart seçme algoritması değişikliği bu fazın kapsamı dışındadır.
`runtimeEnabled` alanı `false` olarak şema düzeyinde sabitlenmiştir
(`"const": false`) — bir gelecek fazın bunu `true` yapması, ayrı,
açık bir onay ve entegrasyon fazı gerektirir.

## NotebookLM'in rolü nedir?

Bir taslak/araştırma yardımcısıdır — tıpkı
`data/knowledge-authoring/sources.json`'daki
`notebooklm-major-arcana-research-2026-07` kaynağının zaten
kaydedildiği gibi. Ham NotebookLM çıktısı hiçbir zaman doğrudan bu
dizine kopyalanmadı; önce normalize edildi (bkz.
`evidence/16-tower-source-notes.md`).

## NotebookLM neden production engine değildir?

Çünkü (a) bu depoda hiçbir kod yolu NotebookLM'i çağırmaz veya ona
bağlanmaz, (b) NotebookLM çıktısı doğrulanabilir, kararlı bir API
sözleşmesi sunmaz, (c) bu projenin kendi kaynak-yönetişim kaydı
NotebookLM-kaynaklı içeriği hiçbir zaman tek başına kanıt saymaz
(`soleAuthorityAllowed` ilkesiyle aynı ruh). NotebookLM yalnız bir
insan editörün kullandığı bir taslak aracıdır.

## Yeni kart node'u nasıl eklenir?

1. `schema/card-node.schema.json`'a uyan bir `cards/<CardId>.json`
   dosyası oluştur.
2. Gerçek `CardId`'yi `data/cards/*.json`'dan al — asla NotebookLM'in
   önerdiği alternatif kimliği kullanma.
3. Yalnız governed artwork'te (`public/assets/tarot-cards/v2/*.webp`)
   gerçekten görülen sembolleri ekle.
4. `evidence/<CardId>-source-notes.md` dosyasını doldur.
5. `maps/<CardId>-mind-map.md` dosyasını oluştur.
6. `tools/interpretation-graph/validate_interpretation_graph.py`'yi
   çalıştır ve PASS al.
7. `runtimeEnabled: false` olarak bırak — bu, ayrı bir rollout
   fazının kararıdır.

## Hangi review kapıları gerekir?

- Şema/validator PASS.
- İsimlendirilmiş bir insanın `provenance.status`'ü
  `pilot-reviewed`'in ötesine taşıması (red-team/runtime-approval).
- 22 karta ölçekleme kararı ayrı, açık bir onay gerektirir (bkz.
  `docs/INTERPRETATION_GRAPH_V1.md` "Açık sorular" §12).
- Runtime entegrasyonu, ayrı bir faz (IG-2 sonrası) ve ayrı bir kod
  değişikliği onayı gerektirir.

## Explicit user context ilkesi

`schema/session-context.schema.json`, yalnız `explicit-user-selection`
veya `user-confirmed` kaynaklı sinyalleri kabul eder. `inferred` veya
`diagnosed` diye bir değer şemada yoktur — kart node'u kullanıcının
sinyalini kendi başına tespit etmez.

## No hidden psychological profiling

Hiçbir kart node'u veya ontology dosyası, kullanıcı hakkında açıkça
beyan edilmemiş, kalıcı bir profil ima etmez. `user-signals.json`
içindeki her kayıt `notADiagnosis: true` taşır.

## Direction ≠ future

`reflectionLayer.positions.direction`, mevcut ürünün "Yön" pozisyonuyla
aynı ilkeyi taşır: kesin gelecek, trajectory veya kader değildir;
kullanıcı kontrollü bir değerlendirme merceğidir. Bu ilke hem
`ontology/global-guardrails.json` → `direction-as-consideration-lens`
kuralında hem de kart node'unun `positions.direction.focus` metninde
açıkça yer alır.

## Kapsam sınırı

- Mevcut pilot **yalnız Kule kartını** kapsar.
- **Diğer 21 kartın toplu üretimi henüz onaylanmamıştır** — bu, ayrı
  bir gelecek fazın (IG-2 sonrası, açık bir "22 karta ölçekleme
  kapısı" kararıyla) konusudur.
