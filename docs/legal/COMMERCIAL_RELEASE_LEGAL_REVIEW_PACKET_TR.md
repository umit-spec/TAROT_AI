# Commercial Release Legal Review Packet — Türkiye (V2-D009)

**Phase:** CRG-1C (Commercial Release Gate Review, Gate C)
**Date:** 2026-07-28
**Prepared by:** Claude (CRG-1 execution), for review by external/independent legal counsel
**Status:** READY FOR EXTERNAL LEGAL REVIEW — **not a legal opinion,
not a substitute for counsel, and not closable by this document alone.**

> **A note on who reviews this.** This repository's own session context
> surfaced that the product owner (Ümit Karakeleş) is a licensed
> attorney (İstanbul Barosu, sicil no. 44305). That is recorded here as a
> known fact, not a conclusion about how this gate should close. A
> self-review by the product owner — even a professionally qualified one
> — is not the same as an independent legal opinion free of the
> commercial interest in the product's own success, and CRG-1's own
> mandate is explicit that V2-D009 must not be self-closed. Whether the
> product owner formally opines on this packet himself (as counsel of
> record, with that role and any conflict explicitly stated in writing)
> or engages separate counsel is the product owner's decision to make,
> not this document's to assume.

## A. Product description

Insight Engine ("Tarot AI") is a Turkish-language web application that:

1. Presents a 22-card Major Arcana tarot draw (three-card spread) in
   response to a user's typed question.
2. Uses a deterministic, hand-authored knowledge layer (card meanings,
   position rules, pair relations) plus a narration pass via the
   Anthropic Claude API to render the deterministic reading into natural
   Turkish prose.
3. Is explicitly framed throughout as a **symbolic reflection tool**, not
   fortune-telling, prophecy, or professional advice: the consent modal
   states "Bu uygulama, sembolik düşünme ve iç reflection aracıdır" and
   lists "Kesin kehanet / Tıbbi tavsiye / Hukuki tavsiye / Mali tavsiye"
   under "YAPILMAZ" (not done); the result screen repeats "Bu okuma
   sembolik bir perspektiftir" and "Siz karar verirsiniz. Kartlar sadece
   ayna."
4. Has a governed crisis-detection gate: if the user's input matches
   safety-flag heuristics, the app short-circuits to a fixed message plus
   the single official Turkish emergency number (112), performs no card
   draw and no AI narration for that request, and does not log the
   triggering text.
5. Has no user accounts, no persistence of readings, no payment
   integration, and no client-side analytics/tracking as of this review
   (see `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md`).
6. Is not yet in commercial release; this packet is prepared ahead of
   that decision, not after it.

## B. Content production chain (summary — full chain in `docs/ASSET_INTEGRATION_V2.md`)

- 78 card faces + 1 card back were generated via OpenAI ChatGPT image
  generation, user-directed and iteratively selected by the product
  owner; four King cards were mechanically cropped from a generated
  composite.
- Files were stored/organized in Canva as uploaded User Content; the
  product owner attests no Canva Licensed Content (stock/library/
  template elements) was used in the final designs.
- Only the 22 Major Arcana + card back (23 of the 79 files) are wired
  into the shipped application; the app's reading engine structurally
  supports only these 22 cards.
- Full provenance, hashes, and manifests: `assets/tarot-cards-v2/
  provenance-manifest.json`, `assets/tarot-cards-v2/derivatives/
  derivative-manifest.json`, `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md`.

## C. Existing evidence already on file

| Item | Status | Location |
|---|---|---|
| Provenance/production-chain declaration | Recorded, product-owner-confirmed | `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` |
| Generation-session platform evidence (V2-D002) | ACCEPTED RESIDUAL RISK, not closed | same file, §7 |
| Canva element-level content audit (V2-D005) | CLOSED (product-owner statement) | `docs/evidence/FULL_DECK_V2_CANVA_CONTENT_AUDIT.md` |
| Platform terms review (V2-D004) | PARTIAL | `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md` + `docs/evidence/platform-terms/` |
| Third-party visual similarity review (V2-D003) | PARTIAL, 4 cards flagged HIGH | `docs/evidence/FULL_DECK_V2_SIMILARITY_REVIEW.md` |
| Public-repo reuse notice | CLOSED | `assets/tarot-cards-v2/ASSET_LICENSE.txt` |
| Data-flow/logging inventory | This CRG-1 pass | `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md` |
| Product claims audit | This CRG-1 pass | `docs/legal/PRODUCT_CLAIMS_AUDIT.md` |
| Preliminary trademark clearance | This CRG-1 pass, PARTIAL | `docs/legal/TRADEMARK_CLEARANCE_PRELIMINARY.md` |

