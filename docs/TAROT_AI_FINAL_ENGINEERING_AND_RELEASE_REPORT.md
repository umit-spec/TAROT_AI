# TAROT_AI — Final Engineering and Release Report

**Tarih:** 2026-08-06
**Kapsam:** Faz 0 + H1–H5 (güvenlik sertleştirme programı)
**Dal:** `claude/tarot-ai-master-program-70afqk` → PR #5 (draft)
**Base:** `feature/ig4-anthropic-shadow-evaluation` @ `0b83880`
**Genel karar:** `PARTIAL` — güvenlik fazları tamamlandı, içerik ve doğrulama fazları bloklu

---

# BÖLÜM A — Teknik olmayan okuyucu için

## A1. Ürün nedir?

Türkçe, yapay zekâ destekli bir tarot uygulaması. Kullanıcı bir soru yazıyor, sistem üç kart çekiyor ve sembolik bir yorum üretiyor. Ürünün kendi kurallarına göre bu bir kehanet değil, düşünme aracıdır.

## A2. Ne düzeldi?

**1. Kriz filtresi kullanılamaz durumdan çalışır duruma geldi.**

Başlangıçta ölçtüğüm hâli şuydu: *"İşimde çok zorlanıyorum, ne yapmalıyım?"* sorusu **cinsel saldırı krizi** olarak işaretleniyordu. Aynı anda *"Eşim bana vuruyor ve korkuyorum"* ifadesi **hiç yakalanmıyordu** — o kullanıcı normal bir tarot okuması alıyordu.

24 vakalık ölçümde: 7/24 doğru → **24/24 doğru**. Yanlış alarm 12 → **0**. Kaçırılan kriz 5 → **0**.

**2. Zararlı yapay zekâ çıktısı filtresi gerçekten çalışır hale geldi.**

85 zararlı örnekten **66'sı** eski filtreden geçiyordu. Büyük harfle yazılan **her** yasak ifade filtreyi atlıyordu. Şimdi **0'ı** geçiyor — ve 62 iyi kalitede örnek yanlışlıkla engellenmiyor.

**3. Sınırsız fatura riski kapatıldı.**

Önceden 200.000 karakterlik bir soru kabul ediliyordu ve ücretli API'ye giden yolda hiçbir tavan yoktu. Şimdi: soru sınırı, istek boyutu tavanı, eşzamanlılık sınırı, günlük tavan ve **acil kapatma düğmesi** var.

**4. Kullanıcıya sorusunun nereye gittiği söyleniyor.**

Ürün bugüne kadar, yazılan metnin üçüncü taraf bir yapay zekâ sağlayıcısına gönderildiğini **hiçbir yerde belirtmiyordu.**

**5. 112 tek dokunuşla aranabiliyor.**

## A3. Ne hâlâ riskli?

| Risk | Neden önemli |
|---|---|
| Kart içeriği 22'de 2 | Kalan 20 kart için kaynak yok; uydurulmadı |
| Hiçbir şey gerçek modelle test edilmedi | Canlı API çağrısı yetkisi yok |
| Harcama sayacı sunucu başına | Gerçek tavan sağlayıcı konsolunda ve **ayarlanmadı** |
| Hız sınırı taklit edilebilir olabilir | Ölçülmedi |
| Ekran okuyucu doğrulanmadı | Kriz akışı bunu özellikle gerektirir |
| Görsel lisansı | Hukuki karar bekliyor |

## A4. Yayınlanabilir mi?

| Seviye | Karar |
|---|---|
| Yerel geliştirme | **EVET** |
| İç demo | **EVET** |
| Davetli kapalı pilot | **KOŞULLU** — sağlayıcı konsolunda harcama limiti şart |
| Anonim public beta | **HAYIR** |
| Ticari yayın | **HAYIR** |

## A5. Sonraki adım nedir?

Sizin vermeniz gereken kararlar §D1'de. En kritik ikisi: **IG zincirini ana dala indirmek** ve **Anthropic konsolunda harcama limiti ayarlamak**.

---

# BÖLÜM B — Teknik ek

## B1. Yapılan işin ölçeği

| Ölçüm | Değer |
|---|---|
| Commit | 6 |
| Değişen dosya | 46 |
| Eklenen satır | ~6.000 |
| Test | 879 → **1.351** (+472) |
| Kanıt raporu | 8 |

## B2. Faz sonuçları

