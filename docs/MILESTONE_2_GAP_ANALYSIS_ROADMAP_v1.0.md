# Milestone 2 — Foundation & Executable Core: Gap Analysis & Development Roadmap v1.1

**Tarih:** 2026-07-22
**Kapsam:** Milestone 1 sonrası tüm geliştirme yolu
**Yazan:** Validation Lead
**Durum:** ✅ **MILESTONE 2 KAPANDI** — PASS WITH DOCUMENTED DEBT. Sprint 1/2/3/4 hepsi kapandı. Sprint 5 (Knowledge Authoring Pipeline & Source Governance, Milestone 3'ün ilk sprinti) de PASS WITH DOCUMENTED DEBT ile kapandı — detay: `validation/reports/SPRINT-5-KNOWLEDGE-AUTHORING-PIPELINE/CLOSURE_EVIDENCE_REPORT.md`. Geliştirme artık `feat/insight-engine-milestone-3` branch'inde devam ediyor (ADR-013). Sonraki sprint **Persistence & Reading History değil** — Product Owner'ın Sprint 5 kapanışı sonrası kararıyla **Sprint 6 = Live Evaluation & Product Readiness**; Persistence Sprint 7'ye ertelendi.

**Not (2026-07-23, kapsam değişikliği değil):** Product Owner, ürünün
uzun vadeli konumlandırması için bir yön önerisi paylaştı: günlük tarot
yerine Daily (hafif katman) / Weekly (tema özeti) / Threshold (asıl tarot
açılımı, yalnız önemli hayat eşiklerinde) kullanım modeli, ürünün "Insight
Engine" olarak yeniden konumlandırılması. Bu, `docs/DECISION_LOG.md`'de
**"Draft Decision — Proposed, Not Yet Accepted: Insight Cadence Model"**
olarak tam detayıyla kayda geçirildi — henüz kabul edilmiş bir ADR değil,
Sprint 6'nın kapsamını değiştirmiyor. Sprint 6 kapanışından sonra,
gerçek bir evaluation baseline'a karşı sıralanacak.

---

## Revizyon Notu (v1.0 → v1.1)

Product Owner incelemesinde v1.0'daki mimari varsayımı doğrulama isteği geldi. Doğrulama sonucu **iki gerçek çelişki** bulundu ve düzeltildi:

1. **Monorepo varsayımı yanlıştı.** v1.0, `packages/web`/`packages/api`/`packages/cards`/`packages/shared` öneriyordu. Ama `docs/07-TECHNICAL_CONSTITUTION.md:15` ve `docs/DECISION_LOG.md` ADR-003 (Accepted) açıkça **"no monorepo complexity, single Next.js app"** diyor. Kök `package.json`'daki `workspaces: ["packages/*"]` ve `turbo.json` bu kilitli karara aykırı, erken (muhtemelen Aşama 1 öncesi) bir taslaktan kalmıştı. **Düzeltme:** `package.json`'dan workspace tanımı kaldırıldı, `turbo.json` silindi. Mimari artık ADR-003'e sadık: tek Next.js 16 app, `src/` ağacı (Technical Constitution'daki Code Organization bölümüne göre).
2. **Reversed kart varsayımı yanlıştı.** Sprint 1 demo örneğinde `"orientation": "reversed"` kullanılmıştı. Ama ADR-002 (Accepted) **"Reversed Cards Excluded from MVP"** diyor. **Düzeltme:** Sprint 1 çıktısı artık her zaman `"orientation": "upright"` döner; alan şemada durur (post-MVP için) ama MVP'de sabit değer alır.

Ayrıca not edilen ama bu sürümde henüz aksiyon alınmayan bir üçüncü tutarsızlık: `docs/MVP_PLAN_REVISED.md` Aşama 9, ORM olarak Prisma öneriyor; ADR-009 ise Drizzle'ı kilitlemiş. Bu, Sprint 2/3'te auth+persistence çalışması başlamadan önce çözülmeli, Sprint 1'i bloklamıyor.

