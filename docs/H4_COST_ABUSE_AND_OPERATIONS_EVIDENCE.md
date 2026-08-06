# H4 — Cost Abuse, Rate Limit, Spend & Observability: Evidence Report

**Tarih:** 2026-08-06
**Karar:** `PASS-WITH-NOTES`
**Dal:** `claude/tarot-ai-master-program-70afqk`
**Base:** `feature/ig4-anthropic-shadow-evaluation` @ `0b83880`
**Merge / Deploy / Canlı API:** Hiçbiri yapılmadı

---

## 1. Ne yapıldı? (teknik olmayan özet)

Faz 0'da ölçülen en büyük ticari risk şuydu: **ücretli API çağrılarına giden yolda hiçbir tavan yoktu.** Kimse kötü niyetli olmasa bile, bir hata veya trafik artışı sınırsız fatura üretebilirdi.

H4 dört kontrol ekledi:

1. **Acil kapatma düğmesi.** Tek bir ayarla (`PROVIDER_ENABLED=0`) bütün ücretli çağrılar durur. Kod değişikliği veya yeniden yayın gerekmez. **Ürün kapanmaz** — okuma sade biçimde çalışmaya devam eder.
2. **Günlük tavan.** Günlük token ve çağrı sayısı sınırı. Tavan dolunca okuma yine verilir, sadece anlatım katmanı sadeleşir.
3. **Eşzamanlılık sınırı.** Aynı anda en fazla belirli sayıda ücretli çağrı yapılabilir.
4. **İstek gövdesi tavanı.** Devasa bir istek artık sunucunun belleğine hiç alınmıyor.

Ayrıca operasyon el kitabı (`docs/OPERATIONS_RUNBOOK.md`) yazıldı.

**En önemli dürüstlük notu:** Bu sayaçlar **her sunucu örneğinde ayrı** tutulur. Serverless ortamda gerçek tavan `(tavan × örnek sayısı)` olur. **Bu bir faturalama kontrolü değildir; runaway kullanıma karşı bir korkuluktur.** Tek sert tavan, Anthropic konsolundaki organizasyon harcama limitidir ve **onun ayarlanması bir insan adımıdır.**

---

## 2. Kapatılan yollar

| Risk | Önce | Sonra |
|---|---|---|
| Sınırsız istek gövdesi | Tavan yok, tüm gövde belleğe alınıyordu | 64 KB, **akış sırasında** kesiliyor |
| Sınırsız eşzamanlı çağrı | N istek → N ücretli çağrı | En fazla 4 (yapılandırılabilir) |
| Günlük harcama | Tavan yok | Token + çağrı tavanı |
| Acil durdurma | Yok (redeploy gerekiyordu) | `PROVIDER_ENABLED=0` |
| Sağlayıcı zaman aşımı | 20 sn ✓ zaten vardı | Değişmedi |
| Yeniden deneme | 1 ✓ zaten vardı | Değişmedi |
| `max_tokens` | 2000 ✓ zaten vardı | Değişmedi |

### Gövde tavanının sırası önemli

H1'in 1000 karakterlik soru sınırı, gövdenin **tamamı belleğe alındıktan sonra** çalışıyordu. Yani 50 MB'lık bir istek, Zod onu reddetmeden önce zaten belleğe alınmıştı.

Yeni okuyucu byte sayımını **akış sırasında** yapar: 50 MB'lık gövde, ~64 KB okunduktan sonra reddedilir.

`content-length` başlığı yalnızca hızlı ret için kullanılır, **asla güvenilmez** — istemci onu eksik bildirebilir. Gerçek tavanı akış sırasında sayılan byte'lar uygular. Test edildi (eksik bildirilen ve abartılan başlık, iki ayrı vaka).

---

## 3. Kapalı kapı asla kullanıcıya okuma kaybettirmez

Bu, H4'ün en kritik özelliğidir ve **uçtan uca test edilmiştir**:

| Durum | Okuma verildi mi? | Sağlayıcı çağrıldı mı? | Rapor edilen neden |
|---|---|---|---|
| Kill switch açık | **Evet** | Hayır | `provider-disabled` |
| Harcama tavanı dolu | **Evet** | Hayır | `spend-cap-reached` |
| Eşzamanlılık dolu | **Evet** | Hayır | `provider-busy` |

Bir maliyet kontrolünün kesinti (outage) hâline gelmesi, çözdüğü sorundan daha kötüdür. Bunu sağlayan tasarım kararı §4'te.

---

## 4. Fail-safe varsayılan — `isFree`, `isPaid` değil

Sağlayıcı arayüzüne eklenen bayrak `isFree` olarak adlandırıldı. Bu bilinçli bir tercihtir.

