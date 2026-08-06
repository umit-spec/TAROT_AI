# H2 — Crisis Safety Rebuild: Evidence Report

**Tarih:** 2026-08-06
**Karar:** `PASS-WITH-NOTES`
**Dal:** `claude/tarot-ai-master-program-70afqk`
**Base:** `feature/ig4-anthropic-shadow-evaluation` @ `0b83880`
**Merge / Deploy / Canlı API:** Hiçbiri yapılmadı (`MERGE_AUTHORIZED=false`, `DEPLOY_AUTHORIZED=false`, `LIVE_PROVIDER_AUTHORIZED=false`)

---

## 1. Ne yapıldı? (teknik olmayan özet)

H1 kriz filtresindeki en kaba hataları yamamıştı. H2 filtreyi **baştan kurdu**:

1. **Ürün artık üç şekilde cevap verebiliyor.** Önceden yalnız iki seçenek vardı: normal tarot okuması, ya da kriz ekranı. Şimdi arada bir kademe var — *"Çok üzgünüm ve kafam karışık"* diyen birine ne kriz ekranı gösteriliyor, ne de hiçbir şey olmamış gibi okuma veriliyor.

2. **Türkçe artık gerçekten Türkçe olarak işleniyor.** Yazım hatası (*"zrar"*), Türkçe karaktersiz yazım (*"dusunuyorum"*), büyük harf ve nokta/boşlukla gizleme (*"i.n.t.i.h.a.r"*) artık yakalanıyor. Aynı zamanda *"zorlanıyorum"* kelimesinin *"zorla"* ile karıştırılması **yapısal olarak imkânsız** hale getirildi.

3. **Kriz kaynakları artık türe göre seçiliyor** ve her kaynağın kaynağı, doğrulanma tarihi ve yeniden gözden geçirme tarihi kayıtlı.

4. **144 sentetik vakalık kalıcı bir test seti** kuruldu.

**Dürüstlük notu:** Bu hâlâ klinik bir araç değildir ve teşhis koymaz. Yalnızca ürünün ne göstereceğine karar verir. Ölçülen sonuç, *düşünülmüş ifadeler* üzerindeki kapsamdır — gerçek dünya doğruluk oranı değildir.

---

## 2. Ölçülen sonuç

| Ölçüm | Değer |
|---|---|
| Sentetik vaka sayısı | **144** (61 benign, 60+ kriz, 23 belirsiz) |
| Seviye uyuşmazlığı | **0** |
| Yanlışlıkla engellenen sıradan soru | **0** |
| Kaçırılan kriz | **0** |

Faz 0'daki orijinal 24 vakalık prob seti de tekrar çalıştırıldı:

| | Faz 0 | H1 | **H2** |
|---|---|---|---|
| Doğru | 7/24 | 23/24 | **24/24** |
| Yanlış alarm | 12 | 0 | **0** |
| Kaçırılan kriz | 5 | 1 | **0** |

H1'de kalan tek kaçırma (*"kendime zrar vermek istiyorum"* — yazım hatası) H2'de kapandı.

---

## 3. Üç seviyeli karar modeli

| Seviye | Ne olur | Örnek |
|---|---|---|
| `normal` | Okuma normal şekilde verilir | "Kariyerimde ne yapmalıyım?" |
| `emotional_support` | Okuma **verilir**, ama önce durum kabul edilir | "Dayanamıyorum artık, her şey üst üste geldi." |
| `crisis` | Okuma **verilmez**, destek kaynakları gösterilir | "Kendime zarar vermek istiyorum." |

### Neden iki değil de üç seviye

İki seviyeli bir kapı, üzgün ama tehlikede olmayan herkesi iki yanlış kapıdan birine sokar: ya ihtiyaç duymadıkları kriz ekranı, ya da az önce söylediklerini görmezden gelen neşeli bir tarot okuması. Orta seviye tam olarak bu yüzden var.

### Sinyal ağırlıklandırması

- **Güçlü sinyal** (tek başına yeterli): "dayanamıyorum", "çaresizim", "umutsuzum", "tükendim" …
- **Hafif sinyal** (en az iki tane gerekli): "endişeliyim", "kafam karışık", "korkuyorum" …

Böylece *"Biraz endişeliyim yeni iş hakkında"* normal kalırken, *"Dayanamıyorum artık"* destek seviyesine çıkıyor.

---

## 4. Türkçe metin altyapısı

Yeni modül: `src/server/intake/turkish-text.ts`. Hiçbir dış bağımlılık eklenmedi.

### 4.1 Büyük/küçük harf

JavaScript'in `toLowerCase()` fonksiyonu Türkçe bilmez:

```
'KESİNLİKLE'.toLowerCase()  →  'kesi̇nli̇kle'   (i + birleştirici nokta)
foldCase('KESİNLİKLE')      →  'kesinlikle'    (doğru)
```

