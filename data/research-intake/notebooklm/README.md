# NotebookLM Research Intake

This directory is a governed intake buffer for NotebookLM and similar research-assistant outputs.

Nothing stored here is automatically:

- an authoritative project document,
- a KnowledgeBundle source,
- locked knowledge,
- an implemented feature,
- a reviewed human decision.

## Workflow

1. Copy `TEMPLATE.md`.
2. Name the file `YYYY-MM-DD-topic.md`.
3. Preserve the original question and NotebookLM output.
4. Split the response into atomic claims.
5. Verify every path, ADR, test, external fact, and implementation status against the current branch.
6. Classify every claim as one of:
   - `IMPLEMENTED_AND_TESTED`
   - `ACCEPTED_NOT_IMPLEMENTED`
   - `PRODUCT_HYPOTHESIS`
   - `EXTERNAL_RESEARCH`
   - `REJECTED_OR_UNSUPPORTED`
7. Leave human-review fields blank until a named person actually completes review.
8. Move accepted conclusions into the appropriate authoritative document through a separate reviewed change.

## Evidence standard

NotebookLM citation markers are local notebook references and are not valid repository evidence. Use exact repository paths, ADR identifiers, exact test paths, or official external URLs/identifiers.

A claimed implementation is not `IMPLEMENTED_AND_TESTED` unless both code and a relevant test are verified on the current branch.

## Restrictions

This directory may not be used to:

- modify runtime behavior,
- promote the live KnowledgeBundle,
- begin S4,
- resume methodology extraction,
- store copyrighted book text, OCR, images, embeddings, or retrieval chunks.
