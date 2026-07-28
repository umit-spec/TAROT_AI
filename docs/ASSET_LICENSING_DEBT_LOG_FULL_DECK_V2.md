# Asset Licensing Debt Log — Full Tarot Deck V2

**Deck:** Insight Engine Tarot — Full Deck V2  
**Governing manifest:** `docs/ASSET_LICENSE_MANIFEST.md`  
**Branch:** `asset/06-full-tarot-deck-v2`  
**Opened:** 2026-07-28  
**Owner:** Product Owner (Ümit Karakeleş)  
**Status:** OPEN — FAZ 9A (2026-07-28): production derivatives generated and reproducibility-verified (V2-D012 CLOSED), full visual QA passed with zero regenerations (V2-D013 CLOSED), FAZ 9 process approval recorded (V2-D014 CLOSED). Generation-session platform evidence (V2-D002) is now ACCEPTED RESIDUAL RISK on explicit product-owner acceptance. The Canva element-level content audit (V2-D005) remains OPEN — a genuine element-level audit has not yet been performed; a short audit checklist has been prepared instead (`docs/evidence/FULL_DECK_V2_CANVA_AUDIT_CHECKLIST.md`). **FAZ 9B (UI integration) is BLOCKED until V2-D005 closes.** Commercial release remains separately gated regardless.

> This file governs the new 78-card + 1-back AI-generated set. It does not replace `docs/ASSET_LICENSING_DEBT_LOG.md`, which remains the historical debt record for the older 22-card / 44-WebP pilot montage set.

## Status vocabulary

- **OPEN:** Evidence or review is missing.
- **PARTIAL:** Core information exists but closure evidence is incomplete.
- **CLOSED:** Closure evidence is committed and referenced.
- **ACCEPTED RESIDUAL RISK:** The risk cannot be eliminated; the product owner has explicitly accepted it.

## Debt register

