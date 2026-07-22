# Milestone 2 Gap Analysis & Development Roadmap v1.0

**Tarih:** 2026-07-22
**Kapsam:** Milestone 1 sonrası tüm geliştirme yolu
**Yazan:** Validation Lead
**Durum:** Taslak — Product Owner onayı bekliyor

---

## Önsöz — Neden Bu Rapor Şimdi Yazıldı

Milestone 1 (Asset Ingestion) donduruldu ve Red Team denetimine açıldı. Bu, ilk kez "temel altyapı" fazının bittiği ve "kullanıcı deneyimi" fazına geçileceği an. Bu rapor, mevcut 8563 satırlık spec dokümantasyonunu (`docs/MVP_PLAN_REVISED.md`, 10 constitution dosyası, AŞAMA_2 wireframe/persona/funnel dosyaları) tek bir gerçeğe indirger:

> **Spec fazı olağanüstü olgun. Kod fazı sıfır.**

Bu rapor yeni bir plan icat etmiyor — mevcut planı denetliyor, gerçek repo durumuyla karşılaştırıyor ve önceliklendiriyor.

---

## 1. Mevcut Durum (As-Is)

### 1.1 Ne Gerçekten Var

| Katman | Durum | Kanıt |
|---|---|---|
| Ürün sözleşmesi (Aşama 1) | ✅ Tamamlandı | `docs/DECISION_LOG.md` — 10 ADR imzalı |
| Etik/Persona/Insight/Visual/Reading/Technical/Analytics/Monetization anayasaları | ✅ Tamamlandı | `docs/01-*.md` → `docs/09-*.md` (10 dosya, 2650+ satır) |
| MVP Exit Criteria | ✅ Tanımlı | `docs/10-MVP_EXIT_CRITERIA.md` |
| Wireframe spec (Aşama 2) | ✅ Spec tamamlandı | `AŞAMA_2_WIREFRAME_SPEC.md`, `_PERSONA_WIREFRAME_PATHS.md`, `_FUNNEL_EVENT_MAP.md` |
| Design System (Aşama 3) | ⏳ Spec var, kod yok | `docs/MVP_PLAN_REVISED.md:215-291` |
| **Major Arcana Asset Pipeline (Aşama 4 = Milestone 1)** | ✅ **Tamamlandı, donduruldu** | 66 asset dosyası, 3 manifest katmanı, Red Team Charter |
| Tarot Bilgi Tabanı (Aşama 5) | ❌ Spec var, veri yok | `data/cards/*.json` yok |
| Intake Engine (Aşama 6) | ❌ Spec var, kod yok | `src/`, `packages/` yok |
| Reading Engine + AI Layer (Aşama 7) | ❌ Spec var, kod yok | Claude entegrasyonu yok |
| Card Selection/Shuffle (Aşama 8) | ❌ Spec var, kod yok | — |
| Auth/Guest Session/Save (Aşama 9) | ❌ Spec var, kod yok | — |
| Analytics/Security/Red Team/100-user test (Aşama 10) | ❌ Spec var, kod yok | — |
| **Uygulama kodu (herhangi biri)** | ❌ **Sıfır** | `find . -iname "*.tsx"` → 0 sonuç, `packages/` dizini yok |

### 1.2 Kritik Gözlem

Repo'da `package.json` monorepo yapısını (`workspaces: ["packages/*"]`) tanımlıyor ama **`packages/` dizini fiziksel olarak yok**. Yani Aşama 1'deki "proje altyapısı" bile iskelet halinde — turborepo config var, gerçek paket yok.

Bu, kullanıcının önerdiği önceliklendirmeyi (P1: Reading Flow UX / Interpretation Engine / Persona Detection) doğruluyor ama şunu da netleştiriyor: **bunlar "eksik özellik" değil, "hiç başlanmamış inşaat."**

### 1.3 Milestone 1'in Gerçek Durumu (referans için)

- Kod: 66 asset dosyası + extraction toolchain — donmuş, değişmeyecek
- Governance: 5 doküman (Gate Profile, Validation Evidence, Charter, vb.)
- Bekleyen: Red Team denetimi (Gates 2,3,4,5,9) + Gatekeeper kararı + hukuki lisans incelemesi (Gate 8)
- **Bu milestone Milestone 2'nin önkoşulu değil** — paralel yürüyebilir (Red Team denetimi sürerken Milestone 2 kodlaması başlayabilir, çünkü asset dosya yolları zaten donmuş ve kararlı)

