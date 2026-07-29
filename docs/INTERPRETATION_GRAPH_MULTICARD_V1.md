# Interpretation Graph Multi-Card V1 — IG-3B

**Faz:** IG-3B — Magician Normalization & Multi-Card Generalization  
**Baseline:** IG-3 `50d1060`  
**Branch:** `feature/ig3b-magician-multicard-generalization`  
**Runtime durumu:** Kapalı — canlı API, provider veya UI entegrasyonu yoktur.

## 1. Amaç

IG-3B iki ayrı riski aynı fazda ele alır:

1. NotebookLM tarafından üretilen Büyücü içerik hammaddesini repository'nin
   gerçek card-node şemasına, ontology kimliklerine ve güvenlik diline
   normalize etmek.
2. Kule pilotu için yazılan context compiler ve bounded prompt composer'ın
   yalnız tek karta aşırı uyumlu olmadığını iki farklı kartla offline olarak
   doğrulamak.

Bu faz bir içerik ve altyapı genelleme çalışmasıdır. Canlı model davranışı,
ürün runtime'ı veya üç kart sentezi bu kapsamda değildir.

## 2. Kapsanan kartlar

| CardId | Kart | Durum |
|---|---|---|
| `16-tower` | Kule | IG-1/IG-2 pilot node, regression referansı |
| `01-magician` | Büyücü | IG-3B ile eklenen ikinci experimental node |

Her iki node için de:

- `provenance.runtimeEnabled = false`
- `provenance.reviewRequiredBeforeRuntime = true`
- `past / present / direction` pozisyonları
- sekiz konu bağlamı
- on explicit/user-confirmed signal lensi
- global relationship ve guardrail referansları

korunur.

## 3. Büyücü kanonik kimliği

Kanonik kimlik yalnız `data/cards/01-magician.json` kataloğundan alınır:

- `id`: `01-magician`
- `displayName`: `Büyücü`
- `englishName`: `The Magician`
- `arcanaNumber`: `1`
- `arcana`: `major`

NotebookLM tarafından daha önce önerilen `01-the-magician` varyantı
repository kanonuyla eşleşmediği için reddedilmiştir.

## 4. NotebookLM'in rolü ve sınırı

NotebookLM çıktısı şu alanlarda hammadde olarak kullanılmıştır:

- kartın genel tema adayları
- pozisyon ve bağlam lensi adayları
- refleksiyon sorusu adayları
- prohibited assumption adayları
- görsel sembol adayları

NotebookLM aşağıdaki konularda source of truth değildir:

- CardId
- JSON Schema alan adları
- ontology veya guardrail ID'leri
- governed artwork doğrulaması
- repository validator sonucu
- runtime veya production-readiness kararı

NotebookLM passage etiketleri repository içinde bağımsız kaynak doğrulaması
veya bilimsel psikoloji kanıtı sayılmaz.

## 5. Governed artwork denetimi

Operative kart node'una yalnız governed artwork üzerinde açıkça doğrulanan
semboller alınmıştır.

- Production derivative:
  `public/assets/tarot-cards/v2/01_Buyucu.webp`
- Git blob SHA:
  `2b0d953b01478f1ad6d136453bc18f24220fbcbd`
- İncelenen kaynak export SHA-256:
  `3aa1b4c1bfb12fc220599fca88601279bf9ede31a5d15c9e2d4ac602e4f47a05`

Node'a alınan semboller:

1. Yukarı kaldırılmış değnek ve aşağı yönelen açık el
2. Masa üzerindeki farklı araçlar

Dışarıda bırakılan klasik deste adayları:

- lemniscate / sonsuzluk işareti
- ouroboros kemeri
- kırmızı güller ve beyaz zambaklar
- belirli tarihsel desteye ait literal dört-suit iddiası
- Rider-Waite-Smith markası veya deste-özel wording

Dışarıda bırakma gerekçeleri ve lineage notları
`data/interpretation-graph/evidence/01-magician-source-notes.md` içinde
tutulur.

## 6. Büyücü içerik normalizasyonu

Runtime-safe çekirdek şu eksenlere indirgenmiştir:

- mevcut kaynakları fark etme
- niyet ile uygulama arasındaki bağlantı
- odak ve öncelik belirleme
- bilgi, beceri ve pratik koşulları eşleştirme

Operative içerikten çıkarılan veya evidence katmanına taşınan ifadeler:

- manifestation / tezahür
- As Above, So Below
- Mercury / Civa
- sınırsız potansiyel
- bütün gerekli araçlara zaten sahip olunduğu iddiası
- eyleme geçme zamanı geldiği iddiası
- başarı veya sonuç garantisi

`direction`, bir gelecek tahmini veya yörünge değil; niyet, mevcut
kaynaklar, sınırlar ve doğrulanabilir seçenekler arasındaki ilişkinin
incelendiği consideration lens olarak kalır.

## 7. Multi-card context compiler

`tools/interpretation-graph/compile_context_packet.py` artık kartı sabit
`16-tower.json` yolundan yüklemez.

Yeni davranış:

1. `cardId` string olarak alınır.
2. `data/cards/*.json` kataloğunda kanonik kimlik doğrulanır.
3. `data/interpretation-graph/cards/{cardId}.json` node'u aranır.
4. Node kimliği ve `provenance.runtimeEnabled = false` kontrol edilir.
5. Yalnız seçilmiş kartın context packet'i üretilir.

Bilinmeyen katalog kimliği, graph node'u bulunmayan kart, uyuşmayan node ID
ve runtime-enabled node sessiz fallback olmadan reddedilir.