| ID | Item | Status | Gate | Closure evidence required |
|---|---|---:|---|---|
| V2-D001 | Product-owner provenance attestation | CLOSED | Binary ingest | Product owner (Ümit Karakeleş) confirmed the declaration in `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §5 in chat on 2026-07-28; recorded verbatim with date/name/commit reference in that file. |
| V2-D002 | Generation-session evidence | **ACCEPTED RESIDUAL RISK** — see 2026-07-28 note | Binary ingest / **FAZ 9 integration gate** | Redacted ChatGPT conversation export, screenshots, or platform export proving user-directed generation; private data may be redacted. **Not supplied and not claimed to exist.** Instead, the product owner gave an explicit, verbatim residual-risk acceptance of this specific gap on 2026-07-28, recorded in full in `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §7. This status is intentionally **ACCEPTED RESIDUAL RISK, not CLOSED** — the underlying platform-side evidence gap still exists; only its risk has been explicitly, knowingly accepted by the product owner. The acceptance explicitly does not cover third-party infringement risk, copyright registrability, commercial-release legal clearance, trademark/similarity review, or FAZ 9B approval on its own. |
| V2-D003 | Third-party visual similarity review | OPEN | Commercial release | Human review of all 79 images against known tarot decks, franchises, logos and distinctive third-party works; reviewer/date/result recorded |
| V2-D004 | Official platform-terms evidence | PARTIAL | Commercial release | Current official OpenAI and Canva URLs plus conclusions are recorded in `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md`; optional immutable snapshot/legal memo remains recommended before launch |
| V2-D005 | Canva Licensed Content audit | OPEN — see 2026-07-28 FAZ 9A note | Product integration | Confirm each final Canva design contains only uploaded User Content and ordinary text/layout, with no Canva library illustration/template/stock dependency. `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md` itself states a final Canva element-level audit is required before FAZ 9 integration and does not substitute for one. FAZ 9A had no access to the underlying Canva design files and did not perform an element-level audit; a reliable export-provenance check showing Canva was not used was also not available. **Cannot close without one of:** (A) an element/layer-level audit of the final Canva files, (B) reliable export provenance showing Canva was not used, or (C) an explicit, dated product-owner audit statement covering the exact scope in FAZ 9 master prompt §7 (79 images reviewed; no Canva library illustration, stock photo/video, template artwork, or Pro licensed graphic used; only user-uploaded images and ordinary text/layout; font production-use suitability considered if applicable). |
| V2-D006 | Archive identity verification | ACCEPTED RESIDUAL RISK | Binary ingest | Supplied ZIP must match SHA-256 `580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c`. Delivered as 7 repackaged zip parts, not the single archive — the governed script's whole-archive hash gate could not structurally run (see `assets/tarot-cards-v2/provenance-manifest.json` → `intake_method`). Each part's own SHA-256 matched the sender's `parts_manifest.json`, and every one of the 79 files now has its own locked, committed SHA-256 (V2-D007) — the product owner explicitly accepted, in the 2026-07-28 attestation (`docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §5), that per-file identity is the operative asset identity going forward and that the original single-archive hash cannot be independently reproduced from this delivery form. Re-evaluate before commercial release per the mandatory closure sets below. |
| V2-D007 | Per-file binary verification | CLOSED | Binary ingest | 79-file SHA-256/bytes/dimension inventory generated and committed: `assets/tarot-cards-v2/provenance-manifest.json` → `assets`. Binary commit SHA: `ac34905349b7d4795e0eee0d8a05c23af86e82b3`. |
| V2-D008 | Count/path/dimension reconciliation | CLOSED | Binary ingest | Confirmed: 79 PNG total, 23 Major_Arcana (incl. Card_Back.png), 56 Minor_Arcana, 75 images at 1024×1536, exactly the 4 governed King cards at 512×768. See `provenance-manifest.json` → `intake_summary`. |
| V2-D009 | Jurisdiction-specific copyright/commercial legal review | OPEN | Commercial release | Counsel review or explicit product-owner risk acceptance; AI-output copyright protection is not guaranteed by platform ownership terms |
| V2-D010 | Product/deck title and trademark clearance | OPEN | Commercial release | Search/clear “Insight Engine” and final deck/product branding for intended markets/classes |
| V2-D011 | Public-repository asset reuse notice | CLOSED | Binary ingest | `assets/tarot-cards-v2/ASSET_LICENSE.txt` states that no public asset licence is granted and source-code licensing does not automatically cover the images |
| V2-D012 | Derivative export provenance | CLOSED | Product integration | 79 deterministic 512×768 WebP derivatives generated by `tools/assets/export_full_tarot_deck_v2.py` from the canonical PNGs (canonical files unmodified). Every entry in `assets/tarot-cards-v2/derivatives/derivative-manifest.json` records canonical source path/SHA-256, output path/SHA-256, dimensions, byte sizes, WebP quality (88)/method (6), resampling (LANCZOS, or none for the four already-512×768 King sources), colorspace (RGB), metadata policy (stripped), and converter (Pillow 12.3.0). Reproducibility verified: a second independent export run produced byte-identical output for all 79 files (`diff -rq` on both output directories reported no differences). |
| V2-D013 | Final visual QA and regeneration reconciliation | CLOSED | Product integration | Full human visual review of all 79 production derivatives via contact sheets, plus a dedicated full-resolution close-up of the four lower-source-resolution King cards. Zero REGENERATE/BLOCKED findings. Full report: `docs/evidence/FULL_DECK_V2_VISUAL_QA.md`. No regeneration was required, so no manifest version bump was needed. |
| V2-D014 | FAZ 9 product-owner approval | CLOSED | Product integration | Product owner (Ümit Karakeleş) explicitly sent the FAZ 9 master prompt for execution ("FAZ 9 başlangıç kararı: GO — koşullu yönetişim kapısıyla") on 2026-07-28, in this repository's Claude Code session. Scope of this approval, per the master prompt's own §2: authorization to begin the FAZ 9 process (asset-preparation work and, conditionally, selective UI integration); explicitly **not** a commercial-release approval; explicitly **not** authorization to bypass V2-D002/V2-D005 evidence requirements or any other FAZ 9A gate. FAZ 9A honored that boundary: V2-D002 and V2-D005 were not closed by assumption, and FAZ 9B (UI wiring) was not started because those two gates remain open. |

## Mandatory closure sets

### Before binary commit/acceptance

Must close:

- V2-D001
- V2-D002
- V2-D006
- V2-D007
- V2-D008

V2-D011 is already closed through the committed no-public-licence notice.

