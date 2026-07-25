# Human Lock Review Packet — Sprint 5 Pilot Pair Relations

**Tarih:** 2026-07-23
**Hazırlayan:** Claude (Red Team rolüyle, lock authority olarak değil)
**Karar verecek kişi:** Ümit (Lock Authority — tek başına, kayıt kayıt)
**Kapsam:** `data/knowledge-authoring/records/pairRelations.json` içindeki 6 yeni kayıt, hepsi şu an `red-teamed` durumunda, hiçbiri `locked` değil.

---

## Nasıl kullanılır

Bu belge bir öneri listesidir, bir onay değildir. Her kayıt için "Önerilen
karar" alanı Claude'un red-team bulgularına dayanan bir görüştür — bağlayıcı
değildir. Kilitleme kararını yalnız sen verirsin, kayıt kayıt:

```bash
npm run knowledge:transition -- \
  --recordType pairRelation \
  --recordId <id> \
  --to locked \
  --actorId umit
```

Toplu bir `--all` kilitleme komutu yoktur ve eklenmeyecektir — bu, sprintin
kendisinin var olma sebebi olan garantiyi (insan kararı olmadan hiçbir
kaydın üretime girmemesi) zayıflatır.

Bir kaydı reddetmek (`REJECT`) istersen, transition.ts bunun için bir
"reddedildi" durumu tutmuyor (şema yalnızca draft/reviewed/red-teamed/locked
tanımlıyor) — pratikte reddetme, kaydı `red-teamed`'de bırakıp hiç
kilitlememek, ya da payload'ı değiştirip `draft`'a geri düşürüp yeniden
ingest etmek anlamına gelir. Söyle yeter, ben JSON dosyasını elle
düzenlerim.

---

## Kayıt 1 — `pair-02-high-priestess-09-hermit`

| Alan | Değer |
|---|---|
| **Kart sırası** | 02-Yüksek Rahibe → 09-Ermiş |
| **Relation type** | `reinforces` |
| **Semantic effect** | "Sözcüklere dökülmemiş bir iç bilgiye duyulan güven, kişiyi yalnız ve sessiz bir düşünme sürecine yöneltiyor." |
| **Warnings** | "İzolasyonu öneriyormuş gibi bir dil kullanmayın; bu içe dönüş, dışlanma değil tercih edilen bir mesafe." |
| **Kaynaklar** | `notebooklm-major-arcana-research-2026-07` (ai-assisted-draft), doğrulayan: umit, 2026-07-22T15:10Z |

**Kaynaklardan desteklenen iddialar:** Kaynak, bir NotebookLM araştırma
defteri — yani süreç düzeyinde bir kaynak (bu proje için bir taslak
üretme aracı), belirli bir dış otoritenin bu iddiayı doğrudan
desteklediği anlamına gelmiyor. "Doğrulama" burada "umit bu taslağı
okudu ve yönünü kabul etti" demek, "harici bir kaynak bu iddiayı
onaylıyor" demek değil. Bu, şemanın izin verdiği meşru bir kaynak türü
(`ai-assisted-draft`), ama iddia gücü zayıf — bunu gizlemiyorum.

**Red Team bulgusu:** İlk red-team geçişinde (2026-07-23) bu kayıtta
büyük bir sorun bulunmadı — izolasyon riski zaten warning'de ele
alınmıştı.

**Yapılan düzeltme:** Yok.

**Kalan risk (bu ikinci, daha katı geçişte bulunan):**
1. Yukarıdaki kaynak gücü zayıflığı.
2. Sıra duyarlılığı orta düzeyde: ters çevrilse ("Ermiş → Yüksek Rahibe" —
   yalnızlıktan sözelleştirilmemiş bir iç bilgiye varış) de anlamlı ama
   farklı bir okuma çıkar, yani yön gerçekten bir şey ifade ediyor —
   ama iki yön de "olumsuz olmayan" bir okuma ürettiği için çelişki riski
   düşük.
3. Korkutucu/kesin dil yok. Alan-bağımsız, genel kullanılabilir.
   Toksik pozitiflik/karamsarlık riski düşük.

**Önerilen karar:** `LOCK` — ama kaynak gücü zayıflığını bilerek kabul
ederek. Bu pilotun kabul ettiği kaynak kalitesi; production'da
tek başına yeterli sayılmamalı.

---

## Kayıt 2 — `pair-07-chariot-08-strength`