---

## 2. Hedef Mimari (To-Be)

Kullanıcının önerdiği 4-milestone yapısını benimsiyorum, çünkü mevcut Aşama 5-10 yapısıyla birebir örtüşüyor:

```
Milestone 1: Asset Ingestion & Governance          [DONDU — Red Team bekliyor]
Milestone 2: Reading Experience MVP                 [Aşama 5-9'un implementasyonu]
Milestone 3: Intelligence Layer                     [Aşama 7'nin derinleştirilmesi]
Milestone 4: Insight Engine Platform                [Tarot ötesi modüller]
```

**Milestone 2 = Aşama 5 + 6 + 7 + 8 + 9'un koda dökülmesi.** Aşama 10 (analytics/security/100-user test) Milestone 2'nin *çıkış kapısı*dır, ayrı milestone değil — çünkü mevcut MVP_EXIT_CRITERIA.md zaten tüm ürünü (persona, auth, reading, safety) tek bir rubric'te birleştiriyor.

### 2.1 Milestone 2 Hedef Akışı (spec'ten, değişmedi)

```
Landing → Topic Selection → Intake Questions (persona+context birleşik)
  → Spread Recommendation (inline) → Card Selection/Shuffle
  → First Insight (≤90 sn KPI) → Detailed Synthesis
  → Save Reading (guest→magic link/Google) → Premium Teaser
```

Bu akış zaten `AŞAMA_2_WIREFRAME_SPEC.md`'de saniye saniye bütçelenmiş (toplam 115 sn). **Yeniden tasarlamaya gerek yok — inşa etmek gerekiyor.**

---

## 3. Eksiklik Matrisi

| # | Bileşen | Spec Durumu | Kod Durumu | Blocker mu? |
|---|---|---|---|---|
| 1 | Monorepo iskeleti (`packages/web`, `packages/api`) | ✅ | ❌ Yok | **EVET — her şeyin önkoşulu** |
| 2 | 22 kart JSON veri şeması (anlam, pozisyon, bağlam, red-flag) | ✅ Şema örneği var | ❌ Veri yok | EVET (Reading Engine için) |
| 3 | Intake question flow config | ✅ Akış tanımlı | ❌ Kod yok | Hayır (paralel yazılabilir) |
| 4 | Persona detection logic | ✅ 5 persona tanımlı | ❌ Kod yok | Hayır |
| 5 | Deterministic + Synthesis + AI Language 3 katmanlı Reading Engine | ✅ Şema + prompt tanımlı | ❌ Kod yok | EVET (ürünün kalbi) |
| 6 | Claude API entegrasyonu | ✅ Prompt template var | ❌ Yok | EVET |
| 7 | Card selection/shuffle UI | ✅ Zaman bütçesi var | ❌ Yok | Hayır |
| 8 | Auth (guest/magic-link/Google) | ✅ DB şeması var | ❌ Yok | Orta (guest-only ile MVP mümkün) |
| 9 | Analytics event tracking (12 event) | ✅ JSON şema hazır | ❌ Yok | Hayır (sona bırakılabilir) |
| 10 | Ethical red-lines validator (Zod) | ✅ Kural listesi var | ❌ Yok | EVET (yasal/etik risk) |

**Sonuç:** 10 kritik bileşenden 4'ü ("blocker") olmadan hiçbir çalışan demo mümkün değil: **(1) monorepo iskeleti, (2) kart veri şeması, (5) reading engine, (6) Claude entegrasyonu.**

---

## 4. Önceliklendirme (P0–P3)

