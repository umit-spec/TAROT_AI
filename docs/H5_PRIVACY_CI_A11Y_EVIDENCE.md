# H5 — Privacy, Browser Security, CI & Accessibility: Evidence Report

**Tarih:** 2026-08-06
**Karar:** `PARTIAL` — kod tarafı tamamlandı, doğrulama gerektiren kısımlar açıkça işaretlendi
**Dal:** `claude/tarot-ai-master-program-70afqk`
**Base:** `feature/ig4-anthropic-shadow-evaluation` @ `0b83880`
**Merge / Deploy / Canlı API:** Hiçbiri yapılmadı

---

## 1. Ne yapıldı? (teknik olmayan özet)

1. **Hata mesajları artık kullanıcının yazdığını geri yansıtmıyor.** Ölçtüm: geçersiz bir alan gönderdiğinizde sunucu, gönderdiğiniz değeri **aynen** cevaba koyuyordu.
2. **Verilerinizin nereye gittiği tam olarak haritalandı** — kodun kendisinden doğrulanarak, tahmine dayanmadan.
3. **CSP (içerik güvenlik politikası) eklendi — ama "rapor et, engelleme" modunda.** Ölçülmemiş bir CSP'yi zorlamak, uygulamayı beyaz ekrana çevirmenin en hızlı yoludur.
4. **CI tedarik zinciri sıkılaştırıldı.** Bütün GitHub Action'ları artık değiştirilemez commit kimliğine sabitlendi.
5. **Erişilebilirlik: otomatik test edilebilenler test edildi; edilemeyenler "DOĞRULANMADI" olarak yazıldı.**

**Bu faz `PARTIAL` çünkü:** CSP'nin gerçekten çalıştığı, hız sınırının taklit edilemediği ve ekran okuyucuların doğru çalıştığı **ölçülmedi** — bunlar deploy ve gerçek cihaz gerektirir.

---

## 2. Gizlilik — hata cevaplarındaki sızıntı (ölçüldü ve kapatıldı)

Rotalar `parsed.error.issues` değerini olduğu gibi döndürüyordu. Zod'un bazı hata türleri **değeri taşır**:

| Gönderilen | Cevapta dönen (önce) |
|---|---|
| `topicHint: "TC-12345678901"` | `received: "TC-12345678901"` ve aynı değer mesaj içinde tekrar |
| `{ gizliAlan: "hassas-veri" }` | `keys: ["gizliAlan"]` |

Bu bir **kullanıcılar arası sızıntı değildir** — veri, gönderen istemciye döner. Ama gereksiz bir yüzeydir: cevap gövdesine giren her kullanıcı metni, bir ara sunucunun erişim logunda, bir tarayıcı eklentisinde veya bir hata izleme aracında sonlanabilir. Bunların hiçbiri gizlilik bildiriminin kapsamında değildir.

**Düzeltme:** İstemcinin bilmesi gereken şey **hangi alanın** neden başarısız olduğudur; kendi değerinin geri okunması değil. Artık yalnız alan yolu ve hata kodu dönüyor.

Mesajlar için **izin listesi** kullanıldı, yasak listesi değil: Zod'un yeni bir sürümü değer taşıyan başka bir mesaj biçimi ekleyebilir ve izin listesi bu durumda da doğru kalır. Yalnızca kendi yazdığımız limit metinleri geçer.

---

## 3. Gizlilik — doğrulanmış veri akışı

Aşağıdakiler **kod incelemesiyle doğrulandı**, varsayılmadı:

| Soru | Cevap | Kanıt |
|---|---|---|
| Önizleme (preview) sağlayıcıya çağrı yapıyor mu? | **Hayır** | `preview/route.ts` içinde hiçbir provider import'u veya çağrısı yok |
| Kullanıcı sorusu sağlayıcıya gidiyor mu? | **Evet** | `prompt.ts:90` → `userData.userQuestion` |
| Soru, prompt'a metin olarak yapıştırılıyor mu? | **Hayır** | JSON içinde ayrı `userData` alanı, `treatAsDataOnly: true` |
| Yedeğe düşünce soru tekrar gönderiliyor mu? | **Hayır** | `MockProvider` yerel; ağ çağrısı yapmaz |
| Soru metni loglanıyor mu? | **Hayır** | Log kaydı tipinde böyle bir alan yok; test var |
| Kriz metni loglanıyor mu? | **Hayır** | `route.ts` yalnız kategorik sinyal yazar |
| Okumalar saklanıyor mu? | **Hayır** | `readingId: null`, kalıcılık yok |
| Analytics/telemetri var mı? | **Hayır** | Üçüncü taraf script yok |