| Alan | Değer |
|---|---|
| **Kart sırası** | 07-Savaş Arabası → 08-Güç |
| **Relation type** | `transforms` |
| **Semantic effect** | "Dışa dönük, engelleri aşmaya odaklı bir irade gösterimi; zamanla sabır ve şefkatle yönetilen içsel bir güce evriliyor." |
| **Warnings** | "Bu geçişi zayıflık olarak çerçevelemeyin; kontrolün biçim değiştirmesi kararlılığın azalması anlamına gelmez." |
| **Kaynaklar** | `notebooklm-major-arcana-research-2026-07` (ai-assisted-draft), doğrulayan: umit, 2026-07-22T15:12Z |

**Kaynaklardan desteklenen iddialar:** Kayıt 1 ile aynı durum — süreç
düzeyinde kaynak, belirli bir dış otorite değil.

**Red Team bulgusu:** İlk geçişte büyük sorun bulunmadı. "Transforms"
kategorisinin doğru seçim olduğu değerlendirildi (güç türünün
değişmesi, "reinforces" ya da "blocks" değil).

**Yapılan düzeltme:** Yok.

**Kalan risk:**
1. Aynı kaynak gücü zayıflığı (Kayıt 1 ile aynı).
2. Sıra duyarlılığı güçlü: ters çevrilse ("Güç → Savaş Arabası" —
   sabırlı iç gücün dışa dönük, iddialı bir sürüşe dönüşmesi) tamamen
   farklı ve eşit derecede geçerli bir okuma çıkar. Yönlülük burada
   gerçek bir şey ifade ediyor.
3. Korkutucu dil yok. Alan-bağımsız. Toksik pozitiflik/karamsarlık
   riski düşük.

**Önerilen karar:** `LOCK` — aynı kaynak-gücü çekincesiyle.

---

## Kayıt 3 — `pair-10-wheel-of-fortune-12-hanged-man`

| Alan | Değer |
|---|---|
| **Kart sırası** | 10-Kaderin Tekerleği → 12-Asılı Adam |
| **Relation type** | `contrasts` |
| **Semantic effect** | "Kontrolünüz dışındaki bir değişim döngüsü ile bilinçli bir duraklama/teslimiyet arasında gerilim oluşuyor." |
| **Warnings** | "Şansı veya kaderi kesin bir güç olarak sunmayın; vurgu kişinin değişime tepki verme biçimindeki seçimde olmalı." |
| **Kaynaklar** | `tarot-ai-original-synthesis-v1` (original-synthesis) — insan tarafından yazılmış, doğrulama kaydı yok (ai-assisted olmadığı için gerekli değil) |

**Kaynaklardan desteklenen iddialar:** Kaynak, projenin kendi editoryal
sentez çerçevesi — dış bir otorite değil, "bu proje bu şekilde
yorumlamayı tercih ediyor" anlamına geliyor. Bu, şemanın kabul ettiği
meşru bir kategori (`original-synthesis`), ama "iddia dışarıdan
doğrulandı" anlamına gelmiyor.

**Red Team bulgusu (ilk geçiş, 2026-07-23):** Belirgin bir sorun
bulunmadı, warning zaten şans/kader dilini sınırlıyordu.

**Yapılan düzeltme:** Yok (ilk geçişte).

**Kalan risk — bu ikinci, senin verdiğin kontrol listesiyle yapılan
geçişte yeni bulundu:** `semanticEffect` cümlesinin kendisi, warning'den
bağımsız okunduğunda kesinlik ima eden bir zaman kipi kullanıyor:
"...gerilim **oluşuyor**" (şimdiki zaman, kesin). Warning bunu
düzeltiyor ama üretim çıktısında warning her zaman aynı ağırlıkta
kullanılmayabilir. Daha güvenli bir yazım "...gerilim
**oluşabilir**" (olabilirlik kipi) olurdu — LLM'e giden ana iddia
metninin kendisi de temkinli olmalı, yalnız warning'e güvenmemeli.
Sıra duyarlılığı iyi (Tekerlek→Asılı Adam ile tersi anlamca farklı).
Alan-bağımsız. Toksik pozitiflik riski yok, hafif kadercilik riski var
(yukarıdaki nedenle).

**Önerilen karar:** `REVISE` — `semanticEffect` cümlesindeki kesin
zaman kipini olasılık kipine çevirmeni öneririm, sonra kilitle. Bu,
ilk red-team geçişimin kaçırdığı, senin kontrol listesinin yakaladığı
gerçek bir bulgu.

---

## Kayıt 4 — `pair-17-star-19-sun`