`load_graph()` için Tower varsayılanı yalnız önceki IG-2/IG-3 offline test
API'sini kırmamak amacıyla korunmuştur. Yeni multi-card çağrılar CardId'yi
açıkça geçirir.

## 8. Generic bounded prompt composer

Karta özel `tower-bounded-v1` template'i yerine yeni genel template:

`interpretation-bounded-v1`

kullanılır.

Dosya:

`data/interpretation-graph/prompt-composer/templates/interpretation-bounded-template.json`

System prompt kart adı, kart ID'si, kart anlamı veya sembolü içermez.
Kart-özel içerik yalnız trusted bounded context içinde taşınır.

Aynı pozisyon için Kule ve Büyücü:

- byte-identical system prompt
- aynı soru için aynı question hash
- farklı kart içeriği için farklı context hash
- kart-özel bounded context

üretmelidir.

## 9. Trust boundary

Üç alan ayrımı değişmeden korunur:

1. **Trusted fixed policy** — global guardrails
2. **Trusted bounded context** — seçilmiş kart node'u ve açık session refs
3. **Untrusted user question** — yalnız
   `userMessage.untrustedUserQuestion.text`

Kullanıcı sorusu:

- system prompt'a girmez
- bounded context'e girmez
- CardId, position, topic, goal, signal veya relationship değiştiremez
- output contract'ı değiştiremez

Prompt injection testleri yapısal containment'ı doğrular; canlı modelin
saldırılara davranışsal direncini kanıtlamaz.

## 10. Multi-card validator

`tools/interpretation-graph/validate_multicard_graph.py` aşağıdaki exact
kontrolleri gerçekleştirir:

- kapalı root/source/reflection/provenance alan setleri
- katalog kimliği eşleşmesi
- en az bir governed symbol
- exact üç pozisyon
- exact sekiz context
- ontology ile birebir on signal lensi
- signal key/ref eşleşmesi
- adaptive question trigger referansları
- relationship ve safety ref bütünlüğü
- evidence dosyasının varlığı
- runtime/review provenance sabitleri
- eski camelCase signal ID'lerinin yokluğu
- NotebookLM tarafından uydurulan guardrail ID'lerinin yokluğu
- operative content'te RWS/manifestation/mistik özel terimlerin yokluğu
- assumption audit sonucu

Bu validator, IG-1'in standard-library validator'ını değiştirmeden tamamlayıcı
bir exact-shape katmanı sağlar.

## 11. Offline değerlendirme verileri

Büyücü için commit edilen sentetik fixture'lar:

- `magician-routing-cases.json`: 48 pozitif + 4 negatif vaka
- `magician-golden-cases.json`: 12 human-authored contract referansı
- `magician-adversarial-cases.json`: 12 governed hard-gate örneği

Bunlar gerçek kullanıcı verisi veya live-model output değildir.

Ayrıca iki kartlı evaluator şunları çalıştırır:

- 92 routing kontrolü
- 72 injection containment kontrolü
- 12 golden replay
- 12 adversarial detector kontrolü
- 5 cross-card integrity kontrolü
- assumption audit
- cross-card core/symbol leakage kontrolü

## 12. Cross-card leakage standardı

Aşağıdakilerin tamamı sıfır toleranslıdır:

- Kule core meaning'in Büyücü bounded context'ine girmesi
- Büyücü core meaning'in Kule bounded context'ine girmesi
- kartlar arasında symbol label sızıntısı
- yanlış cardId seçimi
- kullanıcı sorusunun context refs'i değiştirmesi
- aynı soru için question hash'in kart değişimiyle değişmesi
- kart değişmesine rağmen context hash'in aynı kalması

## 13. Runtime izolasyonu

IG-3B şu alanlara dokunmaz:

- `src/app`
- `src/server`
- `src/components`
- production provider
- API route
- reading state machine
- UI

Yeni TypeScript dosyası yalnız `src/__tests__/unit/` altındadır.

## 14. CI kalite kapısı

PR'a özel `.github/workflows/ig3b-validation.yml` şu komutları gerçek GitHub
Actions runner'ında çalıştırır:

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

Checkout `fetch-depth: 0` kullanır; böylece önceki baseline commitlerine dayalı
isolation testleri CI içinde gerçekten çalışabilir.

## 15. Bilinen sınırlamalar

- Yalnız iki kart değerlendirilmiştir.
- Golden metinler bağımsız/kör hakem tarafından puanlanmamıştır.
- Adversarial fixture'lar küratörlü detector sözlüğünün bilinen kalıplarını
  doğrular; açık uçlu tüm kötü niyetli dil varyantlarını kapsamaz.
- Yapısal prompt-injection containment, canlı model davranış kanıtı değildir.
- Production `ClaudeInterpretationOutputSchema` ile tek-kart IG output
  contract'ı arasında adapter henüz yoktur.
- Üç kart sentezi ve kartlar arası yorum üretimi henüz uygulanmamıştır.
- Büyücü source-backed anlamlarının bağımsız kaynak editörü incelemesi açıktır.

## 16. Sonraki aşama sınırı

Sonraki önerilen faz yalnız:

**IG-4 — Two-Card Anthropic Shadow Evaluation**

IG-4'te yalnız sentetik sorularla, Kule ve Büyücü prompt bundle'ları gerçek
Anthropic modele shadow modunda gönderilir. Bu çalışma production runtime'a
bağlanmadan davranışsal prompt-injection, structured-output ve kalite ölçümü
yapmalıdır.
