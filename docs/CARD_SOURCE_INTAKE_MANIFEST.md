# Card Source Intake Manifest — C1–C5 Unblocking Requirements

**Tarih:** 2026-08-06
**Durum:** `SOURCE-GATED` — 22 kartın 20'si için kaynak yok
**Amaç:** C1–C5 fazlarının başlayabilmesi için tam olarak neyin gerektiğini yazmak.

---

## 1. Neden bu belge var

Master program, kalan 20 Major Arcana kartının NotebookLM kaynaklarına dayalı olarak normalize edilmesini istiyor. Faz 0'da ölçtüm: **kart anlamı kaynağı yalnızca 2 kart için mevcut.**

Program kuralı açık: *"NotebookLM kaynağı olmayan kart anlamlarını genel bilgiden uydurma."*

Bir kart anlamını kaynak olmadan yazabilirdim — tarot literatürü yaygın olarak bilinir. **Yazmadım ve yazmamalıyım.** Bunun nedeni ürünün kendi mimarisi: kart node'ları `sourceLayer` (kaynağa dayalı) ile `reflectionLayer` (ürün tasarımı) ayrımı üzerine kurulu ve her node bir `provenance.sourceNotesPath` taşıyor. Kaynaksız bir `sourceLayer`, bu ayrımı anlamsız hale getirir ve denetlenebilirlik iddiasını çürütür.

---

## 2. Mevcut durum

| Kart | Node | Kaynak notu | Durum |
|---|---|---|---|
| `01-magician` | ✅ | ✅ | Normalize edilmiş, `runtimeEnabled: false` |
| `16-tower` | ✅ | ✅ | Normalize edilmiş, `runtimeEnabled: false` |
| Diğer 20 kart | ❌ | ❌ | **Başlatılamaz** |

`data/research-intake/notebooklm/` içindeki 4 dosya **ürün ve etik araştırmalarıdır** (user agency, gap register, tarot agency principles). Kart anlamı araştırması **değildir**.

---

## 3. Eksik kartlar (kanonik kimlikle)

### C1
`02-high-priestess` · `03-empress` · `04-emperor` · `05-hierophant`

### C2
`06-lovers` · `07-chariot` · `08-strength` · `09-hermit`

### C3
`10-wheel-of-fortune` · `11-justice` · `12-hanged-man` · `13-death`

### C4
`14-temperance` · `15-devil` · `17-star` · `18-moon`

### C5
`19-sun` · `20-judgement` · `21-world` · `00-fool`

> Kanonik kimlikler `data/cards/` içindeki mevcut dosyalarla eşleşmelidir. Tower pilotunda NotebookLM `16-the-tower` önermiş, repository'nin gerçek kimliği `16-tower` olduğu için değiştirilmiştir. Aynı kontrol her kart için yapılmalıdır.

---

## 4. Her kart için gereken kaynak paketi

Mevcut iki kartın izlediği yapı (`16-tower-source-notes.md`) referanstır. Her kart için gereken:

| # | Öğe | Neden |
|---|---|---|
| 1 | Ham NotebookLM çıktısı | `sourceLayer` bunun üzerine kurulur |
| 2 | Kullanılan NotebookLM kaynaklarının listesi | İzlenebilirlik |
| 3 | Kartın merkezi anlamı ve temel gerilimi | `sourceLayer.meaning`, `centralTension` |
| 4 | Temalar (3–5) | `sourceLayer.themes` |
| 5 | **"Bu kart şu anlama gelmez"** maddeleri | `sourceLayer.doesNotMean` — yanlış yorumu önler |
| 6 | Semboller | `sourceLayer.symbols` — **yalnız governed artwork'te gerçekten görünenler** |
| 7 | Kaynaklar arası çelişkiler | Sessizce seçim yapılmamalı |
| 8 | Desteklenmeyen iddialar | `null` bırakılacak alanlar |
| 9 | Editöryel kararlar | Neyin yumuşatıldığı/çıkarıldığı |
| 10 | Gözden geçiren ve tarih | Sorumluluk |

### Zorunlu editöryel normalizasyon

Tower pilotunda uygulanan ve her kartta tekrarlanması gereken dönüşümler:

