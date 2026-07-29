# 01-magician Source & Artwork Provenance Notes

## Scope

This file records the normalization and governed-artwork review for the experimental
Interpretation Graph node `01-magician`. The node is offline-only and is not imported by
the production runtime.

## Canonical identity

- Catalog source: `data/cards/01-magician.json`
- Canonical CardId: `01-magician`
- Display name: `Büyücü`
- English name: `The Magician`
- Arcana number: `1`

The NotebookLM-suggested variant `01-the-magician` was rejected because it does not match
the repository catalog.

## Governed artwork audit

- Production derivative path: `public/assets/tarot-cards/v2/01_Buyucu.webp`
- Git blob SHA: `2b0d953b01478f1ad6d136453bc18f24220fbcbd`
- Reviewed source export: `01-buyucu.webp`, 1024×1536
- Reviewed source export SHA-256:
  `3aa1b4c1bfb12fc220599fca88601279bf9ede31a5d15c9e2d4ac602e4f47a05`

The source export and production derivative belong to the governed card artwork set.
Only symbols clearly visible in the reviewed artwork are included in the operative
card node.

### Included symbols

1. **Raised wand and lowered open hand**
   - Visible evidence: the left hand raises a wand; the right hand extends toward the
     table area.
   - Safe product use: evaluate the relationship between intention and applicable
     conditions.
   - Excluded claim: magical causality, divine intervention, guaranteed manifestation.

2. **Tools on the table**
   - Visible evidence: a cup, sword, disk and circular instrument are placed across the
     foreground table.
   - Safe product use: distinguish which information, skill or tool is relevant to the
     present question.
   - Excluded claim: the user already possesses every required resource.

### Excluded or unverified candidates

The following classic-deck candidates are not used in the operative node because they
were not clearly verified in the governed artwork:

- lemniscate / infinity symbol
- ouroboros belt
- red roses and white lilies
- a literal four-suit set matching a named historic deck
- Rider-Waite-Smith brand or deck-specific wording

Purple flowers and celestial ornamentation are visible, but no card-specific runtime
meaning was added because the NotebookLM material did not provide a sufficiently
bounded, repository-verified source interpretation for them.

## Source and product layer separation

### Source-backed raw material

NotebookLM summarized card meanings from uploaded tarot references, including themes
around skill, available means, attention, intention and implementation. NotebookLM
passage labels are not treated as repository-verified provenance or scientific
validation.

### Product-designed reflection layer

The following elements are product design, not historical or universal tarot facts:

- `past`, `present`, `direction` lenses
- eight topic contexts
- ten explicit/user-confirmed signal lenses
- adaptive reflection questions
- relationship type references
- global guardrail references

## Safety normalization

The following changes were applied before repository inclusion:

- `manifestation / tezahür` was replaced with bounded language about relating intention
  to applicable information, skills and practical conditions.
- `As Above, So Below` and Mercury/Civa associations were kept out of operative content.
- claims that all required resources are already available were removed.
- action pressure such as “take the first step” or “the time has come” was removed.
- questions presupposing fear, delay, hidden talent, resistance or loss were rewritten
  as neutral evaluation questions.
- `direction` was kept as a consideration lens, never a future trajectory.
- old camelCase signal IDs and NotebookLM-invented guardrail IDs were rejected.

## Copyright and lineage note

Commercial tarot books mentioned in the NotebookLM session are lineage-only references.
Their full text, images and OCR output are not stored in this node or runtime data.

## Runtime status

- `provenance.runtimeEnabled`: `false`
- `provenance.reviewRequiredBeforeRuntime`: `true`
- This node remains experimental until multi-card offline evaluation and later live-model
  shadow evaluation are completed.
