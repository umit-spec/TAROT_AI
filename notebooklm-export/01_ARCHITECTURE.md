# 01 — Architecture

**Generated:** 2026-07-24 · **Commit:** `5e0a5bb` · **Confidentiality:** Internal
**Grounding:** repository source at this commit.

---

## Stack (from `package.json`)

- **Runtime deps only 4:** `next` ^16, `react` ^19, `react-dom` ^19, `zod` ^3.23. No DB/ORM/auth/analytics runtime deps.
- **Dev:** TypeScript ^5 (strict), Vitest ^4, ESLint 9, Testing Library, Tailwind, tsx, prettier.
- **Single Next.js 16 application** — no monorepo, no separate backend (ADR-003). App Router.

## Next.js structure (`src/`)

```
src/
  app/
    layout.tsx, page.tsx, globals.css     # client orchestrator UI
    api/readings/route.ts                 # the single product endpoint (POST)
    api/health/route.ts                   # S3 liveness (GET)
  middleware.ts                           # S3: x-request-id on every /api request
  components/                             # ConsentModal, QuestionForm, ShuffleReveal,
                                          # ReadingResult, CrisisNotice, ErrorNotice,
                                          # CardNarrationItem, DiagnosticBadge, DisclaimerFooter
  lib/                                    # constitution-copy.ts, persona-mapping.ts
  server/
    intake/                               # index, keywords, normalize, rules, safety
    knowledge/                            # index, bundle, local-json-provider, types, errors
    reading-engine/                       # index, cards, deck, deterministic, synthesis, validate
      providers/
        types.ts, shared.ts, mock.ts
        claude/ (config, errors, http, index, mapper, prompt)
    observability/                        # S3: request-id, log, rate-limit
  types/                                  # api, card, intake, interpretation, knowledge,
                                          # knowledge-authoring, reading, evaluation, asset-license
```

## Reading Engine (`src/server/reading-engine/`)

The **sole authority** for which cards, in what order, at what positions, and orientation (ADR-011/012). Key files:
- `deterministic.ts` — seed-based selection (reproducible).
- `deck.ts`, `cards.ts` — 22 Major Arcana loaded from `data/cards/*.json`.
- `synthesis.ts` — pattern layer (Layer 2, non-AI).
- `index.ts` — `generateInterpretedReading(...)`: orchestrates draw → knowledge resolution → provider narration → validation → fallback. Returns `{ reading, output, providerUsed, promptVersionUsed, knowledge, usage?, fallbackReason? }`.
- `validate.ts` — schema + red-line (forbidden-phrase) validation gate on provider output.

**Three-layer model (ADR-004):** (1) deterministic DB lookup, (2) synthesis/patterns, (3) LLM narration only.

## Provider interface (`src/server/reading-engine/providers/`)

- `types.ts` — `InterpretationProvider` contract: `generate(input) → InterpretationOutput`, `name`, `promptVersion`, optional `getLastUsage?()` (Sprint 6, token capture).
- `mock.ts` — `MockProvider`: deterministic, no network, no key; the always-available fallback.
- `claude/` — `ClaudeProvider`: narration-only. `config.ts` (`DEFAULT_MODEL = 'claude-sonnet-5'`, `loadClaudeProviderConfig`, never logs the key), `http.ts` (Anthropic call + retry + usage capture), `mapper.ts` (parse + **card-order verification**), `prompt.ts` (`PROMPT_VERSION`, system/user prompts). Swapping providers **never changes what a reading means** (ADR-011).

## Deterministic card draw

Seed-based; same seed → same cards/order. Verified by `src/__tests__/unit/reading-engine.test.ts` and enforced as zero-tolerance invariant #11 (no provider reorders/adds/drops cards). A fabricated Claude response with reordered insights is rejected by `mapper.ts` and falls back to Mock.

## Validation pipeline

1. Request schema (`src/types/api.ts` `ReadingRequestSchema`) — has **no** persona/safetyFlags fields to trust.
2. Server-side `classifyIntake` (`src/server/intake/`).
3. Crisis gate (route level).
4. Provider output → `validateInterpretation` (`reading-engine/validate.ts`): Zod schema + red-line forbidden phrases. On failure → fallback to Mock, classified `fallbackReason` (`red-line-rejected` | `schema-invalid` | `provider-error`).
5. Response schema (`ReadingResponseSchema`) parsed before return.

## API routes

- **`POST /api/readings`** (`src/app/api/readings/route.ts`): validate JSON → validate request schema → S3 rate-limit (env-gated) → `classifyIntake` → crisis gate → `generateInterpretedReading` → versioned `ReadingResponse`. Emits redacted structured log + `x-request-id`. Returns `crisis` / reading / `400` / `429`.
- **`GET /api/health`** (`src/app/api/health/route.ts`): `{status, version, commit, timestamp}`; no secrets, no DB.
- **Middleware** (`src/middleware.ts`): sets/propagates `x-request-id`, matcher `/api/:path*`.

## Observability (S3, `src/server/observability/`)

- `request-id.ts` — correlation id.
- `log.ts` — `buildReadingLogRecord` / `logReading`: structured JSON, **input type has no field for question/reflection/crisis text** (redaction by construction).
- `rate-limit.ts` — fixed-window per-IP limiter; OFF in dev/test, ON in prod or `RATE_LIMIT_ENABLED=1`; in-memory (durable store deferred to S4).

## Versioning

Every response carries `versions: { deck, algorithm, knowledge, prompt }` (`DECK_DATA_VERSION`, `DECK_ALGORITHM_VERSION` from reading-engine; `knowledge.meta.version`; provider `promptVersion`). Enables reproducibility and provenance.

## Data (repository, non-secret)

`data/cards/*.json` (22 cards) · `data/contexts.json`, `data/positions.json` · `data/knowledge/bundle-v0.1.0.json` (live pilot bundle) · `data/knowledge-authoring/` (sources.json, records/, lessons removed pre-G1) · `data/knowledge-builds/pilot/` · `data/evaluation/cases/cases.json` (24 cases) + prior run artifacts · `data/assets/pilot-license-manifest.json`.

## Deployment readiness

CI code gates and Vercel **preview** config exist (`.github/workflows/code-gates.yml`, `vercel.json`). No production deploy, no production DB (S3 boundary). Deploy runbook: `docs/deploy/`.