## D. Questions for counsel

### D.0 — New finding from this review, flagged first because it is jurisdiction-specific and was not in the product's prior risk register

During this review, Turkish legislation and case-law research (via a
licensed Turkish legal-research tool available in this session,
cross-checked against `mevzuat.gov.tr`/`mevzuat.adalet.gov.tr` source
text) surfaced **Law No. 677 (13 December 1925, "Tekke ve Zaviyelerle
Türbelerin Seddine ve Türbedarlıklar ile Birtakım Unvanların Men ve
İlgasına Dair Kanun")**, Article 1, second paragraph, which explicitly
lists **"falcılık" (fortune-telling)** among a set of prohibited titles
and prohibits "bu unvan ve sıfatlara ait hizmet ifa" (performing services
associated with these titles), on penalty of imprisonment (not less than
3 months) and a fine.

This is not a dormant historical provision: **Yargıtay 7. Ceza Dairesi
decided a case under this exact article as recently as 21 November 2022**
(E.2021/19058, K.2022/16593), and a body of case law through the 2010s
confirms it is actively prosecuted, generally where fortune-telling is
practiced as a habitual, profit-motivated occupation ("mutad meşgale
haline getirip getirmediği," "menfaat temini amacına yönelik" — language
used in e.g. Yargıtay 7. Ceza Dairesi E.2007/7286 K.2010/5847).

**Question:** Does a disclaimer-heavy, AI-mediated, "symbolic reflection
tool"-framed commercial tarot application fall within the scope of
"falcılık" as this 1925 law and its modern judicial interpretation would
apply it? Relevant distinguishing facts this review can offer, without
concluding on them: the app never claims certainty or prophecy, exists as
software rather than an in-person practitioner, is commercially
monetized (a fact the case law treats as relevant to "mutad meşgale"),
and uses the word "tarot" rather than "fal" in its own branding —
though "tarot" is commonly understood in Turkish as a form of "fal."
**This is the single highest-priority Turkey-specific legal question in
this packet and was not part of the product's prior risk register before
this CRG-1 pass.**

### D.1–D.4 — AI-image copyright and ownership risk

1. Does Turkish copyright law (FSEK, Law No. 5846) recognize an
   AI-generated image (produced via user prompts through OpenAI ChatGPT,
   with iterative user selection/curation and limited mechanical
   cropping) as a protectable "eser" (work), and if so, whose?
2. Does the OpenAI Output-ownership assignment (see
   `docs/evidence/platform-terms/openai-terms-of-use.md`) have the
   practical effect intended (transferring exploitable rights to the
   product owner) under Turkish law, or does the "human authorship"
   requirement for FSEK protection create a gap platform terms cannot
   fill?
3. Given V2-D002 is an accepted residual risk rather than closed evidence
   (no redacted generation-session export exists), what evidentiary
   standard would actually be needed to defend provenance if a dispute
   arose?
4. Is there a materially different risk profile between the 22 wired
   Major Arcana images (in commercial use) and the 56 unwired Minor
   Arcana images (dormant in the repository, provenance-only)?

### D.5–D.8 — Third-party infringement / visual similarity

5. Please review `docs/evidence/FULL_DECK_V2_SIMILARITY_REVIEW.md` in
   full, in particular the four cards flagged HIGH (High Priestess,
   Wheel of Fortune, Devil, Moon) for reproducing specific Rider-Waite-
   Smith (1909) compositional details beyond the shared tarot archetype.
6. Does the 1909 publication date and Pamela Colman Smith's death (1951)
   place the original RWS illustrations in the public domain in a way
   that forecloses an infringement claim based on compositional
   similarity to RWS *itself* — as distinct from a similarity claim based
   on a *later*, still-in-copyright derivative/reinterpretation deck?
7. Is a reverse-image search or professional visual-similarity clearance
   service warranted before commercial release, given no such tool was
   available to this review?
8. Does Turkish trade-dress / unfair-competition law (Türk Ticaret
   Kanunu haksız rekabet hükümleri) create exposure independent of
   copyright, e.g. if the deck's overall "look and feel" evokes a
   specific commercially active competitor's published deck?

### D.9–D.12 — KVKK / data protection

9. Please review `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md`.
   Does the current data flow (no accounts, no persistence, redacted
   structured logs, IP address used only transiently and in-memory for
   rate-limiting, question text sent to Anthropic's API but never
   logged/stored server-side) require a KVKK aydınlatma metni
   (disclosure notice) before commercial release, given no personal data
   appears to be stored?
10. Does transient, in-memory-only use of IP address for rate-limiting
    (never persisted, never logged) constitute "işleme" (processing)
    under KVKK triggering notice obligations, or is it de minimis?
11. Does sending user question text (which may include personal or
    sensitive information the user chooses to type, e.g. about health,
    relationships, or emotional state) to a third-party US-based
    processor (Anthropic) require an explicit KVKK-compliant
    international transfer mechanism, given this is not currently
    disclosed to the user anywhere in the product?
12. If persistence/accounts are added in a future release (already noted
    in the codebase as "Sprint 4+"), what KVKK obligations should be
    designed in from that release's start rather than retrofitted?

### D.13–D.16 — Consumer law, crisis framing, age policy

13. Does Law No. 6502 (Tüketicinin Korunması Hakkında Kanun) or the
    Ticari Reklam ve Haksız Ticari Uygulamalar Yönetmeliği (RG
    2015/20435) impose specific disclosure obligations on a paid or
    monetized "fal/tarot"-adjacent digital service, distinct from the
    falcılık question in D.0?
14. Is the crisis-response flow (`src/server/intake/crisis-resources.ts`
    — one fixed message, the 112 emergency number, no diagnosis, no
    treatment promise, request short-circuited entirely) adequate as
    currently implemented, or does Turkish law/regulatory guidance
    (health-adjacent digital services, consumer protection) require
    additional specific language?
15. Does the product need an explicit minimum-age gate/policy? There is
    currently none in the codebase — no age verification, no age-related
    copy anywhere in the UI.
16. Should the product carry a more visible, standing (not just
    onboarding-consent-modal) disclaimer given Turkish consumer-
    protection norms around "fal" or wellness-adjacent commercial
    services, beyond what the current in-app `DisclaimerFooter` already
    shows on every reading?

### D.17–D.20 — Trademark / brand risk for "Insight Engine"

17. Please review `docs/legal/TRADEMARK_CLEARANCE_PRELIMINARY.md`. Is
    "Insight Engine" clearable for the classes discussed there (see that
    document's own class-selection caveats), and is a professional
    search or filing warranted before public launch under that name?
18. Does prior use of "Insight Engine" as a generic descriptor in the
    enterprise search/analytics software category (confirmed via general
    web search, not a database search — see the trademark document)
    create meaningful confusion risk in Nice classes relevant to this
    product, or is that too distant a market/class to matter?
19. Is the Turkish-language product surface's actual visible branding
    (as distinct from the English internal/GitHub project name) already
    settled, and if not, should trademark clearance target the
    Turkish-facing name instead of or in addition to "Insight Engine"?
20. Given the product owner's own bar membership, is there any
    professional-conduct consideration (İstanbul Barosu rules) relevant
    to a licensed avukat commercially operating a tarot/fal-adjacent
    product, distinct from the falcılık question in D.0?

## E. Decision table (for counsel to complete — intentionally empty)

| Konu | Risk | Zorunlu aksiyon | Yayın öncesi mi | Görüş |
|---|---|---|---|---|
| D.0 — Law 677 falcılık riski | | | | |
| D.1–D.4 — Telif/üretim zinciri | | | | |
| D.5–D.8 — Üçüncü taraf görsel benzerlik | | | | |
| D.9–D.12 — KVKK | | | | |
| D.13–D.16 — Tüketici hukuku / kriz / yaş politikası | | | | |
| D.17–D.20 — Marka / "Insight Engine" | | | | |

## Status

**V2-D009: READY FOR EXTERNAL LEGAL REVIEW.** This packet does not close
V2-D009. It is not itself a legal opinion, and the numbered questions
above are this review's attempt to surface genuinely open, specific,
answerable legal questions — not a substitute for an answer. Section E
above must be completed by counsel, dated and signed/attributed, before
V2-D009 can be reclassified as CLOSED in
`docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`.