Bu, Faz 0'da ölçülen **çıktı filtresi büyük harf atlatmasının** da kök nedenidir. Altyapı artık hazır; H3 bunu çıktı tarayıcısına uygulayacak.

### 4.2 Türkçe karaktersiz yazım

`düşünüyorum` ve `dusunuyorum` aynı forma indirgeniyor. Yabancı klavyeden yazan kullanıcı artık kaçmıyor.

### 4.3 Ek listesi — `'zorla'` hatasının yapısal çözümü

Türkçe sondan eklemeli olduğu için ne kelime sınırı ne de önek eşleşmesi tek başına doğru çalışır. Çözüm: **izin verilen çekim ekleri listesi**.

Listede **bilerek yer almayan** iki ek: çıplak `-n-` ve `-m-`. Her ikisi de yapım ekidir:

```
'zorla' + 'n'  + 'iyorum'  →  "zorlanıyorum"   ← bu listeye izin verilseydi tekrar eşleşirdi
'zorla' + 'ma' + 'm'       →  "zorlamam"        ← aynı şekilde
```

Test edildi ve doğrulandı: `zorlanıyorum`, `zorlamam`, `zorlanmış`, `zorluyorum` → **hiçbiri** `zorla` ile eşleşmiyor. Buna karşılık `intiharı`, `intihardan`, `tecavüze` → **hepsi** doğru eşleşiyor.

### 4.4 Sınırlı yazım hatası toleransı

Tek karakterlik hata, **yalnız 5 karakterden uzun köklerde** ve **yalnız açıkça izin verilen ifadelerde** tolere edilir.

Kısa kelimelerde kapalı olmasının nedeni ölçülebilir: Türkçede tek harf değişimi bir kelimeyi tamamen başka bir kelime yapar (`bal`/`bak`/`bar`). Test edildi: `bal` ↔ `bak` fuzzy eşleşme **vermiyor**.

---

## 5. Zorunlu red-team — kendi değişikliğime saldırı

H2'nin yeni makinesine (fuzzy eşleşme, ASCII katlama, ek listesi, gizleme çözme) karşı 14 saldırgan sıradan soru çalıştırıldı. **2 yeni yanlış alarm bulundu.**

| Bulgu | Karar |
|---|---|
| "Kalp krizi riski var mı diye merak ediyorum." → tıbbi kriz | **Düzeltildi.** Tıbbi kategoriye "bilgi arama" istisnası eklendi (`merak ediyorum`, `riski var mı`, `belirtileri neler`). `nasıl anlarım` bilinçli olarak **eklenmedi** — belirti yaşayan biri de bunu yazabilir. |
| "Bu filmi izlerken öldürmek istiyorum dedim şaka olarak." → şiddet krizi | **Düzeltilmedi, kayda geçirildi.** |

### Neden ikincisi düzeltilmedi

`şaka` kelimesine dayalı bir istisna, filtreyi atlatan **sihirli bir kelimeye** dönüşürdü ("şaka değil, gerçekten…"). Ayrıca bu, güvenli yönde bir hatadır: gerekmediği halde kriz ekranı gösterir, gerçek bir ifşayı kaçırmaz.

Bu vaka `KNOWN_LIMITATIONS` listesine yazıldı ve **teste bağlandı**. İki koruma var:
- Liste sessizce büyüyemez; her giriş bir testle sabitlenmiştir.
- Bir test, bu listedeki hiçbir maddenin **kriz kaçırma** türünde olamayacağını doğrular. Yalnız "fazla tepki" hataları park edilebilir.

### Diğer red-team soruları

| Soru | Cevap |
|---|---|
| Olumsuzlama tüm mesajı temizliyor mu? | Hayır, cümlecik bazlı. "…düşünmüyorum ama kendime zarar vermek istiyorum" → **kriz** |
| Aktarılan söz istismar edilebilir mi? | Hayır, birinci şahıs niyet işareti istisnayı bozar |
| Benzetme istisnası intiharı temizler mi? | **Hayır** — yapısal olarak yalnız saldırı ve tıbbi kategorilere uygulanır |
| Abartı istisnası açık intihar sinyalini temizler mi? | Hayır, "pazarlıksız sinyal" listesi bunu engeller |
| Gizleme çözücü istisnaları geçersiz kılıyor mu? | **Bu bir hataydı ve bulundu.** İlk halde "Haberlerde intihar haberi gördüm" tekrar krize dönüyordu; düzeltildi (yalnız hiç eşleşme yoksa çalışır) |
| Değerlendirme sonucu kullanıcı metni taşıyor mu? | Hayır — test, isim ve telefon numarasının çıktıda **bulunmadığını** doğruluyor |

---

## 6. Kriz kaynakları — tür bazlı yönlendirme ve köken kaydı

Her kaynak artık şunları taşıyor: yayıncı kurum, resmî kaynak URL'i, doğrulanma tarihi, **yeniden gözden geçirme tarihi**, sorumlu rol, hangi kriz türlerine uygun olduğu, ve çalışma zamanında gösterilip gösterilemeyeceği.