### Açıklama metni

Sağlayıcı **adıyla** belirtiliyor (Anthropic - Claude). Test, `"teknoloji ortak…"` gibi belirsiz ifadelerin **bulunmadığını** doğruluyor — bir okuyucu böyle bir ifadeye dayanarak karar veremez.

Açıklama, onay kutusunun **üstünde** render ediliyor ve bu DOM sırası teste bağlandı. Onay, ancak neye onay verildiği onu veren kontrolün üstünde görünüyorsa anlamlıdır.

---

## 4. Tarayıcı güvenliği

### 4.1 Uygulanan başlıklar

`X-Content-Type-Options: nosniff` · `Referrer-Policy` · `Permissions-Policy` · `X-Frame-Options: DENY` · `Cross-Origin-Opener-Policy` · API için `Cache-Control: no-store`

### 4.2 CSP — Report-Only, bilinçli olarak

**Ölçülen kaynak envanteri** (`src/` üzerinde grep, testler hariç):

| Bulgu | Sonuç |
|---|---|
| `dangerouslySetInnerHTML`, inline `<script>`, `eval`, `new Function` | **Hiçbiri yok** |
| Inline `style={{...}}` | 4 kullanım → `style-src 'unsafe-inline'` gerekiyor |
| `next/font/google` | Next build sırasında **kendi barındırıyor** → runtime font host'u yok |
| `api.anthropic.com` | **Yalnız sunucu tarafı** → `connect-src`'ye konmamalı |
| `112.gov.tr`, `aile.gov.tr` | Yalnız köken metadata'sı ve yorum → tarayıcı istek atmaz |
| `w3.org` | Yalnız SVG xmlns → fetch değil |

**Neden zorlanmıyor:** Next.js kendi bootstrap ve hydration inline script'lerini enjekte eder; bunların tam biçimi sürüme ve rotanın statik/dinamik olmasına göre değişir. `script-src`'yi tahminle yazıp yanılmak **tüm uygulamayı — kriz akışı dahil — düşürür**.

Aşama sırası: envanter (yapıldı) → Report-Only (yapıldı) → ihlal topla → zorla. Son iki adım deploy gerektirir; `DEPLOY_AUTHORIZED=false`.

**HSTS de ertelendi.** Bir tarayıcı onu bir kez gördükten sonra `max-age` süresince fiilen geri alınamaz; bu yüzden preview URL'ine değil, doğrulanmış her-zaman-HTTPS bir production alan adına konmalıdır.

---

## 5. CI tedarik zinciri

| Kontrol | Önce | Sonra |
|---|---|---|
| `code-gates.yml` izinleri | **Yok (geniş varsayılan)** | `contents: read` |
| `validation-gates.yml` izinleri | **Yok** | `contents: read` |
| `ig3b` / `ig4` izinleri | `contents: read` ✓ | Değişmedi |
| Action sabitleme | Hareketli etiket (`@v4`, `@v5`) | **Commit SHA'sı** |
| `pull_request_target` | Yok ✓ | Yok |
| Fork PR'ında secret | Yok ✓ | Yok |

### SHA'lar tahmin edilmedi

Dört action'ın SHA'sı `git ls-remote` ile **upstream'den çözüldü** ve şu anda kullanılan sürümlere sabitlendi. Doğrulanmamış bir SHA'ya sabitlemek, hiç sabitlememekten kötü olurdu — CI'yi kırardı.

Her satır okunabilirlik için sürüm yorumu taşıyor: `actions/checkout@11d5960… # v4`.