Bu bölümün geri kalanı bu iki düzeltmeyi yansıtacak şekilde güncellenmiştir.

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
| Intake Engine (Aşama 6) | ❌ Spec var, kod yok | `src/` yok |
| Reading Engine + AI Layer (Aşama 7) | ❌ Spec var, kod yok | Claude entegrasyonu yok |
| Card Selection/Shuffle (Aşama 8) | ❌ Spec var, kod yok | — |
| Auth/Guest Session/Save (Aşama 9) | ❌ Spec var, kod yok | — |
| Analytics/Security/Red Team/100-user test (Aşama 10) | ❌ Spec var, kod yok | — |
| **Uygulama kodu (herhangi biri)** | ❌ **Sıfır** | `find . -iname "*.tsx"` → 0 sonuç, `packages/` dizini yok |

### 1.2 Kritik Gözlem

Repo'da kök `package.json`, düzeltilmeden önce monorepo yapısını (`workspaces: ["packages/*"]`) tanımlıyordu ama **`packages/` dizini fiziksel olarak hiç yoktu**, ve bu tanım ADR-003'ün kilitlediği "single Next.js app" kararıyla çelişiyordu. Bu tutarsızlık v1.1'de giderildi (bkz. Revizyon Notu): workspace tanımı ve `turbo.json` kaldırıldı. Yani Aşama 1'deki "proje altyapısı" hem iskelet hem de yanlış mimariye göre kurulmuştu.

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

**İsimlendirme düzeltmesi (v1.1):** Milestone 2'nin ilk yarısı doğrudan UX'e değil, **çalıştırılabilir çekirdeğe** odaklanmalı — bu yüzden bu aşama "Foundation & Executable Core" olarak adlandırıldı. Wireframe/persona/UX işi (spec olarak zaten olgun) bu çekirdek üzerine ikinci yarıda inşa edilir; önce çalışan bir motor, sonra deneyim katmanı.

**Mimari (ADR-003 uyumlu, monorepo değil):** Tek Next.js 16 app, kök dizinde `src/` ağacı — `docs/07-TECHNICAL_CONSTITUTION.md`'nin zaten tanımladığı yapı (`src/app`, `src/server/{reading-engine,intake}`, `src/lib`, `src/db`, `src/__tests__`). `packages/*` yok, ayrı backend yok.

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
| 1 | Next.js 16 app iskeleti (`src/` ağacı, ADR-003 uyumlu) | ✅ | ❌ Yok | **EVET — her şeyin önkoşulu** |
| 2 | 22 kart JSON veri şeması (anlam, pozisyon, bağlam, red-flag) | ✅ Şema örneği var | ❌ Veri yok | EVET (Reading Engine için) |
| 3 | Intake question flow config | ✅ Akış tanımlı | ❌ Kod yok | Hayır (paralel yazılabilir) |
| 4 | Persona detection logic | ✅ 5 persona tanımlı | ❌ Kod yok | Hayır |
| 5 | Deterministic + Synthesis + AI Language 3 katmanlı Reading Engine | ✅ Şema + prompt tanımlı | ❌ Kod yok | EVET (ürünün kalbi) |
| 6 | Claude API entegrasyonu | ✅ Prompt template var | ❌ Yok | EVET |
| 7 | Card selection/shuffle UI | ✅ Zaman bütçesi var | ❌ Yok | Hayır |
| 8 | Auth (guest/magic-link/Google) | ✅ DB şeması var (ORM: Drizzle, ADR-009) | ❌ Yok | Orta (guest-only ile MVP mümkün) |
| 9 | Analytics event tracking (12 event) | ✅ JSON şema hazır | ❌ Yok | Hayır (sona bırakılabilir) |
| 10 | Ethical red-lines validator (Zod) | ✅ Kural listesi var | ❌ Yok | EVET (yasal/etik risk) |

**Sonuç:** 10 kritik bileşenden 4'ü ("blocker") olmadan hiçbir çalışan demo mümkün değil: **(1) Next.js app iskeleti, (2) kart veri şeması, (5) reading engine, (6) Claude entegrasyonu.**