### ALO 183 hakkında — bilinçli olarak eklenmedi

`SAFETY_CRISIS_RESOURCES_REVIEW.md` §4, ALO 183'ün eklenmesi için üç koşul koymuştu. H2 bunlardan **(a) güvenilir tür sinyalini** ve **(b) tür bazlı kaynak seçimini** sağladı.

Ama 183 **hâlâ gösterilmiyor**. Kriz ekranına telefon numarası eklemek mühendislik kararı değil, **Product Owner'ın bağlayıcı güvenlik kararıdır** — önceki inceleme bunu açıkça söylüyor ve bir insan tarafından imzalanmıştır.

Kayıt `runtimeEnabled: false` olarak hazır bekliyor, neyi beklediği yazılı, ve **bir test bu bayrağın hâlâ kapalı olduğunu doğruluyor** — böylece başka bir işin yan etkisi olarak sessizce açılamaz.

Ayrıca fail-safe: bilinmeyen veya boş bir tür kümesi geldiğinde bile 112 döner. Kriz ekranı **asla** yardım yolu olmadan görüntülenemez.

---

## 7. Test sonuçları

| Komut | H1 sonrası | **H2 sonrası** |
|---|---|---|
| `npm run typecheck` | exit 0 | **exit 0** |
| `npm run lint` | exit 0 | **exit 0** |
| `npm test` | 930 / 930 | **1107 / 1107** (33 dosya) |
| `npm run build` | başarılı | **başarılı** |

**+177 yeni test.** Mevcut testlerin hiçbiri bozulmadı.

Süreçte 4 test kırıldı, hiçbiri testi zayıflatarak geçilmedi:
- 3'ü gizleme çözücünün istisnaları geçersiz kılması → **kod düzeltildi**.
- 1'i `"Bana zorla bir şey yapıldı"` → Türkçe edilgen `-ıl-` eki yapım ekidir ve ek listesinde yoktur. Ek listesini genişletmek yerine (ki bu `zorla` hatasını geri getirirdi) **gerçek fiil biçimleri anahtar kelime olarak yazıldı**.

---

## 8. Ne çözülmedi?

| Konu | Durum |
|---|---|
| `emotional_support` seviyesinin **kullanıcıya görünen** karşılığı | **Açık — governance gate** |
| ALO 183 çalışma zamanı kaydı | **Açık — Product Owner kararı** |
| "Şaka" bağlamı (kayıtlı limitasyon) | Bilinçli olarak açık |
| Gerçek kullanıcı diliyle doğrulama | Yapılmadı — yalnız sentetik veri |
| Çıktı güvenliği (H3) | **Açık — hâlâ ölçüldüğü gibi zayıf** |

### `emotional_support` neden UI'a bağlanmadı

Seviye hesaplanıyor, `safetyFlags` içinde `emotional_support_indicated` olarak API'den dönüyor. Ancak **kullanıcıya gösterilecek metin yazılmadı.**

Sebep bilinçli: `docs/02-ETHICAL_CONSTITUTION.md` ve `src/lib/constitution-copy.ts`, kullanıcıya görünen metnin **Anayasa'dan birebir alınmasını** ve paraphrase edilmemesini şart koşuyor. Duygusal destek açılış metnini kendi başıma yazmak bu kuralı çiğnerdi.

**Gereken insan adımı:** Anayasa'ya `EMOTIONAL_SUPPORT` açılış metninin eklenmesi. Sonrasında bağlanması küçük bir iştir.

---

## 9. Sonraki faza geçilebilir mi?

**Evet — H3'e geçilebilir.**

Kriz kapısı artık ölçülebilir biçimde sağlam, dört kapı yeşil, ve hiçbir mevcut garanti zayıflamadı.

**Yayın kararı hâlâ HAYIR.** Çıktı güvenliği (H3) ölçülen en büyük açık risk: 10 saldırgan çıktının 7'si filtreden geçiyor, büyük harfle yazılmış **her** yasak ifade dahil. H2 buna dokunmadı — ama kök nedeni çözen Türkçe katlama altyapısını H3'e hazır hale getirdi.

---

## 10. Kanıt disiplini

- 144 vakanın **tamamı sentetiktir** ve bu oturumda yazılmıştır. Gerçek kullanıcı verisi, transkript veya üretim logu kullanılmamıştır.
- "0 uyuşmazlık" bir **kapsam** sonucudur, doğruluk oranı **değildir**. Gerçek kullanıcılar bu dosyada olmayan şeyler yazacaktır.
- Kriz filtresi teşhis koymaz, risk puanlamaz, triyaj yapmaz.
- Hiçbir canlı sağlayıcı çağrısı yapılmamış, hiçbir ücretli API kullanılmamıştır.

---

*H2 sonu. Sonraki faz: H3 — LLM Output Safety Rebuild.*