| Öncelik | Kalem | Gerekçe |
|---|---|---|
| **P0** | Monorepo iskeleti (`packages/web`, `packages/cards`, `packages/shared`) çalışır hale getir | Hiçbir şey bunsuz derlenmiyor |
| **P0** | 22 kart JSON veri seti (Aşama 5 şeması ile) | Reading Engine'in girdisi |
| **P0** | Deterministic Reading Engine (Layer 1+2, AI'siz) | AI olmadan bile "çalışan bir okuma" üretir — en hızlı demo yolu |
| **P1** | Claude API entegrasyonu (Layer 3) | Kullanıcı gördüğü asıl deneyim; kullanıcının vurguladığı "90 saniyede fark" burada |
| **P1** | Intake Engine + Persona Detection | Kişiselleştirme olmadan ürün jenerik hisseder |
| **P1** | Card Selection/Shuffle UI | Ritüel hissi olmadan "başka bir tarot uygulaması" gibi görünür |
| **P2** | Guest session + Save Reading | İlk demo guest-only çalışabilir; auth sona ertelenir |
| **P2** | Premium modal + tracking | Gelir doğrulaması, MVP çekirdeği değil |
| **P2** | Analytics event pipeline | Ölçüm olmadan da demo çalışır; ama 100-kullanıcı testinden önce şart |
| **P3** | Ses efektleri, tema seçenekleri, gelişmiş animasyon | Kullanıcının da belirttiği gibi düşük etki |

**Kullanıcının önerisiyle örtüşme:** Kullanıcının P1 listesi (Reading Flow UX, Interpretation Engine, Persona Detection) ile bu matris hizalı; tek fark, monorepo iskeleti + kart verisi + deterministic engine'i P0 olarak öne çekiyorum çünkü bunlar olmadan P1 kalemlerinin hiçbiri test edilemez.

---

## 5. Teknik Borç

| Kalem | Kaynak | Durum |
|---|---|---|
| HQ görsel çözünürlüğü (2048×3072, 9.77x interpolated upscale) | Milestone 1 | Belgelenmiş, Phase 2'de 1024×1536 gerçek yüksek-çözünürlük ile değiştirilmesi önerilir |
| Red Team denetimi henüz tamamlanmadı (Gates 2,3,4,5,9) | Milestone 1 | Milestone 2 kodlamasını bloklamaz, ama production entegrasyonunu bloklar |
| Lisans/provenance incelemesi (Gate 8) | Milestone 1 | Hukuki inceleme bekliyor — production launch'ı bloklar |
| `packages/*` iskeleti `package.json`'da tanımlı ama dizinler yok | Aşama 1 | P0 olarak bu raporda ele alındı |
| Test suite (`tests/assets.test.js`) kodlandı, hiç çalıştırılmadı | Milestone 1 | Red Team'in ilk işi bu olmalı |

---

## 6. UX Eksikleri

- **Reveal/shuffle animasyonu:** Spec'te zaman bütçesi var (Aşama 8), hiç prototiplenmedi — mobilde 60fps garantisi test edilmemiş.
- **Persona'ya göre ton farklılaşması:** 5 persona × 3 ekran varyantı (`AŞAMA_2_PERSONA_WIREFRAME_PATHS.md`) yazılı ama render edilmiş hiçbir ekran yok; gerçek kullanıcıda "fark ediliyor mu" sorusu test edilmemiş.
- **Erişilebilirlik:** 44×44px dokunma hedefi, 4.5:1 kontrast, `prefers-reduced-motion` kriterleri spec'te var, hiçbir bileşen olmadığı için doğrulanamaz.
- **"İlk 90 saniye" iddiası hiç ölçülmedi:** KPI tanımlı (Time to First Insight ≤90 sn) ama ölçecek hiçbir kod yok.

---

## 7. AI/Insight Eksikleri

- **Prompt injection savunması test edilmedi** — Aşama 7'nin Red Team sorusu ("Claude prompt'u injection'a açık mı?") henüz sorulamaz çünkü entegrasyon yok.
- **Deterministic layer bypass riski** teorik olarak belgelenmiş, kod olmadan doğrulanamaz.
- **Fallback modu (AI offline → deterministic-only)** spec'te var, hiç implemente edilmedi — bu aslında **P0'a yakın bir P1**, çünkü Claude API'siz bile "çalışan" bir okuma motoru vermek en ucuz/en hızlı demo yoludur (bkz. Bölüm 4).
- **Kesin kehanet / yasaklı ifade filtresi (Zod red-lines):** Şema var, validator kodu yok.

---

## 8. Risk Analizi

| Risk | Olasılık | Etki | Azaltma |
|---|---|---|---|
| Spec zenginliği kod başlamasını erteler ("analiz felci") | Orta | Yüksek | P0 listesini bu hafta içinde küçük, kanıtlanabilir commit'lere böl |
| Claude prompt'u kesin kehanet üretir (hukuki/etik risk) | Orta | Yüksek | Zod red-line validator'ı Layer 3 ile birlikte, ayrı değil, aynı PR'da yaz |
| Milestone 1 Red Team bulguları Milestone 2 asset yollarını değiştirir | Düşük | Orta | Asset path'leri (`00-fool.webp` vb.) donmuş; Red Team sadece *doğruluyor*, isim değiştirmiyor |
| Guest→auth geçişinde veri kaybı | Orta | Orta | Aşama 9 DB şeması `session_id` alanını zaten guest okumalar için ayırmış — koda sadık kal |
| "Her şey speclenmiş" yanılgısıyla gerçek kullanıcı testi ertelenir | Yüksek | Yüksek | Milestone 2 çıkış kriteri, spec tamamlanması değil, **çalışan bir demo ile 5 gerçek kullanıcı testi** olmalı |

---

## 9. Sprint Planı (Öneri — 3 Sprint, ~6 hafta)

### Sprint 1: İskelet + Deterministic Çekirdek
- `packages/web`, `packages/api`, `packages/cards`, `packages/shared` dizinlerini kur
- 22 kart JSON veri setini Aşama 5 şemasıyla doldur (uzman/danışman review dahil)
- Deterministic Reading Engine (Layer 1+2, AI'siz) — 3 kart açılımı için çalışan çıktı
- **Çıkış kanıtı:** CLI'dan `npx reading --cards=00-fool,05-hierophant,14-temperance` çalışıp Zod-valid JSON üretir

### Sprint 2: AI Layer + Intake + Temel UI
- Claude entegrasyonu (Layer 3) + red-line validator aynı PR'da
- Intake Engine (topic + persona detection, hard-coded rules)
- Landing → Topic → Questions → Reading Display minimal React akışı (stil yok, işlevsellik var)
- **Çıkış kanıtı:** Tarayıcıda uçtan uca bir okuma tamamlanabiliyor, süre ölçülüyor

### Sprint 3: Deneyim Katmanı + Guest Save
- Card selection/shuffle animasyonu + Design System bileşenleri
- Guest session + save reading (auth olmadan, session-based)
- Premium modal (statik, tracking'siz olabilir)
- Analytics event'lerin en kritik 4 tanesi (funnel start, first insight, save, premium view)
- **Çıkış kanıtı:** 5 gerçek kullanıcıyla informal test, Time-to-First-Insight ölçümü

**Not:** Auth (magic link/Google OAuth), tam analytics pipeline ve 100-kullanıcı testi bilinçli olarak Milestone 2'nin *dışına* değil, *sonuna* konuldu — bunlar olmadan da "çalışan bir ürün" iddiası test edilebilir.

---

## 10. Milestone 2 Başarı Kriterleri

Milestone 2 şu ana kadar tamamlandı sayılamaz:

- [ ] `packages/*` altında derlenen, çalışan bir monorepo var
- [ ] En az 3 kart için deterministic reading engine çıktısı Zod şemasına uyuyor
- [ ] Claude API entegrasyonu canlı bir okuma üretiyor VE red-line validator hiçbir yasaklı ifadeye izin vermiyor
- [ ] Bir kullanıcı landing'den reading display'e tarayıcıda gerçekten gidebiliyor (mock değil)
- [ ] Time-to-First-Insight gerçekten ölçülüyor (hedef ≤90 sn, mevcut sonuç ne olursa olsun raporlanmalı)
- [ ] En az 5 gerçek kullanıcı (persona başına 1) informal test yapmış ve geri bildirim toplanmış
- [ ] Guest okuma kaydedilip geri çağrılabiliyor
- [ ] Kullanıcının sorduğu soruya ("Kullanıcı ilk 90 saniyede neden bu farklı diyecek?") somut, ölçülmüş bir cevap var — varsayım değil

**Gatekeeper için tek soru:** Bu liste tamamlandığında elimizde spec değil, **tıklanabilir, ölçülmüş bir ürün** olacak mı? Cevap hayırsa, Milestone 2 kapanmamıştır.

---

**Versiyon:** 1.0
**Sonraki İnceleme:** Sprint 1 çıkış kanıtı teslim edildiğinde
**İlişkili Dokümanlar:** `docs/MVP_PLAN_REVISED.md` (Aşama 5-10 detayları), `docs/10-MVP_EXIT_CRITERIA.md`, `AŞAMA_2_*` (wireframe/persona/funnel spec'leri), `validation/RED_TEAM_AUDIT_CHARTER_v1.0.md` (Milestone 1 paralel süreç)
