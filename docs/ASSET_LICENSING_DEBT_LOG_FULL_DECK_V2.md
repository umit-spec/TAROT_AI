# Asset Licensing Debt Log — Full Tarot Deck V2

**Deck:** Insight Engine Tarot — Full Deck V2  
**Governing manifest:** `docs/ASSET_LICENSE_MANIFEST.md`  
**Branch:** `asset/06-full-tarot-deck-v2`  
**Opened:** 2026-07-28  
**Owner:** Product Owner (Ümit Karakeleş)  
**Status:** OPEN — binary staging complete (2026-07-28, manual per-part verification); product-owner attestation, generation-session evidence, and full-archive hash proof remain outstanding; commercial release and FAZ 9 integration remain gated

> This file governs the new 78-card + 1-back AI-generated set. It does not replace `docs/ASSET_LICENSING_DEBT_LOG.md`, which remains the historical debt record for the older 22-card / 44-WebP pilot montage set.

## Status vocabulary

- **OPEN:** Evidence or review is missing.
- **PARTIAL:** Core information exists but closure evidence is incomplete.
- **CLOSED:** Closure evidence is committed and referenced.
- **ACCEPTED RESIDUAL RISK:** The risk cannot be eliminated; the product owner has explicitly accepted it.

## Debt register

| ID | Item | Status | Gate | Closure evidence required |
|---|---|---:|---|---|
| V2-D001 | Product-owner provenance attestation | OPEN | Binary ingest | Confirm the declaration in `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md`, with commit/PR reference |
| V2-D002 | Generation-session evidence | OPEN | Binary ingest | Redacted ChatGPT conversation export, screenshots, or platform export proving user-directed generation; private data may be redacted |
| V2-D003 | Third-party visual similarity review | OPEN | Commercial release | Human review of all 79 images against known tarot decks, franchises, logos and distinctive third-party works; reviewer/date/result recorded |
| V2-D004 | Official platform-terms evidence | PARTIAL | Commercial release | Current official OpenAI and Canva URLs plus conclusions are recorded in `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md`; optional immutable snapshot/legal memo remains recommended before launch |
| V2-D005 | Canva Licensed Content audit | OPEN | Product integration | Confirm each final Canva design contains only uploaded User Content and ordinary text/layout, with no Canva library illustration/template/stock dependency |
| V2-D006 | Archive identity verification | PARTIAL — see 2026-07-28 note | Binary ingest | Supplied ZIP must match SHA-256 `580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c`. Delivered as 7 repackaged zip parts, not the single archive — the governed script's whole-archive hash gate could not structurally run (see `assets/tarot-cards-v2/provenance-manifest.json` → `intake_method`). Each part's own SHA-256 matched the sender's `parts_manifest.json`; the original single-file archive hash remains unverified by this repository. **Still open**: independent proof of the single-archive hash. |
| V2-D007 | Per-file binary verification | CLOSED | Binary ingest | 79-file SHA-256/bytes/dimension inventory generated and committed: `assets/tarot-cards-v2/provenance-manifest.json` → `assets`. Binary commit SHA: `ac34905349b7d4795e0eee0d8a05c23af86e82b3`. |
| V2-D008 | Count/path/dimension reconciliation | CLOSED | Binary ingest | Confirmed: 79 PNG total, 23 Major_Arcana (incl. Card_Back.png), 56 Minor_Arcana, 75 images at 1024×1536, exactly the 4 governed King cards at 512×768. See `provenance-manifest.json` → `intake_summary`. |
| V2-D009 | Jurisdiction-specific copyright/commercial legal review | OPEN | Commercial release | Counsel review or explicit product-owner risk acceptance; AI-output copyright protection is not guaranteed by platform ownership terms |
| V2-D010 | Product/deck title and trademark clearance | OPEN | Commercial release | Search/clear “Insight Engine” and final deck/product branding for intended markets/classes |
| V2-D011 | Public-repository asset reuse notice | CLOSED | Binary ingest | `assets/tarot-cards-v2/ASSET_LICENSE.txt` states that no public asset licence is granted and source-code licensing does not automatically cover the images |
| V2-D012 | Derivative export provenance | OPEN | Product integration | For WebP/AVIF/optimized files, record source SHA, output SHA, converter/version/settings and commit SHA |
| V2-D013 | Final visual QA and regeneration reconciliation | OPEN | Product integration | Confirm corrected/regenerated cards replace old hashes through a manifest version bump rather than silent overwrite |
| V2-D014 | FAZ 9 product-owner approval | OPEN | Product integration | Explicit written approval to replace CSS placeholders with real card assets |

## Mandatory closure sets

### Before binary commit/acceptance

Must close:

- V2-D001
- V2-D002
- V2-D006
- V2-D007
- V2-D008

V2-D011 is already closed through the committed no-public-licence notice.

### Before FAZ 9 product integration

Must close:

- all remaining binary-ingest items;
- V2-D005;
- V2-D012;
- V2-D013;
- V2-D014.

### Before commercial release

Must close or explicitly accept:

- V2-D003
- V2-D004
- V2-D009
- V2-D010

## Residual risks that cannot be represented as “solved”

The following must remain visible even after release:

1. **Non-uniqueness:** AI outputs may be similar to outputs received by other users.
2. **Copyright uncertainty:** Platform ownership allocation does not guarantee copyright eligibility or registration in every jurisdiction.
3. **Similarity risk:** A provenance record reduces uncertainty but cannot prove that an output resembles no third-party work.
4. **Trademark risk:** Controlling an image output does not by itself clear a product name, logo or use in commerce.
5. **Terms drift:** Platform terms can change and must be rechecked at major release milestones.

## Review cadence

Recheck this log at:

- binary intake;
- first optimized export;
- FAZ 9 integration PR;
- pre-launch legal review;
- each material card regeneration;
- each change of generation or design platform.

## Changelog

- **2026-07-28:** Full-deck V2 log opened separately from the historical 22-card pilot debt. Archive identity, 79-image count and current platform-rights basis recorded; no production clearance claimed.
- **2026-07-28:** Platform-terms evidence note added. Public-repository reuse notice closed through `assets/tarot-cards-v2/ASSET_LICENSE.txt`.
- **2026-07-28:** Binary intake performed. Source archive was delivered as 7 independently repackaged zip parts (not the single original file), so the governed script (`tools/assets/intake_full_tarot_deck_v2.py`) could not run its whole-archive SHA-256 gate as designed against this delivery form — it was not modified to bypass that check. Manual equivalent verification was performed instead: each part's SHA-256 matched the sender's `parts_manifest.json`, all 79 filenames reconciled 1:1 against the extracted files, and per-image structure/dimension checks (79 PNG, 23 Major_Arcana + Card_Back, 56 Minor_Arcana, 75×1024×1536 + 4×512×768 Kings) all passed. 79 files staged to `assets/tarot-cards-v2/images/` with a full per-file SHA-256/dimension inventory in `assets/tarot-cards-v2/provenance-manifest.json`. V2-D007 and V2-D008 closed on this basis; V2-D006 stays PARTIAL because the single-archive hash itself was not independently reproduced. No UI integration was performed. FAZ 9 approval remains required and was not sought or granted by this action.
