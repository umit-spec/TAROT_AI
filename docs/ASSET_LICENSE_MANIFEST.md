# Asset License Manifest — Insight Engine Full Tarot Deck V2

**Status:** FAZ 9A (2026-07-28) — binary ingest complete, production derivatives generated and visually QA'd (V2-D012/D013 CLOSED, see `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`); product integration (FAZ 9B) remains gated on V2-D002 (PARTIAL) and V2-D005 (OPEN)  
**Manifest ID:** `insight-engine-full-tarot-deck-v2-provenance`  
**Internal rights class:** `IE-AI-OUTPUT-PROPRIETARY-1.0`  
**Prepared:** 2026-07-28  
**Target branch:** `asset/06-full-tarot-deck-v2`

> This is an asset-governance record, not a public-domain dedication, Creative Commons licence, copyright registration, or legal opinion.

## 1. Scope

This record covers the source archive currently identified as:

| Field | Value |
|---|---|
| Archive | `insight_engine_tarot_cards_bundle_FULL.zip` |
| Archive SHA-256 | `580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c` |
| Archive size | `186,551,424 bytes` |
| Image assets | `79 PNG` |
| Deck cards | `78` |
| Card back | `1` |
| Major Arcana | `22` |
| Minor Arcana | `56` |
| Non-image archive entries | `README.txt`, `manifest.json` |
| Current integration status | `production_derivatives_generated_ui_integration_pending` |

The canonical per-file path, SHA-256, byte size and dimensions will be locked at binary intake in:

`assets/tarot-cards-v2/provenance-manifest.json`

## 2. Production and provenance record

| Field | Recorded value |
|---|---|
| Commissioning/product owner | Ümit Karakeleş |
| Generation service | OpenAI ChatGPT image generation |
| Production method | User-directed iterative AI image generation, selection and limited mechanical cropping |
| Visual brief | Original dark editorial tarot system: obsidian/deep violet/antique gold, celestial-gothic framing; no named artist style intended |
| Third-party deck source | None knowingly used |
| Named artist imitation | None knowingly requested |
| Franchise/trademark character source | None knowingly requested |
| Real-person likeness | None knowingly requested |
| Canva role | Storage/design organisation of uploaded User Content; no Canva Licensed Content intended |
| Human similarity review | Pending — see debt log |
| Generation evidence archive | Pending attachment/redacted export — see debt log |

The detailed declaration is stored at:

`docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md`

## 3. Rights basis

### 3.1 OpenAI output

The internal rights classification is based on the official OpenAI terms checked on 2026-07-28. As between the user and OpenAI, and to the extent permitted by applicable law, the user owns Output and OpenAI assigns any right, title and interest it may have in Output. The same terms warn that AI output may not be unique and place responsibility for lawful and appropriate use on the user.

Official evidence locations:

- `https://openai.com/policies/terms-of-use/`
- `https://openai.com/policies/eu-terms-of-use/` or the locale-equivalent EU terms page
- `https://openai.com/policies/service-terms/`

This rights basis does **not** mean:

- statutory copyright protection is guaranteed in every jurisdiction;
- the output is unique or exclusive;
- the output cannot resemble third-party material;
- third-party trademark, personality, design or other rights are automatically cleared;
- the images are public domain, CC0 or freely reusable by repository visitors.

### 3.2 Canva storage/design chain

The cards were stored in Canva as uploaded User Content. Canva’s terms state that, as between the user and Canva, the user retains ownership of User Content while granting Canva the service licence required to host, store and display it. Canva Licensed Content is governed separately.

Official evidence locations:

- `https://www.canva.com/policies/terms-of-use/`
- `https://www.canva.com/policies/intellectual-property-policy/`

**Gate:** Before final export or commercial release, confirm that no Canva library element, stock asset, font-as-artwork, template illustration or other Canva Licensed Content was added to the card faces or card back. Ordinary interface use and storage alone do not create a third-party visual asset dependency.

## 4. Internal licence classification

### `IE-AI-OUTPUT-PROPRIETARY-1.0`

This identifier is an internal governance label, not an OSI or Creative Commons licence.

| Field | Rule |
|---|---|
| Rights holder record | Ümit Karakeleş, subject to applicable law and platform terms |
| Commercial product use | Permitted, subject to applicable law, OpenAI terms, Canva terms where relevant, and closure of release blockers |
| Modification | Permitted for project production, provided derivative provenance is recorded |
| Distribution inside the product | Permitted after governance gates close |
| Public repository reuse by third parties | No licence granted unless a separate written asset licence is added |
| Exclusivity | Not guaranteed |
| Copyright registrability | Jurisdiction-dependent; not warranted |
| Third-party similarity clearance | Not yet completed |
| Sublicensing | Not granted by this manifest |

Unless a future file explicitly states otherwise, the source-code licence of the repository does not automatically apply to image assets under `assets/tarot-cards-v2/`.

## 5. Canonical source and derivative policy

1. The 79 PNG files identified by the archive hash are the canonical source assets.
2. The ZIP archive itself should not be treated as the only evidence; its archive hash and all individual hashes must both verify at intake.
3. Production WebP/AVIF derivatives must not overwrite canonical PNG records.
4. Each derivative must record `derived_from_sha256`, output SHA-256, conversion tool/version, command/configuration, dimensions, quality setting and creation commit SHA.
5. A visual edit that changes illustration content is a new asset version and requires a new provenance entry; it is not a silent derivative.
6. Mechanical crop/resize/colour-profile conversion may remain a derivative when fully recorded.

## 6. Binary-ingest gate

Before the 79 images are committed or accepted from another branch, all of the following must pass:

- [ ] Archive SHA-256 equals the value in §1.
- [ ] Exactly 79 PNG assets are present.
- [ ] All 79 per-file SHA-256 values are generated and locked.
- [ ] File paths match the agreed target paths.
- [ ] Image dimensions are recorded.
- [ ] No extra image files are silently introduced.
- [ ] No raw ZIP is committed as a substitute for per-file verification.
- [ ] Git commit SHA containing the binaries is added to the evidence declaration.
- [ ] Debt items required for binary ingest are closed.

## 7. Product-integration gate

FAZ 9 integration is blocked until:

- the user/product owner explicitly approves FAZ 9;
- binary-ingest verification passes;
- final Canva-content audit passes;
- generation evidence/attestation is attached;
- visual similarity and trademark review are completed or formally risk-accepted;
- the asset branch is reviewed independently from the premium UI branch.

## 8. Current known technical notes

- `75` source files are `1024×1536`.
- `4` King cards are `512×768` and preserve the same `2:3` aspect ratio.
- Resolution differences are not a licensing defect, but must be handled deliberately in the production export pipeline.
- The manifest records the source files “as supplied”; QA corrections or regenerated cards require new hashes and a manifest version bump.

## 9. Release statement

Current status:

> The source files have a documented platform-rights basis and archive-level checksum, but the full deck is **not yet cleared for production integration or commercial release** until the open items in `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md` are resolved or formally accepted.
