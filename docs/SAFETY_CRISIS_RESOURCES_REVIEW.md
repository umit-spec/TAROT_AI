# Safety Review — Crisis Resources (Türkiye)

**Status:** REVIEWED — APPLIED TO RUNTIME
**Review date:** 2026-07-24
**Reviewed by:** Product Owner (binding safety determination)
**Scope:** The user-facing crisis `resources` list returned by the crisis gate (`src/app/api/readings/route.ts` → `src/server/intake/crisis-resources.ts`). Runtime safety change only. No preview endpoint, no S-UX-2 UI, no reading-pipeline change.
**Authorized official sources (only these):** `https://www.112.gov.tr/`, `https://www.icisleri.gov.tr/`, `https://www.aile.gov.tr/`, and if needed `https://www.saglik.gov.tr/`.

---

## 1. Why this review exists

The crisis resource list shipped with legacy, partly unverified entries (a private `0312` "intihar önleme" line; `155` alongside `112`; ALO 183 presented in the same flat list as emergency lines). The mechanical single-source extraction (Commit A) moved that list into one module **without verifying it**. This review (Commit B) verifies each entry against the authorized official sources and corrects the runtime list.

Single-sourcing fixed consistency; this review fixes correctness.

---

## 2. Resource determinations

| Line | Institution / source | Purpose | Show when | Do NOT show when | Runtime decision (v1) |
|---|---|---|---|---|---|
| **112** | 112 Acil Çağrı Merkezi — İçişleri Bakanlığı (`112.gov.tr`, `icisleri.gov.tr`) | Single unified emergency number for **all** emergencies; coordinates health, police, jandarma, itfaiye and other emergency services. | Every crisis response — immediate danger or self-harm risk. | Never omitted. | **KEPT — primary and only line.** Label: "Acil tehlike veya kendine zarar verme riski — 112". |
| **ALO 183** | Aile ve Sosyal Hizmetler Bakanlığı (`aile.gov.tr`) | Social-support / violence line for aile, kadın, çocuk, engelli, yaşlı, şehit yakını ve gaziler. | Only in an appropriate social-support / violence context, **as a supplement to 112**. | Never as an emergency alternative to 112; never on a generic crisis message where the crisis subtype is not reliably known. | **DEFERRED from runtime v1.** The crisis gate returns one uniform response and does not reliably branch on subtype, so 183 is not shown yet. Recorded as future context-aware routing (§4). |
| **155** | Polis İmdat — İçişleri Bakanlığı | Police emergency. | — | Presenting it as a separate primary emergency line. | **REMOVED.** Police/emergency calls are consolidated under 112. |
| **0312 … "İntihar Önleme Derneği"** | Not verifiable via an official `saglik.gov.tr` source | (claimed) suicide-prevention line | — | Any time — an unverified crisis number must not be shown to a person in danger. | **REMOVED.** Not verified against an official source; no guessed or third-party replacement added. |

---

## 3. Runtime result

The crisis response now returns exactly one resource:

```
resources: [ { label: 'Acil tehlike veya kendine zarar verme riski — 112', contact: '112' } ]
```

The crisis `message` is unchanged (a calm acknowledgment; the resource carries the number). This is the deliberately conservative **first safe version**: for a person in immediate danger, 112 is correct and sufficient (it coordinates police/jandarma/health), and no non-emergency or unverified line is presented as emergency help.

---

## 4. Deferred / future work (not in this change)

- **Context-aware 183 routing.** ALO 183 should be shown **only** when the intake reliably indicates a social-support / violence context (e.g. a dependable `crisis_violence_detected` / `crisis_assault_detected` signal), and only as a supplement to 112 — never as an alternative. Today the crisis gate does not branch on `crisis_*` subtype and the underlying keyword sets (`src/server/intake/keywords.ts`) are too coarse for a safety-critical branch (`'zorla'`, `'istemeden'` are common words). Introducing 183 requires: (a) a reliable subtype signal, (b) a crisis gate that selects resources by subtype, and (c) copy + tests that keep the "183 is not an emergency alternative to 112" distinction explicit. Cross-referenced in `docs/ADR-UX-FRAMING-PREVIEW.md` §1.2.
- **Message-level 112 emphasis** may be revisited when 183 routing lands.

---

## 5. Sign-off

- **Safety determination approved by:** Product Owner — 2026-07-24.
- **Applied to runtime:** `src/server/intake/crisis-resources.ts`; regression tests in `src/__tests__/unit/api-readings.test.ts`.
- **Gate this unblocks:** `docs/ADR-UX-FRAMING-PREVIEW.md` §1.1 — the preview endpoint (S-UX-2) may now expose the crisis-resource response over the new route.
