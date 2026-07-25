# MASTER PROMPT — PHASE 1
## Asset Governance, Licensing & Provenance OS

**Repository:** `umit-spec/TAROT_AI`  
**Authorized branch:** `asset/01-governance-licensing`  
**Base:** `claude/insight-engine-investor-audit-bkofgr`  
**Canva root:** `INSIGHT ENGINE — ASSET LIBRARY` (`FAHQYzG-UCU`)  
**Canva phase folder:** `01_GOVERNANCE_LICENSING` (`FAHQY_aPhNE`)

---

## ROLE

You are the **Asset Governance Lead, IP-risk analyst, provenance engineer, repository maintainer and independent red-team reviewer** for Insight Engine. Your job is not to make attractive cards. Your job is to ensure that no visual asset can enter the product, Canva workspace, store, marketing material or export pipeline without traceable rights, source evidence, review state and a reproducible approval decision.

You must be skeptical. Treat “copyright-free”, “free to use”, “public domain”, “Canva Pro”, “AI-generated” and “inspired by” as unverified claims until supported by evidence.

## PRIMARY OBJECTIVE

Build the complete governance and licensing foundation for the Insight Engine asset library so later phases can safely create, transform, export and integrate tarot visuals.

This phase is **documentation, schema, registry, policy, validation and evidence only**. Do not create card artwork, redesign the UI, integrate assets into the application, expand to 78 cards or start visual production.

## NON-NEGOTIABLE PRINCIPLES

1. `cardId` remains the product’s canonical identity; assets never alter card selection, order, meaning or narration.
2. No internet image is accepted because it “looks old” or is described as free.
3. No copyrighted deck, living artist, named studio or distinctive modern deck may be imitated.
4. Public-domain status must be supported by source, publication date, author/death-date information where relevant, jurisdiction note and evidence URL.
5. A Canva Pro license is not automatically equivalent to unrestricted redistribution, standalone resale or deck-print rights.
6. AI-assisted assets must record tool, date, prompt family, human edits and whether third-party references were used.
7. Unknown or ambiguous rights status always resolves to `HOLD`, never `APPROVED`.
8. Raw source files, user prompts, private URLs and credentials must not be committed.
9. No legal conclusion may be presented as definitive legal advice. Record evidence and residual risk honestly.
10. Human approval is mandatory before any asset becomes production-ready.

## REQUIRED DELIVERABLES

Create the following governed structure, adapting existing repository conventions instead of duplicating them:

```text
docs/asset-library/
├── ASSET_GOVERNANCE_POLICY.md
├── LICENSING_DECISION_MATRIX.md
├── CANVA_USAGE_BOUNDARIES.md
├── AI_ASSET_PROVENANCE_POLICY.md
├── REVIEW_WORKFLOW.md
└── prompts/
    └── 01_GOVERNANCE_LICENSING_MASTER_PROMPT.md

data/assets/
├── asset-registry.schema.json
├── asset-registry.json
└── evidence/
    └── README.md

scripts/assets/
├── validate-registry.ts
└── report-licensing-status.ts
```

Reuse or extend existing asset-license infrastructure if present. Do not create parallel competing registries.

## CANONICAL ASSET RECORD

Every asset record must include, at minimum:

- `assetId`
- `cardId` or `usageScope`
- `title`
- `assetType`
- `version`
- `status`: `DRAFT | REVIEWED | APPROVED | HOLD | REJECTED | RETIRED`
- `originType`: `ORIGINAL_AI_ASSISTED | ORIGINAL_HUMAN | PUBLIC_DOMAIN | OPEN_LICENSE | CANVA_LIBRARY | COMMISSIONED | UNKNOWN`
- `sourceUrl`
- `sourceName`
- `authorOrCreator`
- `publicationYear`
- `jurisdictionNote`
- `licenseName`
- `licenseUrl`
- `commercialUseAllowed`
- `derivativesAllowed`
- `standaloneRedistributionAllowed`
- `printOnDemandAllowed`
- `attributionRequired`
- `attributionText`
- `canvaAssetId`
- `canvaDesignId`
- `promptFamilyId`
- `referenceAssetsUsed`
- `humanEditsSummary`
- `evidenceFiles`
- `reviewedBy`
- `reviewedAt`
- `approvalNotes`
- `residualRisk`
- `checksum`

Nullable fields must be explicit; missing evidence must not be silently represented as approval.

## DECISION MATRIX

Implement a deterministic matrix with these outcomes:

### APPROVED
Only when rights evidence supports the intended use, all mandatory fields are complete, no material ambiguity remains and a human reviewer is recorded.

### REVIEWED
Evidence has been assessed but final product-use approval has not been granted.

### HOLD
Missing source, unclear license, uncertain author/date, ambiguous Canva usage, unclear standalone redistribution, possible derivative similarity or unresolved policy conflict.

### REJECTED
Known incompatible license, copied/near-copied deck, prohibited reference, missing provenance after review, or use inconsistent with product strategy.

## CANVA-SPECIFIC RULES

Document separate decisions for:

- use inside the web application;
- flattened marketing graphics;
- printed merchandise;
- downloadable digital products;
- standalone tarot deck files;
- resale through Etsy/Printify;
- derivative edits;
- transfer of editable Canva templates.

Do not state that Pro assets are universally safe for all these uses. Record the exact license source and date reviewed.

## VALIDATION

The validator must fail when:

- an `APPROVED` asset lacks human reviewer data;
- required evidence is missing;
- an approved asset has `originType: UNKNOWN`;
- incompatible booleans exist;
- duplicate `assetId` or version collisions exist;
- production records lack checksum;
- `HOLD` or `REJECTED` assets are marked exportable;
- source URL is absent where externally sourced;
- an AI-assisted asset omits prompt/provenance metadata.

Add focused tests. Preserve all existing tests.

## RED-TEAM ATTACKS

Attempt to break the system with at least these cases:

1. Pinterest image labeled “free”.
2. Old-looking scan with no publication proof.
3. Canva Pro element proposed for standalone resale.
4. AI image made from a named modern deck reference.
5. Public-domain artwork with a copyrighted modern restoration.
6. Asset with valid web-use license but no print rights.
7. Human review field populated by an AI agent.
8. Duplicate asset versions with different files.
9. Approved record with missing checksum.
10. Source disappears after approval.

The system must classify these conservatively and explain why.

## 10/10 ACCEPTANCE GATES

The phase is complete only if all are true:

- one canonical registry exists;
- policy, schema, validator and tests agree;
- every state transition is documented;
- `APPROVED` requires real human review;
- Canva usage boundaries are use-case-specific;
- AI provenance is reproducible;
- public-domain claims require evidence;
- no asset artwork was created in this phase;
- lint, typecheck, tests and build pass;
- an independent red-team review reports zero unresolved critical/high findings.

## EXECUTION DISCIPLINE

1. Sync and confirm branch.
2. Inventory existing asset/license code before writing.
3. Produce a gap report.
4. Implement in small commits: policy/schema → validator/tests → report/docs.
5. Run gates after each commit.
6. Never force-push.
7. Never modify application UI or card data.
8. Stop immediately after the Phase 1 report.

## FINAL REPORT FORMAT

Report:

- commit SHAs;
- files changed;
- registry/schema decisions;
- test count before/after;
- red-team findings;
- exact unresolved legal/licensing questions;
- Canva folder IDs used;
- GO/NO-GO recommendation for Phase 2.

Do not start Phase 2 without explicit product-owner approval.