| Faz | Karar | Ana çıktı |
|---|---|---|
| Faz 0 | `COMPLETED` | Durum keşfi; her bulgu kodda yeniden ölçüldü |
| H1 | `PASS-WITH-NOTES` | Girdi sınırları, kriz çakışmaları, açıklama, başlıklar |
| H2 | `PASS-WITH-NOTES` | Türkçe eşleştirme katmanı, üç seviyeli model |
| H3 | `PASS-WITH-NOTES` | 14 kategorili çıktı politikası |
| H4 | `PASS-WITH-NOTES` | Kill switch, harcama tavanı, eşzamanlılık, gövde tavanı |
| H5 | `PARTIAL` | Gizlilik, CSP (Report-Only), CI, erişilebilirlik |
| C1–C5 | `SOURCE-GATED` | Kaynak yok — kart anlamı uydurulmadı |
| IG-5, IG-6 | `BLOCKED` | C1–C5'e bağımlı |
| IG-7 | `NOT STARTED` | Tam değer için IG-5/6 gerekli |
| LIVE-1 | `AUTHORIZATION-GATED` | Ücretli çağrı yetkisi yok |
| Asset lisans | `LEGAL-GATED` | Hukuki inceleme gerekli |

## B3. Ölçümler

### Kriz kapısı (24 vakalık sabit prob seti)

| | Faz 0 | H1 | H2 |
|---|---|---|---|
| Doğru | 7/24 | 23/24 | **24/24** |
| Yanlış alarm | 12 | 0 | **0** |
| Kaçırılan | 5 | 1 | **0** |

Tam H2 veri seti: **144 sentetik vaka, 0 uyuşmazlık.**

### Çıktı güvenliği

| | Eski | Yeni |
|---|---|---|
| Zararlı (n=85) geçen | **66** | **0** |
| Güvenli (n=62) engellenen | 0 | **0** |

**Her iki sayı da kapsam ölçümüdür, doğruluk oranı değildir.** Gerçek kullanıcılar ve gerçek model çıktıları bu setlerde olmayan şeyler üretecektir.

## B4. Mimari değişiklikler

| Modül | İşlev |
|---|---|
| `server/limits.ts` | Merkezi girdi sınırları |
| `server/intake/turkish-text.ts` | Türkçe katlama, ek listesi, yazım hatası toleransı |
| `server/intake/crisis-classifier.ts` | Üç seviyeli kriz değerlendirmesi |
| `server/reading-engine/safety-policy.ts` | 14 kategorili çıktı politikası |
| `server/observability/spend-guard.ts` | Günlük tavan, kill switch |
| `server/observability/concurrency.ts` | Sınırlı eşzamanlılık |
| `server/observability/provider-gate.ts` | Ücretli çağrı için tek kapı |
| `server/http/read-json-body.ts` | Akış sırasında gövde tavanı |
| `server/http/redact-issues.ts` | Hata cevabı redaksiyonu |

## B5. Kritik tasarım kararları

**1. `isFree`, `isPaid` değil.** Bayrağı koymayı unutan yeni bir ücretli sağlayıcı harcama tavanını sessizce atlardı. `isFree` ile hiçbir şey beyan etmeyen sağlayıcı kapıya tabidir.