- `isPaid` olsaydı: bayrağı **koymayı unutan** yeni bir ücretli sağlayıcı, harcama tavanını **sessizce atlardı**. Bu, kapının önlemek için var olduğu tam olarak o hatadır.
- `isFree` ile: hiçbir şey beyan etmeyen sağlayıcı **kapıya tabidir**. Bir sağlayıcıyı ücretsiz ilan etmek, bilinçli ve görünür bir eylemdir.

`MockProvider` kendini açıkça ücretsiz ilan eder — çünkü kapı kapandığında devreye giren yedek yol odur. Onu da kapıya tabi tutmak, kapının tetiklediği yedeğe tam o anda ulaşılamaz hale getirirdi.

**İlk yazdığım hali `isPaid`'di.** Yorum satırını yazarken mantığın kendi içinde çeliştiğini fark ettim ve fail-safe yöne çevirdim.

---

## 5. Para asla uydurulmaz

Token sayıları sağlayıcının kendi `usage` cevabından gelir — dış varsayım gerektirmez.

Para hesabı **opsiyoneldir** ve yalnız dört değişkenin **hepsi** tanımlıysa açılır: giriş fiyatı, çıkış fiyatı, **kaynak URL'i** ve **doğrulama tarihi**.

Eksik yapılandırma **yarım uygulanmaz, tamamen reddedilir.** Kaynağı ve tarihi kayıtlı olmayan bir fiyat, tam olarak bu modülün üretmemek için var olduğu türden bir sayıdır.

Fiyatlandırma yoksa `estimatedCostUsd` alanı **hiç yayılmaz** — sıfır olarak da yayılmaz. Sıfır, "bu hiçbir şeye mal olmadı" **iddiasıdır**; alanın yokluğu ise doğru şekilde "doğrulanmış fiyatımız yok" anlamına gelir. Bu da teste bağlandı.

**Bu repository'de doğrulanmış fiyat kaydı yoktur.** Fiyat girmek bir insan adımıdır.

---

## 6. Zorunlu red-team — kendi değişikliğime saldırı

### Bulgu 1: `0` değeri sessizce yok sayılıyordu (CRITICAL)

`MAX_PROVIDER_CALLS_PER_DAY=0` — bir operatörün harcamayı durdurmak için deneyeceği **en bariz yol** — varsayılan 2000'e düşüyordu.

Sebep: ilk uygulamam "pozitif sayı" istiyordu ve `0`'ı geçersiz sayıp varsayılana dönüyordu.

**"Hiçbir şey harcama" talimatını sessizce yok sayan bir maliyet kontrolü, hiç olmamasından kötüdür.** Düzeltildi; artık `0` geçerli ve anlamlıdır ("hiçbirine izin verme"). Negatif ve sayı olmayan değerler hâlâ güvenli varsayılana döner. Üç test bunu sabitliyor.

Bu bulgu, entegrasyon red-team'i sırasında ortaya çıktı — birim testleri geçiyordu çünkü hepsi guard'ı doğrudan kuruyordu, env yapılandırmasından değil.

### Diğer red-team soruları

| Soru | Cevap |
|---|---|
| Semafor deadlock olabilir mi? | Hayır. İzin `finally` içinde bırakılır; fırlatan görev testi ve 20 ardışık hata testi mevcut |
| Zaman aşımına uğrayan bekleyen kuyrukta kalır mı? | Hayır, kuyruktan çıkarılır; test var |
| Harcama sayacında race condition var mı? | **Evet, bilinçli.** Kontrol çağrı öncesi yapılır, bu yüzden tavan uçuştaki çağrılar kadar aşılabilir. Bu aşımı sınırlayan şey eşzamanlılık limitidir. Runbook §3.2'de açıkça yazıldı |
| Başarısız çağrı sayılıyor mu? | Evet — yalnız başarıda saymak, retry döngüsünün sayaç ilerlemeden harcama yapmasına izin verirdi |
| Negatif usage sayacı geri alabilir mi? | Hayır, `Math.max(0, …)`; test var |
| Kapı yedek yolu bozuyor mu? | Hayır — uçtan uca test edildi (§3) |
| Kapı hatası sağlayıcı hatasıyla karışıyor mu? | Hayır, ayrı `ProviderGateError` ve ayrı `fallbackReason` değerleri |
| Loglara metin sızıyor mu? | Hayır — yeni alanların hepsi sayı; test var |
| `content-length` taklit edilebilir mi? | Edilebilir ama işe yaramaz — akış sayımı uygular; iki test var |

---

## 7. Rate limit — kod incelemesi ile ölçüm ayrımı

Bu ayrım kasıtlı olarak korunmuştur:

| İddia | Durum |
|---|---|
| Kod `x-forwarded-for`'un ilk değerini kullanıyor | **Kod incelemesiyle doğrulandı** |
| Vercel bu başlığı istemci lehine üzerine yazıyor | **DOĞRULANMADI** |
| Sınırlayıcı gerçek trafikte beklendiği gibi davranıyor | **ÖLÇÜLMEDİ** |

Platform başlığı üzerine yazmıyorsa sınır **taklit edilebilir**. `DEPLOY_AUTHORIZED=false` olduğu için canlı ölçüm yapılamadı.

Yürütülebilir ölçüm planı `docs/OPERATIONS_RUNBOOK.md` §6'da yazıldı — sahte `x-forwarded-for` ile atlatma testi dahil. Plan, ölçüm sırasında **ham IP loglanmasını yasaklar**.

---

## 8. Gözlemlenebilirlik

Yayılan yeni metrikler (hiçbiri serbest metin değil): `dailyProviderCalls`, `dailyTotalTokens`, `estimatedCostUsd` (yalnız fiyatlandırma varsa), `providerConcurrencyActive`, `providerConcurrencyQueued`.

`fallbackReason` üç yeni kategorik değer kazandı: `provider-disabled`, `spend-cap-reached`, `provider-busy`. Bunlar **sağlayıcı hatası değildir** — sağlayıcı hiç çağrılmadı. Ayrım önemlidir: "model bozuldu", "kendi tavanımıza çarptık" ve "yük atıyoruz" farklı sorunlardır ve farklı çözümleri vardır.

**Metrik backend'i yoktur.** `logReading` yapılandırılmış JSON basar; bir toplayıcıya bağlanması ayrı bir iştir. Önerilen alarm eşikleri runbook §5'te — `outcome=crisis` oranındaki **düşüşün** de izlenmesi gerektiği dahil, çünkü bu filtrenin sessizce kapandığı anlamına gelebilir.

---

## 9. Test sonuçları

| Komut | H3 sonrası | **H4 sonrası** |
|---|---|---|
| `npm run typecheck` | exit 0 | **exit 0** |
| `npm run lint` | exit 0 | **exit 0** |
| `npm test` | 1289 / 1289 | **1337 / 1337** (35 dosya) |
| `npm run build` | başarılı | **başarılı** |

**+48 yeni test.** Mevcut testlerin hiçbiri bozulmadı; bu fazda hiçbir mevcut test kırılmadı.

---

## 10. Ne çözülmedi?

| Konu | Durum |
|---|---|
| Global (fleet-wide) harcama tavanı | **Açık** — paylaşılan durum gerekiyor, kalıcılıkla ertelendi |
| Anthropic konsolunda organizasyon limiti | **AÇIK — insan adımı, tek sert tavan budur** |
| Doğrulanmış fiyat kaydı | Açık — insan adımı |
| Rate limit canlı ölçümü | **Açık** — deploy yetkisi yok |
| Metrik backend'i ve alarmlar | Açık — operatör adımı |
| Gizlilik akışı, CSP, HSTS, erişilebilirlik | Açık — H5 |

---

## 11. Sonraki faza geçilebilir mi?

**Evet — H5'e geçilebilir.**

Sınırsız harcama yolu kapatıldı veya açık bir kapıya bağlandı, dört kapı yeşil, ve kapalı kapı hiçbir durumda kullanıcıya okuma kaybettirmiyor.

**Yayın durumu:** `Invited closed pilot` artık teknik olarak daha savunulabilir — ancak **Anthropic konsolunda organizasyon harcama limiti ayarlanmadan hiçbir gerçek kullanıcı trafiğine açılmamalıdır**, çünkü kod tarafındaki tavan process-local'dır.

**Anonim public beta hâlâ HAYIR** — H5 (gizlilik akışı, güvenlik başlıkları, erişilebilirlik) tamamlanmadı.

---

## 12. Kanıt disiplini

- Bütün ölçümler bu oturumda, gerçek kod üzerinde yapıldı.
- Hiçbir canlı sağlayıcı çağrısı yapılmadı, hiçbir ücretli API kullanılmadı.
- Rate limit davranışı hakkındaki iddialar **kod incelemesi** olarak işaretlendi; ölçüm olarak sunulmadı.
- Hiçbir fiyat uydurulmadı; repository'de doğrulanmış fiyat kaydı olmadığı açıkça belirtildi.
- Process-local sınırlama, kodda, runbook'ta ve bu raporda üç ayrı yerde yazılıdır.

---

*H4 sonu. Sonraki faz: H5 — Privacy, Browser Security, CI & Accessibility.*