- Kesinlik ifadeleri yumuşatılır: *"olacak"* → *"olabilir"*, *"kesinlikle"* → çıkarılır.
- Doğrudan emirler (*"ayrılın"*, *"bırakın"*) yansıtma sorularına dönüştürülür.
- Marka/deck adı (RWS vb.) runtime guardrail'lerine **girmez**.
- NotebookLM'in sesli/görsel üretimleri **otorite kaynağı sayılmaz** — yalnız taslak.
- `sourceLayer` (kaynağa dayalı) ile `reflectionLayer` (ürün tasarımı) **açıkça ayrılır**.

---

## 5. Her kart node'unun karşılaması gereken sözleşme

`data/interpretation-graph/schema/card-node.schema.json` — **yeni şema icat edilmeyecek.**

Zorunlu alanlar: `schemaVersion`, `id`, `displayName`, `englishName`, `arcanaNumber`, `arcana`, `sourceLayer`, `reflectionLayer`, `safetyRefs`, `provenance`.

**Değişmez güvenlik kuralı — her yeni kart için:**

```json
"provenance": {
  "runtimeEnabled": false,
  "reviewRequiredBeforeRuntime": true,
  "sourceNotesPath": "data/interpretation-graph/evidence/<id>-source-notes.md"
}
```

`RUNTIME_ENABLEMENT_AUTHORIZED=false` olduğu sürece hiçbir yeni kart runtime'a açılamaz.

---

## 6. Her kart için gereken testler

Mevcut `interpretation-graph` test paketi bunları zaten uyguluyor; yeni kartlar aynı kapıdan geçmelidir:

- Şema doğrulaması
- Kanonik kimlik ve numaralandırma
- Yönlendirme (routing) pozitif/negatif vakaları
- **Kartlar arası sızıntı yokluğu** (bir kartın sembolü/temaları başka karta geçmemeli)
- Yasak iddia kontrolleri (gelecek kesinliği, üçüncü şahıs zihin okuma, profesyonel tavsiye)
- Kaynak referansı bütünlüğü

### Anlamca yakın kart çiftlerine özel dikkat

Bu çiftler yönlendirmede karışmaya en yatkın olanlardır ve her biri için ayrı negatif vaka gerekir:

`High Priestess`/`Hermit` · `Emperor`/`Hierophant` · `Strength`/`Chariot` · `Justice`/`Judgement` · `Death`/`Tower` · `Star`/`Sun` · `Moon`/`High Priestess` · `Devil`/`Lovers` · `Wheel`/`World`

---

## 7. Batch kabul kriterleri

Her C fazı için: 4 kart + kaynak paketi + normalize node + fixture + validator + kanıt raporu + draft PR.

**Bir batch başarısızsa sonraki batch başlatılmaz.**

---

## 8. Bağımlı fazlar

| Faz | Durum | Bağımlılık |
|---|---|---|
| C1–C5 | `SOURCE-GATED` | Bu belgedeki kaynak paketleri |
| IG-5 (22 kart doğrulaması) | `BLOCKED` | C1–C5 |
| IG-6 (üç kart sentezi) | `BLOCKED` | IG-5 |
| IG-7 (runtime adapter) | Kısmen yapılabilir | Tam değer için IG-5/6 |

IG-6 ayrıca kart çifti ilişkilerini gerektirir. 22 kart için 462 yönlü çiftin tamamının elle yazılması **zorunlu değildir**; tasarım kararı olarak dört kategori ayrılmalıdır: yazılmış ilişki, ontolojiden türetilmiş ilişki, nötr yedek, desteklenmeyen. **Modelin ilişki uydurmasına izin verilmez.**

---

## 9. Gereken insan adımı

C fazlarının başlayabilmesi için:

1. Kalan 20 kart için NotebookLM araştırması üretilmeli.
2. Çıktılar `data/research-intake/notebooklm/` altına, mevcut `TEMPLATE.md` biçiminde konmalı.
3. Her kart için §4'teki 10 maddelik paket tamamlanmalı.
4. Bir insan gözden geçiren atanmalı.

Bu adımlar tamamlandığında C1 dörtlü batch olarak başlatılabilir.

**Bu adımlar tamamlanmadan kart içeriği üretilmeyecektir.**
