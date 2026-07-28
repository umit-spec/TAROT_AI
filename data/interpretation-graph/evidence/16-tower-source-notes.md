# Kaynak ve Provenance Notu — 16-tower (Interpretation Graph pilot)

**Kapsam:** `data/interpretation-graph/cards/16-tower.json`
**Durum:** `imported-from-notebooklm`, `normalized`,
`not-source-verified-in-repository`, `pilot-only`

## Süreç

1. Ürün sahibi, NotebookLM'de Kule kartı için bir araştırma/taslak
   çıktısı üretti ve bunu bu depodaki bir Claude Code oturumuna
   (ChatGPT değil — bu belge önceki bir taslakta "ChatGPT'ye
   aktarıldığı" ifadesini içeriyordu, ancak fiili aktarım bu
   oturuma, Claude Code'a yapıldı; bu düzeltme burada açıkça
   kayıt altına alınıyor) aktardı.
2. **Ham NotebookLM çıktısı doğrudan production'a alınmadı.** Bu
   dosya, o çıktının normalize edilmiş, ürünün kendi güvenlik ve
   veri modeli kurallarına uydurulmuş halidir.
3. NotebookLM'in önerdiği CardId `16-the-tower`, repository'nin
   gerçek kanonik kimliği `16-tower` (`data/cards/16-tower.json`)
   ile değiştirildi. `16-the-tower` hiçbir pilot veya production
   dosyasında kullanılmadı.
4. Kesinlik/yönlendirici ifadeler yumuşatıldı: "olacak" → "olabilir",
   "kesinlikle" → kaldırıldı, doğrudan eylem emirleri ("ayrılın",
   "bırakın") refleksiyon sorularına dönüştürüldü.
5. **Source-backed sembolik katman (`sourceLayer`) ile ürün
   tarafından tasarlanan yansıtma katmanı (`reflectionLayer`) açıkça
   ayrıldı.** `reflectionLayer` içindeki pozisyon/bağlam/sinyal
   içerikleri bu ürünün kendi tasarımıdır; hiçbiri "evrensel tarot
   gerçeği" ya da dış kaynağın birebir aktarımı olarak sunulmadı.
6. **Sesli/görsel kayıtların (NotebookLM'in kendi "Audio Overview"
   veya benzeri üretimlerinin) hiçbiri evrensel tarot anlamı olarak
   sayılmadı** — yalnız bir taslak/ilham kaynağı olarak ele alındı,
   ayrı bir doğrulama adımı olmadan otorite kaynağı sayılmadı.
7. **RWS (Rider-Waite-Smith) referansı runtime/pilot guardrail'lerinden
   çıkarıldı.** `ontology/global-guardrails.json` içindeki
   `governed-artwork-symbols-only` / `literal-governed-artwork-symbol`
   kuralları yalnız "governed artwork üzerinde gerçekten görülen
   semboller" der; hiçbir marka/kaynak deck adı geçmez.
8. **Mevcut `data/cards/16-tower.json` bu pilot tarafından
   değiştirilmedi.** Bu dosya, mevcut deterministic reading engine'in
   kullandığı gerçek kart kaydından tamamen ayrı, deneysel bir
   koleksiyonun parçasıdır (`data/interpretation-graph/`).
9. `provenance.runtimeEnabled = false` olarak sabitlendi. Hiçbir kod
   yolu (`src/server/**`, `src/app/**`, `src/components/**`) bu
   dosyayı import etmez — bkz. `src/__tests__/interpretation-graph.test.ts`
   izolasyon testleri.
10. **Bağımsız içerik/güvenlik incelemesi runtime öncesi gereklidir.**
    Bu pilot, isimlendirilmiş bir insan tarafından
    `provenance.status`'ün `pilot-reviewed`'den ötesine
    (`red-teamed`/`runtime-approved` gibi) geçirilmesi için henüz
    incelenmedi.

## Sembol doğrulama notu

Aday sembol listesi (lightning, tower, crown, flames, falling-figures)
bu pilotun kendisi tarafından, gerçek governed artwork dosyası
(`public/assets/tarot-cards/v2/16_Kule.webp`) doğrudan görsel olarak
incelenerek doğrulandı — NotebookLM'in metin çıktısına körü körüne
güvenilmedi. **`crown` (taç) sembolü bu incelemede görselde
bulunamadığı için node'a eklenmedi**; bu, promptun kendi "görselde
açıkça bulunmayan sembolü node'a ekleme" kuralının doğrudan
uygulanmasıdır.

## Citation kaynağı açıklaması

Bu pilotta, NotebookLM passage citation'ları **birebir source-of-truth
sayılmadı**. Repository'de gerçekten bulunan ve doğrulanabilen tek
kaynak zinciri şudur:

- `data/cards/16-tower.json` — mevcut ürünün kendi çekirdek kart kaydı
  (bu pilot içeriği bu kayıtla çelişmeyecek şekilde tasarlandı, onu
  değiştirmedi).
- `data/knowledge-authoring/sources.json` — bu projenin ayrı, önceden
  var olan kaynak yönetişim kaydı (Waite 1910, Pollack 1980 gibi kart-
  anlamı için onaylı kaynaklar içerir). Bu pilot dosyası doğrudan bu
  kayda bir `sourceRef` alanıyla bağlanmaz (şema bunu tanımlamıyor);
  ancak `sourceLayer.meaning`/`centralTension`/`themes` içeriği, bu
  master prompt'un §13'te verdiği normalize edilmiş metinle birebir
  tutarlıdır ve önceki `docs/legal`-dışı pilot çalışmada (Kule kart-
  anlamı matrisi taslağı) aynı iki kaynağa (Waite 1910, Pollack 1980)
  atıfla üretilmişti.
- Governed artwork dosyası — sembol doğrulaması için birincil, gerçek
  kaynak (yukarıya bakınız).

Repository'de gerçekten bulunmayan bir NotebookLM citation'ı,
doğrulanmış bir atıf gibi sunulmadı.