| Alan | Değer |
|---|---|
| **Kart sırası** | 17-Yıldız → 19-Güneş |
| **Relation type** | `reinforces` |
| **Semantic effect** | "Zorlu bir sürecin ardından inşa edilen umut, zamanla netlik ve kendine güvenle ifade edilen bir canlılığa doğru olgunlaşma potansiyeli taşıyor." |
| **Warnings** | (1) "Bu ilerlemeyi kesin veya otomatik bir mutluluk vaadi gibi sunmayın; süreç kişiye özgüdür ve doğrusal ilerlemeyebilir." (2) "İki kartın da geleneksel olarak 'olumlu' sayılması garanti bir iyi sonuç anlamına gelmez - bu bir potansiyel, bir kesinlik değil." |
| **Kaynaklar** | `tarot-ai-original-synthesis-v1` |

**Kaynaklardan desteklenen iddialar:** Projenin kendi sentezi — dış
otorite yok, yukarıdaki gibi.

**Red Team bulgusu (ilk geçiş):** **Bulundu ve düzeltildi.** Orijinal
metin "...canlılığa doğru **olgunlaşıyor**" diyordu (kesin, otomatik
ilerleme). İki geleneksel olarak "olumlu" kartın "reinforces" ile
eşleşmesi, garanti bir mutlu son vaadi gibi okunma riski taşıyordu —
bu projenin etik sınırlarının tam olarak önlemeye çalıştığı türden bir
toksik pozitiflik riski.

**Yapılan düzeltme:** "Olgunlaşıyor" → "olgunlaşma **potansiyeli
taşıyor**" (kesinlikten olasılığa). İkinci bir warning eklendi: iki
kartın "olumlu" sayılması garanti sonuç anlamına gelmiyor.

**Kalan risk (bu ikinci geçişte bulunan, yeni):** Yıldız ve Güneş
arasındaki "reinforces" ilişkisi, diğer kayıtlara göre daha az sıra
duyarlı: ters çevrilse ("Güneş → Yıldız" — netlik ve canlılığın yeniden
umuda derinleşmesi) de makul bir okuma çıkar, yani yön burada anlamı
çok değiştirmiyor. Bu bir hata değil (ilişki modeli zaten yönlü
çalışmak zorunda, çekilen kartların sırasına göre), ama "bu iki kart
birbirini gerçekten yönlü mü güçlendiriyor, yoksa sadece ikisi de
'iyi' kart olduğu için mi eşleşiyor" sorusunu sormaya değer.

**Önerilen karar:** `LOCK` — düzeltme yeterli görünüyor, ama yön
duyarlılığı zayıflığını bilerek kabul ederek.

---

## Kayıt 5 — `pair-03-empress-05-hierophant`

| Alan | Değer |
|---|---|
| **Kart sırası** | 03-İmparatoriçe → 05-Hiyerofant |
| **Relation type** | `contrasts` |
| **Semantic effect** | "Organik, besleyici bir büyüme isteği ile paylaşılan yapı ve gelenek ihtiyacı arasında bir gerilim var." |
| **Warnings** | "Geleneği veya yaratıcılığı birbirine üstün gösteren bir dil kullanmayın; ikisi de geçerli ihtiyaçlar." |
| **Kaynaklar** | `tarot-ai-original-synthesis-v1` |

**Kaynaklardan desteklenen iddialar:** Projenin kendi sentezi.

**Red Team bulgusu:** İlk geçişte belirgin bir sorun bulunmadı; warning
zaten nötrlüğü koruyor.

**Yapılan düzeltme:** Yok.

**Kalan risk:** `contrasts` ilişki tipi doğası gereği çift yönlü bir
gerilimi tanımlıyor (`reinforces`/`transforms`/`resolves`'a göre yön
daha az kritik) — bu bir zayıflık değil, ilişki tipinin kendi
mantığı. Korkutucu dil yok. Alan-bağımsız (kariyer, aile, ilişki
bağlamlarına uyarlanabilir). Toksik pozitiflik/karamsarlık riski yok.
Bu altı kayıt içinde en düşük riskli olanı.

**Önerilen karar:** `LOCK`.

---

## Kayıt 6 — `pair-18-moon-20-judgement`