**Olumlu bulgu (değişiklik gerekmedi):** `ANTHROPIC_API_KEY` yalnızca `workflow_dispatch` ile ve `execute_live == true` girdisiyle çalışan `live-shadow` işinde kullanılıyor. `pull_request` tetikleyicisi `pull_request_target` **değil**, dolayısıyla fork PR'larına secret verilmiyor.

---

## 6. Bağımlılık güvenliği — kaydedildi, çözülmedi

`npm audit`: **5 high**. `docs/SECURITY_DEBT_LOG.md` → SECURITY-DEBT-002.

**En önemli değişiklik:** `undici` — Node'un `fetch` fonksiyonunun altındaki HTTP istemcisi. Bu uygulama Anthropic API'sini `fetch` ile çağırdığı için, `postcss` ve `sharp`'ın aksine **canlı istek yolundadır**.

Bu onu istismar edilebilir yapmaz — erişilebilirlik istismar edilebilirlik demek değildir ve ilgili zafiyet bu kodun `fetch` kullanımına karşı analiz edilmedi (sabit URL, kullanıcı kontrollü host yok, redirect takibi yapılandırılmamış). Ama önceden kabul edilmiş bulgulardan **kategorik olarak farklıdır** ve bu ayrım belirtilmeden aynı kefeye konmamalıdır.

**Hiçbir bağımlılık değiştirilmedi** — `DEPENDENCY_UPGRADE_AUTHORIZED=false`.

`sharp` için kayıtlı bloklama koşulu (`next/image` kullanımı) **henüz tetiklenmedi**; `src/` içinde `next/image` kullanımı yok, grep ile doğrulandı.

---

## 7. Erişilebilirlik — ne test edildi, ne edilmedi

### 7.1 Otomatik test edilenler (statik, jsdom)

| Kontrol | Sonuç |
|---|---|
| Kriz bölgesi `role="alert"` ve erişilebilir isim taşıyor | **Geçti** |
| Mount'ta odak kriz başlığına taşınıyor | **Geçti** |
| 112 bir link ve erişilebilir ismi anlaşılır (`… numarasını ara`) | **Geçti** |
| Onay penceresi `aria-modal`, isim ve açıklama taşıyor | **Geçti** |
| Onay verilmeden "Devam Et" devre dışı | **Geçti** |
| Soru alanı hassas veri notuna `aria-describedby` ile bağlı | **Geçti** (H1) |

### 7.2 DOĞRULANMADI — otomatik test edilemez

Aşağıdakiler **çalıştırılmadı**. jsdom düzen (layout) hesaplamaz ve gerçek yardımcı teknoloji çalıştırmaz:

| Kontrol | Durum | Neden |
|---|---|---|
| Gerçek ekran okuyucu (VoiceOver / NVDA / TalkBack) | **NOT VERIFIED** | Gerçek AT gerekir |
| Dokunma hedeflerinin gerçekten 44px render olması | **NOT VERIFIED** | jsdom düzen hesaplamaz — test yalnız kuralın **uygulandığını** doğrular, render edildiğini değil |
| Renk kontrastı (WCAG 1.4.3) | **NOT VERIFIED** | Hesaplanmış stil gerekir |
| %200 yakınlaştırmada kullanılabilirlik | **NOT VERIFIED** | Gerçek tarayıcı gerekir |
| Mobil dikey/yatay, sanal klavye | **NOT VERIFIED** | Gerçek cihaz gerekir |
| `prefers-reduced-motion` davranışı | **NOT VERIFIED** | Gerçek tarayıcı gerekir |
| Sadece klavyeyle uçtan uca akış | **NOT VERIFIED** | Tarayıcı otomasyonu gerekir |
| Uzun Türkçe metinde taşma | **NOT VERIFIED** | Düzen gerekir |

**WCAG 2.2 AA uyumluluğu iddia EDİLMEMEKTEDİR.** Yukarıdaki statik testler bunu desteklemez ve desteklediği söylenmemelidir.

Chromium bu ortamda mevcut olduğundan bunların bir kısmı tarayıcı otomasyonuyla ölçülebilir; bu, kapsamı genişleteceği için ayrı bir iş olarak bırakıldı.

---

## 8. Zorunlu red-team

