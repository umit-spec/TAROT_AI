# Insight Engine — Major Arcana V1

This asset release contains **22 upright-only Major Arcana card faces and one shared card back**.

## Visual system

- Source dimensions: 1024 × 1536 px
- Aspect ratio: 2:3
- Palette: obsidian black, deep violet, antique gold
- Provenance: project-generated with OpenAI image generation
- Canva design IDs and SHA-256 checksums: `asset-manifest.json`

## Storage model

- **Canva is the full-resolution source of truth.** Every card and the card back are saved as individual Canva designs in the production asset folder.
- `embedded/bundle-*.html` provides a self-contained, browser-readable repository archive of all 23 visuals. The embedded images are deliberately lightweight audit/previews so the repository remains portable through the connector.
- `embedded/00-deli.svg` is the first individually embedded preview and validates the browser-renderable asset format.
- The full-resolution local export package is retained separately for application integration and binary optimization.

## Release gates

Visual production and provenance registration are complete. Application integration, automated visual QA, accessibility review, performance optimization and external-commercialization legal review remain separate release gates.
