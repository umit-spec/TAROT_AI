# Live Anthropic Evaluation — Safe Local-Run Procedure

**Sprint:** S2. **Runner:** Product Owner, locally. **Model:** `claude-sonnet-5` (default; override with `ANTHROPIC_MODEL`).
**Binding rule (D4):** the API key exists only in local `.env.local`. **Never** print, log, snapshot, commit, or place it in any evidence artifact.

---

## The key never leaves your machine

- Put the key in `.env.local` (git-ignored — verified by preflight). Do **not** `echo $ANTHROPIC_API_KEY`, paste it into chat, screenshots, or commits.
- The harness reads it via `loadClaudeProviderConfig()` and never logs it. The scrubber uses its value only to *detect* an accidental leak, never to print it.

## Step 1 — Preflight (never prints the key)

```
npm run evaluation:live-preflight
```
Verifies: key presence (reports only `present: true/false`), `.env*` + raw path are git-ignored, model resolvable, and the scrubber catches a synthetic `sk-ant-` key. A ✗ blocks the run. Also confirm outbound HTTPS to `api.anthropic.com` yourself (not auto-probed, to avoid sending the key).

## Step 2 — Run the evaluation

Default (no raw payloads retained — safest):
```
npm run evaluation:live-anthropic
```
Debug mode (opt-in raw payloads, local-only, git-ignored, delete within 7 days):
```
npm run evaluation:live-anthropic -- --retain-raw
```
The run writes `data/evaluation/runs/live-anthropic-<ts>/` with `results.json`, `manifest.json` (includes the model), and `live-anthropic-status.json` (`EXECUTED`). With `--retain-raw`, a git-ignored `raw/` subfolder holds per-case narration + structured request (each scrubbed before write; the run refuses to write any artifact containing a key).

> **What "raw" means here:** the full structured request the harness built plus the narration output — *not* the literal HTTP bytes. The Anthropic `Authorization` header and key live only in the transport layer and are never persisted, so a key physically cannot enter an artifact.

## Step 3 — Scrub before you look or commit

```
npm run evaluation:scrub-artifacts -- live-anthropic-<ts>
```
Fails loud if anything key-like is found anywhere in the run folder. Only the **derived, secret-free** `manifest.json` / `results.json` / `cost-report.md` may be committed as evidence; the `raw/` folder stays local.

## Step 4 — Cost + full report

```
npm run evaluation:cost -- live-anthropic-<ts>
```
Writes `cost-report.md` recording every required field: model name, run date, prompt version(s), input/output tokens, **total USD cost** (intro `claude-sonnet-5` pricing auto-applied on/before 2026-08-31), p50/p95 latency, fallback reasons, schema failures, red-line rejections, and zero-tolerance invariant results.

## Step 5 — Blind Claude-vs-Mock comparison

Run a mock pass with raw retention too, then build a blind sheet:
```
npm run evaluation:run                      # (or a --retain-raw mock pass if you add one)
npm run evaluation:compare -- build live-anthropic-<ts> mock-<ts>
```
Score `scores.template.json` (`preferred: A|B|tie`) **without** opening `unblind-map.json`. Then:
```
npm run evaluation:compare -- unblind data/evaluation/comparisons/<ts> your-scores.json
```
It reports live-vs-mock preference — the G1 signal. A second, independent human should score a subset.

## Step 6 — Clean up raw payloads

```
npm run evaluation:cleanup-raw          # deletes raw/ folders older than 7 days
```

## What still gates S2 PASS (not automatable)

1. A genuine live run you execute (this procedure). 2. Zero zero-tolerance violations. 3. Founder scoring. 4. Independent human subset scoring (Selin Naz Çokyaşar, pending — else a named alternative). 5. The blind Mock-vs-Claude delta. 6. The recorded **G1** GO/HOLD/STOP decision. Until then the ceiling is **IMPLEMENTATION COMPLETE — LIVE RUN PENDING**.
