# Data Flow and User Rights Inventory

**Phase:** CRG-1 (Commercial Release Gate Review)
**Date:** 2026-07-28
**Prepared by:** Claude (CRG-1 execution)

## What this document is, and is not

A **technical inventory** of what data the application actually sends,
logs, stores, or shares, compiled by reading the current source code
(not by inference or assumption). It is **not** a KVKK aydınlatma metni
(disclosure notice), not a privacy policy, and not a legal compliance
determination — those require counsel review of the facts recorded here
(see `docs/legal/COMMERCIAL_RELEASE_LEGAL_REVIEW_PACKET_TR.md` §D.9–D.12).
Every row below is traceable to a specific file; no field was guessed.

## Method

Read: `src/app/api/readings/route.ts`, `src/server/observability/log.ts`,
`src/server/observability/rate-limit.ts`,
`src/server/reading-engine/providers/claude/http.ts`,
`src/server/reading-engine/providers/claude/prompt.ts`, `package.json`
(dependency list), `next.config.mjs`. Grepped the codebase for
`fetch(`, `localStorage`, `cookie`, `analytics`, `tracking`, third-party
API base URLs.

## Data flow table

| Veri | Kaynak | Amaç | İşleyen taraf | Saklama | Paylaşım | Risk |
|---|---|---|---|---|---|---|
| Kullanıcının yazdığı soru metni (questionText) | `ReadingRequestSchema` (client POST body) | Kart okumasını kişiselleştirmek; kriz tespiti (`classifyIntake`) | Sunucu (bu uygulama) + Anthropic Claude API (üçüncü taraf, ABD merkezli) | Sunucuda **saklanmaz** — `readingId: null`, kalıcılık "Sprint 4+" olarak kodda not düşülmüş, henüz yok. Anthropic tarafında saklama/işleme süresi bu incelemenin kapsamı dışında (Anthropic'in kendi veri işleme koşulları geçerli, ayrıca doğrulanmadı). | Anthropic'e API çağrısıyla gönderilir (`src/server/reading-engine/providers/claude/http.ts` → `api.anthropic.com/v1/messages`). Kullanıcıya bu paylaşım şu an arayüzde **açıklanmıyor**. | Kriz/duygusal/kişisel içerik içerebilecek serbest metin bir ABD şirketine gönderiliyor, açık bildirim yok — bkz. paket §D.11 |
| Kriz tetikleyici metin | Aynı soru metni, `isCrisisFlag` eşleşirse | Güvenlik kısa devresi | Sunucu | **Loglanmaz** — kod içi yorum: "Crisis text is NOT logged (D4)" | Anthropic'e gönderilmez — kriz yolunda hiçbir sağlayıcı çağrısı yapılmaz (`route.ts`: kriz durumunda draw/provider call yok) | Bu akış özellikle temiz — en hassas veri en az işleniyor |
| IP adresi (x-forwarded-for / x-real-ip) | HTTP header (`clientKey()`, `rate-limit.ts`) | Sadece rate-limit anahtarı (dakikalık istek sınırı) | Sunucu, bellek-içi (`Map`) | **Kalıcı değil** — process-scoped in-memory `Map`, disk/DB yok, restart'ta sıfırlanır | Paylaşılmaz | Düşük — ama "işleme" sayılıp sayılmadığı KVKK açısından netleştirilmeli, bkz. paket §D.10 |
| Yapılandırılmış log kaydı (persona, questionDomain, crisis:boolean, safetyFlagCount, provider, latency, token sayıları) | `buildReadingLogRecord()` (`log.ts`) | Operasyonel gözlemlenebilirlik | Sunucu → stdout (JSON tek satır) | Konteyner/log altyapısına bağlı; bu depo düzeyinde bir log saklama/rotasyon politikası **tanımlanmamış** | Log toplama altyapısı varsa oraya gider (bu incelemede tespit edilmedi — muhtemelen henüz yok) | Düşük — alan seti açıkça serbest metin İÇERMEYECEK şekilde tasarlanmış (`log.ts` yorumu: "NEVER carries the user's question text... structurally absent from the builder's input type") |
| Kart çekilişi (seed, cards, positions) | Sunucu tarafında deterministik üretilir | Okumanın kendisi | Sunucu → istemciye JSON yanıt | Saklanmaz | Yalnız istemciye döner | Kişisel veri değil |
| Çerezler (cookies) | — | — | — | — | — | **Yok** — kod tabanında çerez kullanımı bulunmadı |
| İstemci tarafı analytics/tracking | — | — | — | — | — | **Yok** — `package.json` bağımlılıkları yalnız `next`, `react`, `react-dom`, `zod`; hiçbir analytics/tracking kütüphanesi yok |
| Kullanıcı hesapları | — | — | — | — | — | **Yok** — kimlik doğrulama, oturum, hesap sistemi bulunmuyor |
| Ödeme bilgisi | — | — | — | — | — | **Yok** — ödeme entegrasyonu bulunmuyor |
| Yaş/doğrulama verisi | — | — | — | — | — | **Yok** — yaş sorgusu/doğrulaması bulunmuyor, bkz. paket §D.15 |

## Third-party processors identified

1. **Anthropic (Claude API)** — receives: structured card/position data
   (not personal), intake-classification metadata (persona,
   questionDomain, emotionalIntensity, decisionUrgency,
   spiritualPreference, responseDepth, safetyFlags — all derived
   categorical labels, not raw text) plus the raw user question text
   itself (`userData.userQuestion` in `prompt.ts`'s `buildUserMessage`).
   **This is the one place raw user-typed free text leaves the server.**
2. No other third-party API, CDN-with-tracking, font service, or
   analytics vendor was found in the current codebase.

## Open items for counsel / product owner (not resolved here)

- No user-facing privacy notice currently exists describing the
  Anthropic data flow above — this is a **gap**, not evaluated for
  legal sufficiency by this document.
- Whether transient in-memory IP use for rate-limiting requires KVKK
  notice (see legal packet §D.10).
- Whether/how to disclose the Anthropic international transfer (see
  legal packet §D.11).
- No retention policy is defined for server logs at the infrastructure
  level (this depends on deployment target, not yet chosen/deployed).

## Scope limitation

This document reflects the **current codebase only**
(`governance/crg1-commercial-release-review` branch, based on RC-2 HEAD
`80ec612`). It does not cover any future feature (accounts, persistence,
payments) not yet implemented, and must be re-run when any of those
land.
