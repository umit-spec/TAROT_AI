# Insight Engine Tarot Deck V1

This branch registers the complete generated tarot visual library and its Canva production authority.

## Inventory

- 22 Major Arcana card faces
- 56 Minor Arcana card faces
- 1 shared card back
- Total image assets: 79

## Repository records

- `source-manifest.json` — canonical paths, original generated filenames, and SHA-256 checksums for all 79 images
- `canva-registry.json` — Canva folder, design IDs, edit URLs, page counts, and rank groups
- `deck-summary.json` — compact deck-level counts

## Canva authority

Canva production folder: `04_PRODUCTION_EXPORTS_REGISTRY`

Folder ID: `FAHQYxCIKSg`

Folder URL: https://www.canva.com/folder/FAHQYxCIKSg

The Canva folder contains:

- 23 single-page Major Arcana/card-back designs
- 14 four-page Minor Arcana rank designs
- 79 card pages in total

## Binary source status

The complete high-resolution PNG bundle exists as `Insight_Engine_Tarot_Deck_V1_FULL.zip` and is downloadable from the project handoff conversation. The GitHub connector used for this commit supports UTF-8 repository files but does not expose a direct binary-file upload parameter. Therefore this branch currently commits the complete cryptographic manifest and Canva design registry, but not the 178 MB PNG archive bytes.

To place the binary files in a local clone, extract the bundle under:

```text
assets/tarot/deck-v1/source/
```

Then validate every file against `source-manifest.json` before committing, preferably through Git LFS or a release asset rather than ordinary Git history.

## Provenance

The illustrations were generated specifically for the Insight Engine project. No API keys, private prompts, or user question text are included.