**2. İki katmanlı çıktı savunması.** Politika ihlali tüm çıktıyı reddeder (denylist'i bir kez tökezleten model daha ince ihlaller taşıyor olabilir); alan bazlı yönetim yapısal sorunlar ve derinlemesine savunma içindir.

**3. Onar değil, reddet.** Model metnini "düzeltmek" güvensiz üretim gerçeğini gizler ve hiçbir insanın yazmadığı bir cümle üretir.

**4. Benzetme/abartı istisnaları intihara asla uygulanmaz.** Yapısal olarak kısıtlandı ve teste bağlandı.

**5. Para uydurulmaz.** Fiyat, kaynağı ve tarihiyle birlikte tanımlanmadıkça maliyet alanı hiç yayılmaz — sıfır olarak da yayılmaz, çünkü sıfır bir iddiadır.

## B6. Red-team bulguları — kendi işime

**Her faz kendi yeni makinesine saldırıldı ve her fazda hata bulundu.**

| Faz | Bulgu | Sonuç |
|---|---|---|
| H1 | 12 yanlış alarmı kapatırken **5 yenisi** üretilmişti | Düzeltildi, sabitlendi |
| H2 | 2 yeni yanlış alarm | 1 düzeltildi, 1 `KNOWN_LIMITATIONS`'a teste bağlı yazıldı |
| H3 | Politika **ürünün kendi güvenlik dilini** engelliyordu | Düzeltildi, iki yönlü sabitlendi |
| H3 | Gizleme çözücü çok kelimeli muafiyetleri bozuyordu | Çözücü düzeltildi |
| H4 | `MAX_PROVIDER_CALLS_PER_DAY=0` sessizce **2000'e** düşüyordu | Düzeltildi |
| H5 | Hata cevapları kullanıcı girdisini geri yansıtıyordu | Redakte edildi |

H3'teki bulgu en ciddisiydi: *"mutlaka bir doktora danışın"* ve *"bu okuma bir teşhis değildir"* engelleniyordu. **Güvenlik dilini bastıran bir güvenlik politikası, hiç politikası olmamasından kötüdür.**

## B7. Test disiplini

**Hiçbir mevcut test zayıflatılarak geçilmedi.**

Süreçte 8 test kırıldı:
- **4'ü benim ürettiğim gerçek hatalardı** → kod düzeltildi, test değil.
- **3'ü** bilinçli `tel:` sözleşme değişikliğiydi → XSS iddiaları **güçlendirildi**.
- **1'i** boş desen listesini uydurmayla doldurmamdı → kod düzeltildi.

## B8. Açık riskler

| Risk | Şiddet | Faz |
|---|---|---|
| Gerçek model çıktısı hiç test edilmedi | **Yüksek** | LIVE-1 |
| `undici` canlı istek yolunda, analiz edilmedi | **Yüksek** | Bağımlılık |
| Harcama sayacı process-local | **Yüksek** | Kalıcılık |
| Hız sınırı taklit edilebilir olabilir | Orta | Ölçüm |
| CSP zorlanmadı | Orta | Deploy |
| Ekran okuyucu doğrulanmadı | Orta | Manuel |
| Kart içeriği 22'de 2 | **Yüksek (ürün)** | C1–C5 |
| Görsel lisansı | **Yüksek (hukuki)** | Legal |
| Yeniden ifade (paraphrase) yakalanamaz | Orta | Yapısal |

## B9. Teknik borç

| Kalem | Not |
|---|---|
| Global harcama tavanı | Paylaşılan durum gerekli |
| Global hız sınırı | Aynı |
| `emotional_support` kullanıcı metni | Anayasa güncellemesi gerekli |
| ALO 183 | Product Owner kararı |
| `UI_PREMIUM_V1.md` §20.4 | `tel:` sözleşmesiyle güncellenmeli |
| Metrik backend'i | Bağlanmadı |
| Format drift | Ayrı PR olmalı |

---

# BÖLÜM C — Yol haritası

## 7 gün
1. IG zincirini ana dala indir (PR #3, #4 ve alttaki ig1–ig3).
2. **Anthropic konsolunda organizasyon harcama limiti ayarla.**
3. PR #5'i incele; `UI_PREMIUM_V1.md` ve ALO 183 kararlarını ver.
4. `undici` zafiyetini `fetch` kullanımına karşı analiz et.

## 30 gün
5. Preview deploy → CSP ihlallerini topla → zorla.
6. Hız sınırı güven modelini ölç (runbook §6.1).
7. Anayasa'ya `emotional_support` metnini ekle ve UI'a bağla.
8. Erişilebilirliği gerçek yardımcı teknolojiyle doğrula.
9. Kalan 20 kart için NotebookLM araştırmasını üret.

## 90 gün
10. C1–C5 batch'lerini çalıştır.
11. IG-5 → IG-6 → IG-7.
12. LIVE-1 (bütçe ve yetkiyle).
13. Görsel lisansını hukuken çöz.
14. Paylaşılan durum → global tavanlar.

---

# BÖLÜM D — İnsan yetki kontrol listesi

## D1. Bloklayıcı kararlar

| # | Karar | Kim | Neden bloklayıcı |
|---|---|---|---|
| 1 | IG zincirini ana dala indir | Repo sahibi | Ana dalda ürün kodu yok |
| 2 | **Sağlayıcı harcama limiti** | Operatör | **Tek sert tavan; kod tarafı process-local** |
| 3 | PR #1/#2 mükerrerliğini çöz | Repo sahibi | Aynı iş iki PR'da |
| 4 | `UI_PREMIUM_V1.md` §20.4 | UX sahibi | Bilinçli sözleşme değişikliği |
| 5 | ALO 183 | Product Owner | Bağlayıcı güvenlik kararı |
| 6 | `emotional_support` metni | Product Owner | Anayasa birebir metin şartı |
| 7 | Görsel lisansı | Hukuk | Production kullanımı |
| 8 | 20 kart araştırması | Product Owner | C1–C5 bloklu |
| 9 | `undici` analizi | Mühendislik | Canlı istek yolu |

## D2. Değişmeyen yetki kapıları

`MERGE_AUTHORIZED=false` · `DEPLOY_AUTHORIZED=false` · `LIVE_PROVIDER_AUTHORIZED=false` · `PAID_API_BUDGET_USD=0` · `DEPENDENCY_UPGRADE_AUTHORIZED=false` · `RUNTIME_ENABLEMENT_AUTHORIZED=false`

Bu programda hiçbiri ihlal edilmedi: merge yok, deploy yok, canlı çağrı yok, ücretli API yok, bağımlılık değişikliği yok, ve **bütün IG kart node'ları `runtimeEnabled: false`.**

## D3. Public beta minimum kapısı

| Gereklilik | Durum |
|---|---|
| Kriz güvenliği kabul edildi | ✅ |
| Çıktı güvenliği kabul edildi | ✅ |
| Gizlilik açıklaması | ✅ |
| Girdi/gövde sınırları | ✅ |
| Eşzamanlılık sınırı | ✅ |
| Harcama kill switch | ✅ |
| Metrikler | ✅ (backend yok) |
| Güvenlik başlıkları | ✅ (CSP Report-Only) |
| CI izinleri | ✅ |
| Erişilebilir kriz yolu | ⚠️ statik ✅, AT ❌ |
| Hız sınırı güven modeli | ❌ |
| Çözülmemiş kritik/yüksek bulgu yok | ❌ (`undici`) |
| Sağlayıcı harcama limiti | ❌ |
| Hukuki konumlandırma | ❌ |

**8 ✅ / 1 ⚠️ / 4 ❌ → public beta HAYIR.**

---

# BÖLÜM E — Durum özeti

| Kategori | Kalemler |
|---|---|
| **COMPLETED** | Faz 0, H1, H2, H3, H4 |
| **PARTIAL** | H5 (kod tamam, doğrulama bekliyor) |
| **VERIFIED EXISTING** | Kriz kapısı konumu, sunucu tarafı sınıflandırma, preview strict şeması, log redaksiyonu, `reflectionPrompt` yedek modeli, IG-1…IG-4 zinciri |
| **SOURCE-GATED** | C1–C5 (20 kart) |
| **BLOCKED** | IG-5, IG-6 |
| **NOT STARTED** | IG-7 |
| **AUTHORIZATION-GATED** | LIVE-1, merge, deploy, runtime enablement |
| **LEGAL-GATED** | Görsel lisansı, ticari konumlandırma |
| **NOT APPLICABLE** | Yok |

---

# BÖLÜM F — Kanıt disiplini

- Master promptta atıf yapılan audit `.docx` dosyaları **çalışma alanında bulunamadı**; hiçbir bulgu rapordan kopyalanmadı, hepsi kodda yeniden ölçüldü.
- Bütün test verileri **sentetiktir** ve bu oturumda yazılmıştır. **Hiçbir gerçek kullanıcı verisi kullanılmadı.**
- Kapsam ölçümleri doğruluk oranı olarak sunulmadı.
- Ölçülmemiş şeyler `NOT VERIFIED` olarak işaretlendi; WCAG uyumluluğu **iddia edilmedi**.
- Hiçbir fiyat, telefon numarası veya kart anlamı uydurulmadı.
- Kriz filtresi klinik araç olarak sunulmadı.
- Hiçbir canlı sağlayıcı çağrısı yapılmadı.

---

## Kanıt dosyaları

`MASTER_PROGRAM_STATE_RECOVERY.md` · `H1_QUICK_HARDENING_EVIDENCE.md` · `H2_CRISIS_SAFETY_EVIDENCE.md` · `H3_OUTPUT_SAFETY_EVIDENCE.md` · `H4_COST_ABUSE_AND_OPERATIONS_EVIDENCE.md` · `H5_PRIVACY_CI_A11Y_EVIDENCE.md` · `OPERATIONS_RUNBOOK.md` · `CARD_SOURCE_INTAKE_MANIFEST.md` · `SECURITY_DEBT_LOG.md`

---

*Rapor sonu. Güvenlik sertleştirme programı (H1–H5) tamamlandı. Sonraki ilerleme §D1'deki insan kararlarına bağlıdır.*