| Alan | Değer |
|---|---|
| **Kart sırası** | 18-Ay → 20-Yargı |
| **Relation type** | `resolves` |
| **Semantic effect** | "Netleşmemiş belirsizlik ve kaygı, dürüst bir öz-değerlendirme anıyla kısmen görünür ve ele alınabilir hale gelme potansiyeli taşıyor." |
| **Warnings** | (1) "Bu geçişi ansızın gelen kesin bir aydınlanma ya da kaygının tamamen ortadan kalkması gibi sunmayın; kademeli ve kısmi bir netleşme sürecidir." (2) "Kaygı temalı bir kart çiftidir; ruh sağlığı hassasiyetiyle, kesin bir çözüm ya da teşhis ima etmeyin." |
| **Kaynaklar** | `tarot-ai-original-synthesis-v1` |

**Kaynaklardan desteklenen iddialar:** Projenin kendi sentezi.

**Red Team bulgusu (ilk geçiş):** **Bulundu ve düzeltildi.** Orijinal
metin "...ele alınabilir hale **geliyor**" ve ilişki tipi `resolves`
kaygının kesin biçimde çözüldüğünü ima etme riski taşıyordu — Ay'ın
kaygı/belirsizlik temalı sembolizmi göz önüne alındığında, bu ruh
sağlığı hassasiyeti açısından gerçek bir risk.

**Yapılan düzeltme:** "Geliyor" → "gelme **potansiyeli taşıyor**".
İkinci bir warning eklendi: ani/kesin aydınlanma ima etmeme + ruh
sağlığı hassasiyetiyle kesin çözüm/teşhis ima etmeme.

**Kalan risk:** Bu altı kayıt içinde en yüksek hassasiyet taşıyanı —
kaygı temalı içerik, mental sağlık bitişikliği nedeniyle en dikkatli
okunması gereken kayıt. Düzeltme sonrası dil temkinli, ama bu kaydın
gerçek kullanıcı okumasında nasıl karşılığa geldiği (LLM narrasyonuna
girdiğinde) yalnızca şema düzeyinde değil, üretilen metin düzeyinde de
ayrıca gözden geçirilmeyi hak ediyor. Sıra duyarlılığı iyi (Ay→Yargı ile
tersi anlamca uyumsuz olurdu). Alan-bağımsız.

**Önerilen karar:** `LOCK` — ama bu kaydı en dikkatli okuman gereken
kayıt olarak işaretliyorum. Düzeltme yeterli görünüyor, kesin karar
senin.

---

## Özet Tablo

| # | Record ID | Önerilen karar | Ana çekince |
|---|---|---|---|
| 1 | `pair-02-high-priestess-09-hermit` | LOCK | Zayıf kaynak gücü (ai-assisted, süreç düzeyinde) |
| 2 | `pair-07-chariot-08-strength` | LOCK | Zayıf kaynak gücü (ai-assisted, süreç düzeyinde) |
| 3 | `pair-10-wheel-of-fortune-12-hanged-man` | **REVISE** | Kesin zaman kipi ("oluşuyor" → "oluşabilir") |
| 4 | `pair-17-star-19-sun` | LOCK | Zayıf yön duyarlılığı (düzeltme sonrası kabul edilebilir) |
| 5 | `pair-03-empress-05-hierophant` | LOCK | En düşük riskli kayıt |
| 6 | `pair-18-moon-20-judgement` | LOCK | En yüksek hassasiyet — en dikkatli okunmalı |

**Not:** Bu ikinci, senin kontrol listenle yapılan geçiş, ilk red-team
geçişinin kaçırdığı bir bulgu ortaya çıkardı (Kayıt 3). Bu, tam olarak
neden tek bir otomatik red-team geçişinin yeterli olmadığını, insan
gözünün neden bu son adımda gerçekten gerekli olduğunu gösteriyor.

---

## Bu paketten sonra ne olur

1. Yukarıdaki tablodan bağımsız olarak, her kaydı tek tek incele.
2. Kilitlemek istediklerin için `npm run knowledge:transition -- --recordType pairRelation --recordId <id> --to locked --actorId umit` çalıştır (ya da bana hangi ID'leri kilitleyeceğimi açıkça söyle).
3. Kilit kararlarından sonra: `npm run knowledge:build -- --version 0.1.0` çalıştırılır, deterministik checksum üretilir, runtime compatibility test'i (KnowledgeBundleSchema + 22 kart kontrolü) geçmesi doğrulanır, ve bir ikinci evidence report yazılır.
4. **Bu adımdan sonra bile gerçek `data/knowledge/` bundle'ına promote edilmez.** Promotion, senin ayrıca onaylayacağın, bağımsız bir checkpoint.
5. Yalnızca kilit + pilot build kanıtı tamamlandığında Sprint 5 "PASS WITH DOCUMENTED DEBT" olarak kapanır.