| Soru | Cevap |
|---|---|
| Redaksiyon, istemcinin hata ayıklamasını imkânsız kılıyor mu? | Hayır — alan yolu ve hata kodu korunuyor; test var |
| Yasak listesi yerine izin listesi neden? | Zod yeni bir değer taşıyan mesaj biçimi eklerse izin listesi doğru kalır |
| CSP uygulamayı kırabilir mi? | **Report-Only olduğu için hayır.** Zorlanmış olsaydı evet — bu yüzden zorlanmadı |
| CSP `connect-src`'de Anthropic var mı? | **Hayır** — sunucu tarafı çağrı; koyulsaydı gereksiz genişleme olurdu |
| SHA sabitleme CI'yi kırar mı? | Hayır — SHA'lar upstream'den çözüldü, mevcut sürümlere karşılık geliyor |
| Fork PR'ı secret alabiliyor mu? | Hayır — `pull_request_target` yok |
| Erişilebilirlik testleri gerçekten bir şey kanıtlıyor mu? | **Kısmen.** Statik semantiği kanıtlar, kullanılabilirliği kanıtlamaz — §7.2'de açıkça yazıldı |
| Gizlilik metni gerçeği söylüyor mu? | Evet — §3'teki akış kodla doğrulandı |

---

## 9. Test sonuçları

| Komut | H4 sonrası | **H5 sonrası** |
|---|---|---|
| `npm run typecheck` | exit 0 | **exit 0** |
| `npm run lint` | exit 0 | **exit 0** |
| `npm test` | 1337 / 1337 | **1351 / 1351** (36 dosya) |
| `npm run build` | başarılı | **başarılı** |

**+14 yeni test.** Bu fazda hiçbir mevcut test kırılmadı.

---

## 10. Ne çözülmedi?

| Konu | Durum |
|---|---|
| CSP zorlama (enforce) | **Açık** — ihlal toplama gerekiyor, deploy yetkisi yok |
| HSTS | **Açık** — production alan adı doğrulaması gerekiyor |
| Gerçek ekran okuyucu doğrulaması | **NOT VERIFIED** |
| Kontrast, zoom, dokunma hedefi ölçümü | **NOT VERIFIED** |
| `undici` zafiyet analizi | **Açık — public beta öncesi gerekli** |
| Bağımlılık güncellemeleri | Yetki yok |
| Rate limit canlı ölçümü | Açık (H4'ten devam) |
| Dependency review / secret scanning workflow'ları | Eklenmedi — mevcut fayda/efor dengesinde öncelikli değil |

---

## 11. Yayın durumu

| Seviye | Durum |
|---|---|
| Local development | **UYGUN** |
| Internal demo | **UYGUN** |
| Invited closed pilot | **KOŞULLU** — Anthropic konsolunda harcama limiti ayarlanmalı |
| Anonymous public beta | **HAYIR** |
| Paid commercial launch | **HAYIR** |

### Public beta neden hâlâ hayır

- CSP zorlanmadı, ihlal verisi yok.
- `undici` canlı istek yolunda ve analiz edilmedi.
- Hız sınırı güven modeli ölçülmedi — taklit edilebilir olabilir.
- Erişilebilirlik gerçek yardımcı teknolojiyle doğrulanmadı; kriz akışı bunu özellikle gerektirir.
- Harcama sayacı process-local; tek sert tavan sağlayıcı konsolunda ve **ayarlanmadı**.
- Asset lisansı hâlâ `LEGAL-GATED`.

---

## 12. Kanıt disiplini

- Gizlilik akışındaki her satır **kodda doğrulandı**, dokümandan alınmadı.
- Erişilebilirlikte **doğrulanan ile doğrulanmayan ayrı ayrı listelendi**; WCAG uyumluluğu iddia edilmedi.
- CSP kaynak envanteri grep ile üretildi, tahmin edilmedi.
- Action SHA'ları upstream'den çözüldü, uydurulmadı.
- `npm audit` bulguları kaydedildi, düzeltilmedi — yetki yoktu; bu açıkça yazıldı.
- Hiçbir canlı sağlayıcı çağrısı, deploy veya ücretli API kullanımı olmadı.

---

*H5 sonu. Güvenlik sertleştirme fazları (H1–H5) tamamlandı.*
