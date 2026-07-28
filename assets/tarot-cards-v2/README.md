# Full Tarot Deck V2 — Asset Intake Staging

This directory is the governance landing zone for the 78-card deck plus one card back.

## Current state

- Rights/provenance manifest: prepared
- Source archive SHA-256: locked
- Expected source images: 79 PNG
- Binary files: not yet committed
- Product integration: prohibited before explicit FAZ 9 approval
- Commercial release: blocked by open licensing debt

## Intended binary path

Place the canonical PNG files exactly under:

```text
assets/tarot-cards-v2/images/Major_Arcana/...
assets/tarot-cards-v2/images/Minor_Arcana/...
```

Do not rename files during intake. A later registry/export phase may introduce normalized application IDs, but source archive paths must remain traceable.

## Required intake sequence

1. Verify the supplied archive SHA-256 equals:

   `580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c`

2. Confirm the archive contains:

   - 78 card faces;
   - 1 card back;
   - 79 PNG files total.

3. Generate `assets/tarot-cards-v2/provenance-manifest.json` from the actual binaries using `provenance-manifest.template.json`.
4. Record each target path, SHA-256, byte size, width and height.
5. Record the binary commit SHA in the provenance declaration.
6. Close the binary-ingest items in `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`.
7. Do not connect the images to the UI until explicit FAZ 9 approval.

## Source versus production derivatives

The PNG files are canonical sources. Production WebP/AVIF files must be stored separately and recorded as derivatives with source/output hashes and conversion settings. Never overwrite a canonical source file while retaining its old manifest entry.

## Legal scope

The image assets are not automatically licensed under the repository’s source-code licence. See:

- `docs/ASSET_LICENSE_MANIFEST.md`
- `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`
- `docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md`
