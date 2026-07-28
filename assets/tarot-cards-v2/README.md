# Full Tarot Deck V2 — Asset Intake Staging

This directory is the governance landing zone for the 78-card deck plus one card back.

## Current state (updated FAZ 9A, RC-1 asset audit)

- Rights/provenance manifest: committed (`assets/tarot-cards-v2/provenance-manifest.json`)
- Source archive SHA-256: locked; archive-level identity ACCEPTED RESIDUAL RISK (V2-D006) - per-file SHA-256 is the operative identity evidence
- Source images: 79 PNG committed, binary commit `ac34905349b7d4795e0eee0d8a05c23af86e82b3`
- Product-owner provenance attestation: confirmed (`docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md` §5)
- Production derivatives: 79 deterministic 512×768 WebP files generated and reproducibility-verified on `asset/09-production-derivatives` (`assets/tarot-cards-v2/derivatives/`); **canonical PNGs above are not modified by this step**
- Visual QA: complete for all 79 derivatives, no REGENERATE/BLOCKED findings (`docs/evidence/FULL_DECK_V2_VISUAL_QA.md`)
- Product integration (FAZ 9B): all integration-gate items resolved - V2-D002 (generation-session evidence) is an explicit product-owner ACCEPTED RESIDUAL RISK, V2-D005 (Canva content audit) is CLOSED on a genuine product-owner element-level audit; see `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`
- Commercial release: separately gated (V2-D003, V2-D004, V2-D009, V2-D010 remain open) - FAZ 9 integration, if it proceeds, does **not** clear commercial release

## Intended binary path

The governed intake tool writes the canonical PNG files under:

```text
assets/tarot-cards-v2/images/Major_Arcana/...
assets/tarot-cards-v2/images/Minor_Arcana/...
```

Do not rename files during intake. A later registry/export phase may introduce normalized application IDs, but source archive paths must remain traceable.

## Required intake sequence

First validate without writing:

```bash
python tools/assets/intake_full_tarot_deck_v2.py /path/to/insight_engine_tarot_cards_bundle_FULL.zip
```

The supplied archive must match:

`580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c`

Then stage the verified files and generate the per-file provenance manifest:

```bash
python tools/assets/intake_full_tarot_deck_v2.py \
  /path/to/insight_engine_tarot_cards_bundle_FULL.zip \
  --extract
```

The tool verifies:

- archive SHA-256;
- safe ZIP paths/no path traversal;
- 78 card faces + 1 card back;
- exactly 79 PNG files;
- 23 Major/Card-Back files and 56 Minor Arcana files;
- expected source dimensions;
- the four recorded 512×768 King files;
- per-file SHA-256, byte size and dimensions.

It writes:

`assets/tarot-cards-v2/provenance-manifest.json`

After intake:

1. Review the generated per-file manifest.
2. Record the binary commit SHA in the provenance declaration.
3. Close the remaining binary-ingest items in `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`.
4. Do not connect the images to the UI until explicit FAZ 9 approval.

## Source versus production derivatives

The PNG files are canonical sources. Production WebP/AVIF files must be stored separately and recorded as derivatives with source/output hashes and conversion settings. Never overwrite a canonical source file while retaining its old manifest entry.

## Legal scope

The image assets are not automatically licensed under the repository’s source-code licence. See:

- `assets/tarot-cards-v2/ASSET_LICENSE.txt`
- `docs/ASSET_LICENSE_MANIFEST.md`
- `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`
- `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md`
- `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md`