---

## 4. Önceliklendirme (P0–P3)

| Öncelik | Kalem | Gerekçe |
|---|---|---|
| **P0** | Tek Next.js 16 app iskeleti (`src/app`, `src/server`, `src/lib`) çalışır hale getir | Hiçbir şey bunsuz derlenmiyor; ADR-003 uyumlu, monorepo yok |
| **P0** | 22 kart JSON veri seti (Aşama 5 şeması ile) | Reading Engine'in girdisi |
| **P0** | Deterministic Reading Engine (Layer 1+2, AI'siz) | AI olmadan bile "çalışan bir okuma" üretir — en hızlı demo yolu |
| **P0** | Vitest test runner kurulumu (`tests/assets.test.js` Vitest'e taşınır) | Şu an repo'da hiçbir test runner kurulu değil; Technical Constitution Vitest'i kilitliyor |
| **P1** | Claude API entegrasyonu (Layer 3) | Kullanıcı gördüğü asıl deneyim; kullanıcının vurguladığı "90 saniyede fark" burada |
| **P1** | Intake Engine + Persona Detection | Kişiselleştirme olmadan ürün jenerik hisseder |
| **P1** | Card Selection/Shuffle UI | Ritüel hissi olmadan "başka bir tarot uygulaması" gibi görünür |
| **P2** | Guest session + Save Reading | İlk demo guest-only çalışabilir; auth sona ertelenir |
| **P2** | Premium modal + tracking | Gelir doğrulaması, MVP çekirdeği değil |
| **P2** | Analytics event pipeline | Ölçüm olmadan da demo çalışır; ama 100-kullanıcı testinden önce şart |
| **P3** | Ses efektleri, tema seçenekleri, gelişmiş animasyon | Kullanıcının da belirttiği gibi düşük etki |

**Kullanıcının önerisiyle örtüşme:** Kullanıcının P1 listesi (Reading Flow UX, Interpretation Engine, Persona Detection) ile bu matris hizalı; tek fark, app iskeleti + kart verisi + deterministic engine + test runner'ı P0 olarak öne çekiyorum çünkü bunlar olmadan P1 kalemlerinin hiçbiri test edilemez.

---

## 5. Teknik Borç

| Kalem | Kaynak | Durum |
|---|---|---|
| HQ görsel çözünürlüğü (2048×3072, 9.77x interpolated upscale) | Milestone 1 | Belgelenmiş, Phase 2'de 1024×1536 gerçek yüksek-çözünürlük ile değiştirilmesi önerilir |
| Red Team denetimi henüz tamamlanmadı (Gates 2,3,4,5,9) | Milestone 1 | Milestone 2 kodlamasını bloklamaz, ama production entegrasyonunu bloklar |
| Lisans/provenance incelemesi (Gate 8) | Milestone 1 | Hukuki inceleme bekliyor — production launch'ı bloklar |
| ~~`packages/*` iskeleti `package.json`'da tanımlı ama ADR-003'e aykırıydı~~ | Aşama 1 | ✅ Çözüldü (v1.1): workspace tanımı + `turbo.json` kaldırıldı |
| Test suite (`tests/assets.test.js`) Jest sözdizimiyle yazıldı, ama repo'da ne Jest ne Vitest kurulu | Milestone 1 | Sprint 1 P0: Vitest kur, testi taşı, çalıştır |
| `MVP_PLAN_REVISED.md` Aşama 9 Prisma öneriyor, ADR-009 Drizzle'ı kilitlemiş | Aşama 9 spec | Sprint 2/3'te auth+persistence başlamadan önce çözülmeli; Sprint 1'i bloklamıyor |

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

### Sprint 1: Foundation & Executable Core ✅ KAPANDI

**Durum:** GO with recorded debt. Kanıt: bu dokümanın kendisi + `docs/SECURITY_DEBT_LOG.md` (SECURITY-DEBT-001, Sprint 1'de açıldı).

- ADR-003 uyumlu tek Next.js 16 app iskeletini kur (`src/app`, `src/server`, `src/lib`, `src/db`, `src/__tests__`) — `packages/*` yok, ayrı backend yok
- Vitest test runner kur, `tests/assets.test.js`'i Vitest'e taşı ve çalıştır (Milestone 1'in kendi test suite'inin ilk kez çalıştırılması)
- 22 kart JSON veri setini Aşama 5 şemasıyla doldur (uzman/danışman review dahil)
- Deterministic Reading Engine (Layer 1+2, AI'siz) — 3 kart açılımı için çalışan çıktı, **ADR-002 gereği her zaman `orientation: "upright"`**
- **Çıkış kanıtı (kilitli acceptance criteria):**
  ```
  npm install
  npm run test          # Vitest, assets.test.js dahil tümü yeşil
  npm run build         # Next.js build hatasız
  npm run demo:reading  # deterministik, seed'e bağlı çıktı
  ```
  `demo:reading` örnek çıktısı:
  ```json
  {
    "seed": "demo-001",
    "spread": "three-card",
    "cards": [
      { "id": "00-fool", "position": "past", "orientation": "upright" },
      { "id": "11-justice", "position": "present", "orientation": "upright" },
      { "id": "17-star", "position": "future", "orientation": "upright" }
    ]
  }
  ```
  Aynı seed (`demo-001`) her çalıştırmada byte-identical aynı JSON'ı üretmeli — Milestone 1'deki "reproducibility" ilkesinin Reading Engine'e taşınmış hali.

### Sprint 2: Intake, Provider Abstraction and Safe Narration ✅ KAPANDI

**Durum:** PASS WITH DOCUMENTED DEBT. Kanıt: `validation/reports/SPRINT-2-FOUNDATION-CORE/BUILD_EVIDENCE_REPORT.md`.

Fiilen teslim edilen kapsam, orijinal plandan farklı sıralandı (kullanıcının
kapanış talimatıyla kilitlendi): UI **bilinçli olarak ertelendi**, önce
`InterpretationProvider` mimarisi + Intake Engine + Claude adapter'ın
mock-HTTP ile doğrulanması yapıldı — ADR-011'in gerektirdiği sıra buydu.

- ✅ ESLint 9 flat-config restore (S2-P0)
- ✅ `InterpretationProvider` arayüzü + `MockProvider` (deterministik)
- ✅ Intake Engine (kural-tabanlı, LLM'siz, session-scoped persona taksonomisi)
- ✅ `ClaudeProvider` adapter (mock-HTTP testli, canlı çağrı yok — ayrı `integration:anthropic` kapısı bekliyor)
- ✅ Red-line validator (Layer 1 + Layer 3 çıktısını kapsayacak şekilde genişletildi)
- ❌ Landing → Topic → Questions → Reading Display UI akışı — **yapılmadı, Sprint 3'e ertelendi**
- **Çıkış kanıtı:** 49/49 test, lint/typecheck/build temiz — detay: yukarıdaki BUILD_EVIDENCE_REPORT.md

### Sprint 3: Knowledge Contract & Product API ✅ KAPANDI

**Durum:** PASS WITH DOCUMENTED DEBT. Kanıt: `validation/reports/SPRINT-3-KNOWLEDGE-CONTRACT-API/BUILD_EVIDENCE_REPORT.md`.

Bu, orijinal planda "Sprint 3: Deneyim Katmanı + Guest Save" olarak
tanımlanan kapsamın **tamamen yerine geçti** — Product Owner'ın Milestone 2
checkpoint kararıyla (bkz. ADR-012), UI/deneyim katmanına geçmeden önce
Reading Engine ile Provider arasına bir Knowledge Layer + tek bir ürün API
sözleşmesi kilitlendi, çünkü UI/persistence bu sözleşmeye bağımlı olacaktı.

- ✅ Knowledge Contract şemaları (`PairRelation`, `PositionRule`, `DomainModifier`, `PersonaModifier`, `SafetyConstraint`, `KnowledgeBundle`, `KnowledgeContext`)
- ✅ `KnowledgeProvider` arayüzü + `LocalJsonKnowledgeProvider` (proof-of-concept veri, kasıtlı eksik kapsam — `partial` durumu gerçekten test edilebilsin diye)
- ✅ Tek ürün endpoint'i: `POST /api/readings` — crisis gate route seviyesinde zorlanıyor, IntakeContext her zaman sunucuda üretiliyor
- ✅ Functional UI shell (tasarım yok, sadece soru→3 kart→yorum→hata/fallback/crisis durumları çalışıyor)
- ❌ Card selection/shuffle animasyonu, Design System, guest session/save, premium modal, analytics — **hiçbiri yapılmadı, sonraki Milestone 2 checkpoint'te yeniden sıralanacak**
- **Çıkış kanıtı:** 75/75 test, lint/typecheck/build temiz, 5 farklı pipeline sonucu (normal/partial/fallback/narration-fallback/crisis) ayrı ayrı doğrulandı — detay: yukarıdaki BUILD_EVIDENCE_REPORT.md

### Sprint 4: UI Design Contract & Functional Reading Flow ✅ KAPANDI

**Durum:** PASS WITH DOCUMENTED DEBT. Kanıt: `validation/reports/SPRINT-4-UI-DESIGN-CONTRACT/BUILD_EVIDENCE_REPORT.md`.

- ✅ `docs/SPRINT_4_UI_DESIGN_CONTRACT_PLAN.md` onaylandı, UX-DEBT-001 (persona eşleme) çözüldü ve kapandı
- ✅ 9 bileşen (`ConsentModal`, `QuestionForm`, `ShuffleReveal`, `CardNarrationItem`, `DiagnosticBadge`, `ReadingResult`, `CrisisNotice`, `ErrorNotice`, `DisclaimerFooter`) — sözleşmedeki sınırlarla birebir
- ✅ 5 pipeline sonucu (normal/partial/fallback-knowledge/fallback-narration/crisis) ayrı ayrı test edildi, hiçbiri hata sayılmadı
- ✅ Gerçek tarayıcıda Playwright ile uçtan uca doğrulandı (consent→topic hint→question→shuffle→result), exit code 0
- ✅ UI güvenlik sınırları kanıtlı: `QuestionForm` sadece izinli alanları üretiyor, `CrisisNotice` tip seviyesinde tarot içeriği kabul edemiyor, kart sıralaması hiç değişmiyor, intake istemcide hiç hesaplanmıyor
- ❌ Tasarım kimliği kilitlenmedi (placeholder token'lar), persistence/guest-save/premium UI yok
- **Çıkış kanıtı:** 106/106 test, lint/typecheck/build temiz, tarayıcı kanıtı + hydration gözlemi belgeli — detay: yukarıdaki BUILD_EVIDENCE_REPORT.md

**Not:** Auth (magic link/Google OAuth), guest session/save, tam analytics pipeline, premium UI ve 100-kullanıcı testi Milestone 2'nin *dışına* değil *sonuna* konuldu. Sıralama kararı verildi: UI Design Contract (Sprint 4, tamamlandı) → Knowledge Authoring Pipeline (Sprint 5) → Persistence & Reading History (Sprint 6).

---

## 10. Milestone 2 Başarı Kriterleri

**Milestone 2 kapandı (2026-07-23) — PASS WITH DOCUMENTED DEBT.** Aşağıdaki liste tam checklist tamamlanması değil, kapanış anındaki durumun kaydıdır:

- [x] ADR-003 uyumlu, `src/` altında derlenen, çalışan tek bir Next.js app var (monorepo yok) — Sprint 1
- [x] En az 3 kart için deterministic reading engine çıktısı Zod şemasına uyuyor — Sprint 1
- [ ] Claude API entegrasyonu canlı bir okuma üretiyor VE red-line validator hiçbir yasaklı ifadeye izin vermiyor — **kısmen, kapanışı bloke etmiyor**: red-line validator ✅ (Sprint 2), Claude entegrasyonu mock-HTTP ile doğrulandı ✅ ama canlı çağrı ❌ (ayrı `integration:anthropic` kapısı, açık debt)
- [x] Bir kullanıcı landing'den reading display'e tarayıcıda gerçekten gidebiliyor (mock değil) — Sprint 4, gerçek tarayıcıda Playwright ile kanıtlandı. Narration hâlâ MockProvider fallback'inde (API key yok) — bu görüntülenen akışı geçersiz kılmıyor, ayrı bir açık debt (canlı Anthropic entegrasyonu)
- [ ] Time-to-First-Insight gerçekten ölçülüyor — **açık debt**, analytics pipeline'a bağlı (Sprint 6+)
- [ ] En az 5 gerçek kullanıcı (persona başına 1) informal test yapmış ve geri bildirim toplanmış — **açık debt**
- [ ] Guest okuma kaydedilip geri çağrılabiliyor — **açık debt**, Persistence Sprint 6'ya ertelendi
- [x] Kullanıcının sorduğu soruya ("Kullanıcı ilk 90 saniyede neden bu farklı diyecek?") somut bir cevap var — varsayım değil: görünür, test edilmiş, tarayıcıda çalışan bir pipeline (Intake→Safety Gate→Knowledge→Narration→UI), rakiplerin çoğunun sahip olmadığı bir güvenlik/şeffaflık katmanıyla

**Gatekeeper kararı:** Yukarıdaki 4 açık madde (canlı Claude entegrasyonu, Time-to-First-Insight ölçümü, 5 kullanıcı testi, guest save) **kapanışı bloke etmiyor** — bunlar sonraki sprintlerin (Knowledge Authoring, Persistence) doğal kapsamı, "spec kaldı" anlamına gelmiyor çünkü hepsi zaten yol haritasında yerini almış açık debt kalemleri. Milestone 2'nin kendi hedefi ("tıklanabilir, ölçülmüş bir ürün omurgası") karşılandı: Sprint 1-4 boyunca inşa edilen dikey dilim gerçek tarayıcıda, gerçek API ile, 5 farklı durum için ayrı ayrı kanıtlanmış şekilde çalışıyor.

---

**Versiyon:** 1.8
**Sonraki İnceleme:** Sprint 6 (Live Evaluation & Product Readiness) kapanışında - Product Owner değerlendirmesi bekleniyor
**İlişkili Dokümanlar:** `docs/MVP_PLAN_REVISED.md` (Aşama 5-10 detayları), `docs/10-MVP_EXIT_CRITERIA.md`, `docs/07-TECHNICAL_CONSTITUTION.md` (ADR-003 mimari), `docs/DECISION_LOG.md` (ADR-002, ADR-003, ADR-009, ADR-011, ADR-012, ADR-013, Draft Decision: Insight Cadence Model), `docs/SECURITY_DEBT_LOG.md`, `docs/UX_DEBT_LOG.md` (kapandı — bkz. Sprint 4), `docs/ASSET_LICENSING_DEBT_LOG.md` (açık, 44/44 unverified), `AŞAMA_2_*` (wireframe/persona/funnel spec'leri), `validation/RED_TEAM_AUDIT_CHARTER_v1.0.md` (Milestone 1 paralel süreç), `validation/reports/SPRINT-2-FOUNDATION-CORE/BUILD_EVIDENCE_REPORT.md`, `docs/SPRINT_3_KNOWLEDGE_CONTRACT_API_PLAN.md`, `validation/reports/SPRINT-3-KNOWLEDGE-CONTRACT-API/BUILD_EVIDENCE_REPORT.md`, `docs/SPRINT_4_UI_DESIGN_CONTRACT_PLAN.md`, `validation/reports/SPRINT-4-UI-DESIGN-CONTRACT/BUILD_EVIDENCE_REPORT.md` (Sprint 4 plan + kapanış kanıtı), `docs/SPRINT_5_KNOWLEDGE_AUTHORING_PIPELINE_PLAN.md`, `validation/reports/SPRINT-5-KNOWLEDGE-AUTHORING-PIPELINE/{BUILD_EVIDENCE_REPORT.md,HUMAN_LOCK_REVIEW_PACKET.md,CLOSURE_EVIDENCE_REPORT.md}` (Sprint 5 plan + kapanış kanıtı), `docs/SPRINT_6_LIVE_EVALUATION_PRODUCT_READINESS_PLAN.md` (Sprint 6 plan, APPROVED — GO WITH REVISIONS), `validation/reports/SPRINT-6-LIVE-EVALUATION/{BUILD_EVIDENCE_REPORT.md,BETA_READINESS_CHECKLIST.md}` (Sprint 6 evidence, pending Product Owner review)

### Changelog

- **v1.8 (2026-07-23):** Sprint 6 implementation evidence produced (not yet Product-Owner-reviewed/closed): evaluation harness, additive reading-engine instrumentation (fallbackReason/token usage, zero behavioral change to existing fields), 24-case fixed evaluation dataset, 5 zero-tolerance security/architecture invariants proven live, Live Anthropic gate honestly reporting `NOT EXECUTED`/`credentials unavailable` (no key in this environment). 168/168 tests pass. Beta Readiness Checklist opened: **NOT READY** - blocked independently by (1) 44/44 unresolved asset-licensing entries and (2) no real-provider evaluation data yet.
- **v1.7 (2026-07-23):** Product Owner'ın Insight Cadence Model yön önerisi (Daily/Weekly/Threshold kullanım modeli, "Insight Engine" konumlandırması) `docs/DECISION_LOG.md`'ye Draft Decision olarak kaydedildi - kabul edilmiş bir ADR değil, Sprint 6 kapsamını değiştirmiyor. Sprint 6 plan dokümanı (proposal) eklendi.
- **v1.6 (2026-07-23):** Product Owner Sprint 5 kapanışına ONAY verdi ve sıradaki sprinti yeniden tanımladı: **Sprint 6 = Live Evaluation & Product Readiness** (gerçek Anthropic API entegrasyon kapısı, evaluation dataset, latency/fallback/schema-failure/red-line-rejection oranları, narration kalite rubric'i, token/maliyet ölçümü, prompt version karşılaştırması, insan değerlendirme formu, production asset licensing envanteri, kapalı beta hazırlığı). Persistence & Reading History Sprint 7'ye ertelendi.
- **v1.5 (2026-07-23):** Sprint 5 (Knowledge Authoring Pipeline & Source Governance) **PASS WITH DOCUMENTED DEBT ile kapandı** — 6 pilot kayıttan 3'ü insan kararıyla tek tek kilitlendi, 3'ü revizyonda kaldı (bkz. CLOSURE_EVIDENCE_REPORT.md). ADR-013 ile geliştirme `feat/insight-engine-milestone-3` branch'ine taşındı.
- **v1.4 (2026-07-23):** Sprint 4 kapanış durumu işlendi, **Milestone 2 resmen kapatıldı** (PASS WITH DOCUMENTED DEBT, bkz. Bölüm 9-10). UX-DEBT-001 kapandı. Sonraki sprint: Knowledge Authoring Pipeline & Source Governance.
- **v1.3 (2026-07-23):** Sprint 3 kapanış durumu işlendi (bkz. Bölüm 9) — orijinal "Deneyim Katmanı + Guest Save" planının yerine Knowledge Contract & Product API geçti (ADR-012 kararıyla). Milestone 2 başarı kriterlerinden 1 madde kısmi olarak güncellendi.
- **v1.2 (2026-07-22):** Sprint 1 ve Sprint 2 kapanış durumu işlendi (bkz. Bölüm 9). Milestone 2 başarı kriterleri listesindeki tamamlanan 2 madde işaretlendi.
- **v1.1 (2026-07-22):** Monorepo ve reversed-kart varsayım hataları düzeltildi (bkz. Revizyon Notu).
- **v1.0 (2026-07-22):** İlk gap analizi ve yol haritası.
