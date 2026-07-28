# Asset Licensing Debt Log — Full Tarot Deck V2

**Deck:** Insight Engine Tarot — Full Deck V2  
**Governing manifest:** `docs/ASSET_LICENSE_MANIFEST.md`  
**Branch:** `asset/06-full-tarot-deck-v2`  
**Opened:** 2026-07-28  
**Owner:** Product Owner (Ümit Karakeleş)  
**Status:** OPEN — staging documentation prepared; binary ingest and commercial release remain gated

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
| V2-D004 | Official platform-terms evidence | PARTIAL | Commercial release | Current official OpenAI and Canva URLs are recorded; optional immutable PDF/HTML snapshot or legal memo should be archived before launch |
| V2-D005 | Canva Licensed Content audit | OPEN | Product integration | Confirm each final Canva design contains only uploaded User Content and ordinary text/layout, with no Canva library illustration/template/stock dependency |
| V2-D006 | Archive identity verification | PARTIAL | Binary ingest | Supplied ZIP must match SHA-256 `580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c` |
| V2-D007 | Per-file binary verification | OPEN | Binary ingest | Generate and verify the 79-file SHA-256 inventory; attach verifier output and binary commit SHA |
| V2-D008 | Count/path/dimension reconciliation | PARTIAL | Binary ingest | Expected count is 79 PNG; 75 files are 1024×1536 and 4 King cards are 512×768; close after branch tree matches |
| V2-D009 | Jurisdiction-specific copyright/commercial legal review | OPEN | Commercial release | Counsel review or explicit product-owner risk acceptance; AI-output copyright protection is not guaranteed by platform ownership terms |
| V2-D010 | Product/deck title and trademark clearance | OPEN | Commercial release | Search/clear “Insight Engine” and final deck/product branding for intended markets/classes |
| V2-D011 | Public-repository asset reuse notice | OPEN | Binary ingest | Decide whether binaries remain private/LFS/release-only or add a clear `NO THIRD-PARTY LICENCE` notice beside them |
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
- V2-D011

### Before FAZ 9 product integration

Must close:

- all binary-ingest items;
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
