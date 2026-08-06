# Operations Runbook — Cost, Rate Limiting, Spend and Observability

**Oluşturuldu:** 2026-08-06 (H4)
**Kapsam:** Sağlayıcı maliyeti, hız sınırı, eşzamanlılık, harcama tavanı ve metrikler.

Bu belge, çalıştırılabilir kontrolleri **ve çalıştırılamayan/ölçülemeyen kısımları** birlikte listeler. Ölçülmemiş bir şey burada ölçülmüş gibi yazılmaz.

---

## 1. Acil durum: sağlayıcıyı hemen kapat

```
PROVIDER_ENABLED=0
```

Etkisi anında ve deploy gerektirmez (ortam değişkeni değişimi sonrası yeni instance'lar için). Sonuç:

- Hiçbir ücretli çağrı yapılmaz.
- Okuma **çalışmaya devam eder** — deterministik yola düşer.
- Log'da `fallbackReason: "provider-disabled"` görünür.

Ürün kapanmaz; yalnızca anlatım katmanı sadeleşir.

---

## 2. Yapılandırma

| Değişken | Varsayılan | Ne yapar |
|---|---|---|
| `PROVIDER_ENABLED` | `1` | Kill switch. `0`/`false` → sağlayıcı kapalı |
| `MAX_TOKENS_PER_DAY` | `1000000` | Günlük token tavanı (UTC gün) |
| `MAX_PROVIDER_CALLS_PER_DAY` | `2000` | Günlük çağrı tavanı |
| `MAX_COST_USD_PER_DAY` | — | **Yalnız fiyatlandırma tanımlıysa** çalışır |
| `PROVIDER_MAX_CONCURRENCY` | `4` | Aynı anda en fazla kaç sağlayıcı çağrısı |
| `PROVIDER_ACQUIRE_TIMEOUT_MS` | `5000` | Slot beklerken azami süre |
| `MAX_BODY_BYTES` | `65536` | HTTP gövde tavanı |
| `RATE_LIMIT_ENABLED` | prod'da açık | Hız sınırı |
| `RATE_LIMIT_PER_MINUTE` | `30` | Okuma isteği/dakika |
| `PREVIEW_RATE_LIMIT_PER_MINUTE` | `60` | Önizleme isteği/dakika |
| `ANTHROPIC_TIMEOUT_MS` | `20000` | Çağrı zaman aşımı |
| `ANTHROPIC_MAX_RETRIES` | `1` | Yeniden deneme |

### Fiyatlandırma — bilinçli olarak opsiyonel

Maliyet hesabı yalnız **dördü birden** tanımlıysa açılır:

```
ANTHROPIC_PRICE_INPUT_PER_MTOK
ANTHROPIC_PRICE_OUTPUT_PER_MTOK
ANTHROPIC_PRICE_SOURCE          # resmî fiyat sayfası URL'i
ANTHROPIC_PRICE_VERIFIED_ON     # YYYY-MM-DD
```

Eksik yapılandırma **yarım uygulanmaz, tamamen reddedilir**. Gerekçe: kaynağı ve tarihi kaydedilmemiş bir fiyat, tam olarak bu modülün üretmemek için var olduğu türden "kendinden emin ama yanlış" bir sayıdır.

Fiyatlandırma tanımlı değilse guard yine çalışır — token ve çağrı sayar, para göstermez.

**Bu repository'de doğrulanmış fiyat kaydı yoktur.** Fiyatları girmek, resmî Anthropic fiyat sayfasına bakıp kaynak ve tarihle birlikte kaydetmeyi gerektiren bir insan adımıdır.

---

## 3. Dürüst sınırlamalar

### 3.1 Sayaçlar process-local

Harcama sayacı ve eşzamanlılık sınırlayıcı **her instance'ta ayrı** tutulur. Serverless'te etkin tavan `(tavan × instance sayısı)` olur, `(tavan)` değil.

**Bu bir faturalama kontrolü değildir ve öyle sunulmamalıdır.** Runaway kullanıma karşı bir korkuluktur.

**Gerçek sert tavan:** Anthropic konsolundaki organizasyon harcama limiti. **Bunun ayarlanması gerekir** — bu bir insan adımıdır ve kodla yapılamaz.

Global tavan için paylaşılan durum (Postgres/Upstash/Redis) gerekir; bu, kalıcılık (persistence) çalışmasıyla birlikte ertelenmiştir — hız sınırlayıcı için zaten kayıtlı olan aynı erteleme.

### 3.2 Tavan aşımı payı

Kontrol çağrı **öncesinde** yapılır. Bu yüzden tavan, o anda uçuşta olan çağrılar kadar aşılabilir. Bu aşımı sınırlayan şey eşzamanlılık limitidir: en fazla `PROVIDER_MAX_CONCURRENCY` çağrı uçuşta olabilir. İki kontrol birlikte çalışır.

### 3.3 Hız sınırı güven modeli — ÖLÇÜLMEDİ

`clientKey()` istemcinin `x-forwarded-for` başlığının ilk değerini kullanır.

| İddia | Durum |
|---|---|
| Kod bu başlığın ilk değerini alıyor | **Kod incelemesiyle doğrulandı** |
| Vercel bu başlığı istemci lehine üzerine yazıyor | **DOĞRULANMADI** |
| Sınırlayıcı gerçek trafikte beklendiği gibi davranıyor | **ÖLÇÜLMEDİ** |

Platform bu başlığı üzerine yazmıyorsa, sınır **taklit edilebilir**.

`DEPLOY_AUTHORIZED=false` olduğu için canlı ölçüm yapılamadı. Ölçüm planı §6'da.

### 3.4 Metrikler yalnız log satırlarıdır

Bir metrik backend'i (Prometheus, Datadog, vb.) yoktur. `logReading` yapılandırılmış JSON basar; bir toplayıcıya bağlanması ayrı bir iştir.

---

## 4. Yayılan metrikler

`reading_request` olayında (hiçbiri serbest metin değildir):

| Alan | Anlamı |
|---|---|
| `status`, `latencyMs`, `outcome` | İstek sonucu |
| `provider`, `fallbackReason` | Hangi sağlayıcı çalıştı, neden yedeğe düşüldü |
| `inputTokens`, `outputTokens` | Bu isteğin token kullanımı |
| `dailyProviderCalls`, `dailyTotalTokens` | Günlük toplam (process-local) |
| `estimatedCostUsd` | **Yalnız fiyatlandırma tanımlıysa** |
| `providerConcurrencyActive`, `providerConcurrencyQueued` | Anlık eşzamanlılık |
| `crisis`, `safetyFlagCount` | Kategorik güvenlik sinyalleri |

`preview_request` olayı ayrıdır — önizleme asla okuma olarak sayılmaz.

### `fallbackReason` değerleri

| Değer | Anlamı | Ne yapmalı |
|---|---|---|
| `provider-error` | Sağlayıcı/ağ hatası | Sağlayıcı durumunu kontrol et |
| `red-line-rejected` | Çıktı güvenlik politikasını ihlal etti | Prompt ve politikayı incele |
| `schema-invalid` | Çıktı şemaya uymadı | Prompt sözleşmesini incele |
| `provider-disabled` | **Kill switch açık** | Kasıtlıysa işlem yok |
| `spend-cap-reached` | **Günlük tavan doldu** | Tavanı veya kullanımı gözden geçir |
| `provider-busy` | **Yük atma** | Eşzamanlılık limitini veya kapasiteyi gözden geçir |

Son üçü **sağlayıcı hatası değildir** — sağlayıcı hiç çağrılmadı. Bu ayrım, "model bozuldu" ile "kendi tavanımıza çarptık" ve "yük atıyoruz" durumlarını ayırt etmek için vardır; üçünün çözümü farklıdır.

---

## 5. Önerilen alarmlar

Backend bağlandığında:

| Alarm | Eşik | Neden |
|---|---|---|
| Günlük token kullanımı | tavanın %80'i | Tavana çarpmadan önce haber |
| `fallbackReason=spend-cap-reached` | > 0 | Tavan doldu, kullanıcılar sade okuma alıyor |
| `fallbackReason=provider-busy` | 5 dk'da > %5 | Kapasite yetersiz |
| `fallbackReason=provider-error` | 5 dk'da > %10 | Sağlayıcı sorunu |
| `outcome=crisis` oranı | ani sıçrama | Kriz filtresinde regresyon olabilir |
| p95 gecikme | > 10 sn | Kullanıcı deneyimi bozuluyor |
| 429 oranı | ani sıçrama | Kötüye kullanım veya sınır çok dar |

`outcome=crisis` oranındaki **düşüş** de izlenmelidir — filtre sessizce kapanmış olabilir.

---

## 6. Canlı ölçüm planı (YÜRÜTÜLMEDİ)

`DEPLOY_AUTHORIZED=false` olduğu için aşağıdakiler **yapılmadı**. Yetki verildiğinde uygulanacak adımlar:

### 6.1 Hız sınırı doğrulaması

1. Preview deployment'a `RATE_LIMIT_ENABLED=1`, `RATE_LIMIT_PER_MINUTE=5` ile deploy et.
2. Tek istemciden 10 istek gönder → 5'i 200, 5'i 429 beklenir.
3. `x-forwarded-for` başlığını sahte bir IP ile gönder ve tekrarla.
   - Hâlâ 429 alıyorsan → platform başlığı üzerine yazıyor, model güvenli.
   - 200 alıyorsan → **başlık taklit edilebilir**, sınır atlatılabilir. Bu durumda platformun sağladığı güvenilir istemci kimliğine geçilmeli.
4. Sonucu bu belgeye tarih ve ölçümle yaz.

### 6.2 Eşzamanlılık doğrulaması

`PROVIDER_MAX_CONCURRENCY=2` ile 10 eşzamanlı istek gönder; log'da `providerConcurrencyActive` değerinin 2'yi aşmadığını doğrula.

### 6.3 Harcama tavanı doğrulaması

`MAX_PROVIDER_CALLS_PER_DAY=3` ile 5 istek gönder; son 2'sinde `fallbackReason=spend-cap-reached` ve okuma yine döndüğünü doğrula.

### 6.4 IP loglama yasağı

Ölçüm sırasında ham IP **loglanmamalıdır**. Gerekirse HMAC'lenmiş bir anahtar kullanılmalı ve ölçüm sonrası kaldırılmalıdır.

---

## 7. İnsan adımları

| Adım | Sorumlu | Durum |
|---|---|---|
| Anthropic konsolunda organizasyon harcama limiti ayarla | Operatör | **YAPILMADI — tek sert tavan budur** |
| Fiyatlandırma env değişkenlerini resmî kaynakla doldur | Operatör | Yapılmadı |
| Hız sınırı güven modelini canlıda ölç (§6.1) | Operatör | Yapılmadı |
| Metrik backend'i ve alarmları bağla | Operatör | Yapılmadı |
| Paylaşılan durum (global tavan) | Mühendislik | Kalıcılıkla ertelendi |