**2026-07-28 note:** binaries were committed (`ac34905`) before this full set closed, driven by the practical constraint of split-part delivery. As of the same day: V2-D001 CLOSED, V2-D006 ACCEPTED RESIDUAL RISK (a valid closure state per this log's status vocabulary), V2-D007/V2-D008 CLOSED. V2-D002 remains genuinely PARTIAL - it is the one item in this set still open after the fact, not merely deferred.

### Before FAZ 9 product integration

Must close:

- all remaining binary-ingest items;
- V2-D005;
- V2-D012;
- V2-D013;
- V2-D014.

**FAZ 9A status (2026-07-28):** V2-D012, V2-D013, V2-D014 CLOSED.
V2-D002 is now ACCEPTED RESIDUAL RISK on explicit product-owner
acceptance (`docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §7).
**V2-D005 remains OPEN** — a real element-level Canva audit has not been
performed; a short (10-15 minute) audit checklist has been prepared for
the product owner (`docs/evidence/FULL_DECK_V2_CANVA_AUDIT_CHECKLIST.md`).
**FAZ 9B (UI wiring / registry / CardArtworkPlaceholder integration) does
not start until V2-D005 closes.**

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
- **2026-07-28:** Binary intake performed. Source archive was delivered as 7 independently repackaged zip parts (not the single original file), so the governed script (`tools/assets/intake_full_tarot_deck_v2.py`) could not run its whole-archive SHA-256 gate as designed against this delivery form — it was not modified to bypass that check. Manual equivalent verification was performed instead: each part's SHA-256 matched the sender's `parts_manifest.json`, all 79 filenames reconciled 1:1 against the extracted files, and per-image structure/dimension checks (79 PNG, 23 Major_Arcana + Card_Back, 56 Minor_Arcana, 75×1024×1536 + 4×512×768 Kings) all passed. 79 files staged to `assets/tarot-cards-v2/images/` with a full per-file SHA-256/dimension inventory in `assets/tarot-cards-v2/provenance-manifest.json`. V2-D007 and V2-D008 closed on this basis. No UI integration was performed. FAZ 9 approval remains required and was not sought or granted by this action.
- **2026-07-28:** Product owner (Ümit Karakeleş) confirmed the provenance attestation in chat, recorded verbatim with date/name/commit reference in `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §5. V2-D001 closed on this basis. V2-D006 (archive identity) reclassified from PARTIAL to ACCEPTED RESIDUAL RISK — the product owner explicitly accepted that per-file SHA-256 identity (V2-D007) is the operative asset-identity evidence going forward, since the original single-archive hash cannot be reproduced from the split-part delivery form. V2-D002 (generation-session evidence) updated to reference this attestation and the asset-intake conversation as supporting context, but remains genuinely PARTIAL: an actual redacted ChatGPT session export/screenshot has not been supplied. No UI integration was performed and FAZ 9 was not approved by this action - the product owner explicitly stated this acceptance is not FAZ 9 integration approval.
- **2026-07-28 (FAZ 9A):** Product owner sent the FAZ 9 master prompt for execution, giving explicit process approval — V2-D014 CLOSED (scope: begin FAZ 9 process only, not commercial release, not a gate-bypass authorization). Deterministic production-derivative pipeline built (`tools/assets/export_full_tarot_deck_v2.py`) on `asset/09-production-derivatives`, generating 79 WebP files at 512×768 from the unmodified canonical PNGs; reproducibility verified byte-for-byte across two independent runs — V2-D012 CLOSED (`assets/tarot-cards-v2/derivatives/derivative-manifest.json`). Full visual QA performed on all 79 derivatives via contact sheets plus a dedicated full-resolution King-card close-up; zero regenerations required — V2-D013 CLOSED (`docs/evidence/FULL_DECK_V2_VISUAL_QA.md`). V2-D002 and V2-D005 were evaluated honestly against the FAZ 9 master prompt's evidentiary bar and **could not be closed**: no redacted ChatGPT generation-session export was available for V2-D002, and no Canva design-file access or reliable non-Canva export provenance was available for V2-D005; both require a specific product-owner statement (recorded verbatim in their register rows above) that was not supplied by this action. **FAZ 9A result: PARTIAL. FAZ 9B (UI integration) was not started** — no registry was generated, `CardArtworkPlaceholder` was not touched, and the frozen UI branch (`claude/premium-ui-foundation-phase1-4d2940`) was not modified.
- **2026-07-28 (FAZ 9A follow-up):** Product owner reviewed the FAZ 9A PARTIAL result and gave an explicit, verbatim residual-risk acceptance for V2-D002 (recorded in full in `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §7). V2-D002 reclassified from PARTIAL to **ACCEPTED RESIDUAL RISK** — intentionally not CLOSED, since the underlying platform-side generation-session evidence gap is not eliminated, only explicitly accepted. The product owner explicitly declined to give the V2-D005 closure statement at this time, stating the underlying element-level Canva audit has not actually been performed yet, and instead requested a short (10-15 minute) actionable audit checklist. V2-D005 **remains OPEN**; `docs/evidence/FULL_DECK_V2_CANVA_AUDIT_CHECKLIST.md` was added for the product owner to complete. **FAZ 9A remains PARTIAL. FAZ 9B is still blocked, now on V2-D005 alone.** No UI branch or CardArtworkPlaceholder change was made by this action.
