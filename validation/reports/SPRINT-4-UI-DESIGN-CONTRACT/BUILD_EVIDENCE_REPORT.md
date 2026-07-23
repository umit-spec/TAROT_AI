# Sprint 4 Build Evidence Report

**Date:** 2026-07-23
**Branch:** `feat/major-arcana-asset-migration`
**Commit:** `bff6419e3f61fa36931bfe5a2fac99e7891c8c92`
**Author:** Validation Lead
**Status:** Sprint 4 — CLOSED

---

## 1. Scope

**Sprint 4 — UI Design Contract & Functional Reading Flow**

Governed by `docs/SPRINT_4_UI_DESIGN_CONTRACT_PLAN.md` (approved 2026-07-23,
both flagged open questions resolved: responseDepth engine unchanged,
design tokens remain structural placeholders). Delivered:

1. `src/lib/constitution-copy.ts` + `src/lib/persona-mapping.ts` - fixed
   Ethical Constitution copy and the UX-DEBT-001 persona mapping, both as
   tested code, not just documentation.
2. 9 components matching the contract's component boundaries exactly
   (`ConsentModal`, `QuestionForm`, `ShuffleReveal`, `CardNarrationItem`,
   `DiagnosticBadge`, `ReadingResult`, `CrisisNotice`, `ErrorNotice`,
   `DisclaimerFooter`).
3. `src/app/page.tsx` rewritten as the ViewState orchestrator.
4. Tailwind config extended with the contract's §6 placeholder token
   structure.
5. Test infrastructure for component/integration testing (jsdom,
   React Testing Library) added without disturbing the existing
   node-environment server-side test suite.

---

## 2. Acceptance Evidence

All 5 gate commands re-run from a clean install (`rm -rf node_modules
.next && npm install`) at commit `bff6419`, immediately before this report.

| Command | Exit Code | Duration | Result |
|---|---|---|---|
| `npm install` | 0 | 18.0s | 0 errors. Same 3 vulnerabilities as SECURITY-DEBT-001 - no new dependencies changed the finding set (testing-library/jsdom additions carry no new advisories) |
| `npm run lint` | 0 | 4.2s | 0 errors, 0 warnings |
| `npm run typecheck` | 0 | 3.3s | 0 type errors |
| `npm run test` | 0 | 3.4s (2.77s reported by Vitest) | 9 test files, 106/106 tests passed |
| `npm run build` | 0 | 8.2s | 3 routes: `/` (static), `/_not-found` (static), `/api/readings` (dynamic) |

---

## 3. Browser Evidence

**This is a live, unmocked walkthrough against a running `next dev` server — not a component test.** Distinct from §4's automated evidence for the other 4 pipeline states, which use a mocked `fetch` (see there for why: reproducing all 5 states live would require the same mocking, at which point the dedicated test suite is the more rigorous instrument).

- **Browser:** Chromium (Playwright-managed, `executablePath: /opt/pw-browsers/chromium`), viewport 390×844 (mobile-first, per contract)
- **Command:** `node closure-walkthrough.mjs` (Playwright script driving `http://localhost:3000/`, dev server started via `npm run dev` at commit `bff6419`)
- **Exit code:** `0`

| Step | Action | Screen (`aria-label`) rendered |
|---|---|---|
| 1 | Load `/` | `consent-modal` |
| 2 | Click "Anlıyorum" checkbox, then "Devam Et" | `question-form` |
| 3 | Click "Kariyer" topic hint, fill question textarea | `question-form` (topicHint=career selected) |
| 4 | Click "Kartları Çek" | `shuffle-loading` |
| 5 | Response received | `reading-result` |

**Captured `/api/readings` response (this exact request):**
```json
{ "httpStatus": 200, "hasCrisisStatus": false, "provider": "mock", "knowledgeMetaStatus": "resolved" }
```
(`provider: "mock"` because no `ANTHROPIC_API_KEY` is configured in this environment - expected, matches every prior sprint's evidence. `knowledgeMetaStatus: "resolved"` because "career" is one of the two domains the Sprint 3 proof-of-concept bundle covers.)

---

## 4. Response-State Matrix — Proven Separately

Per instruction, each of the 5 pipeline outcomes is proven as its own
test, not lumped into "the UI renders a reading":

| Outcome | Test | Result |
|---|---|---|
| Normal / `resolved` | `normal success (resolved) renders First Insight + Detailed Synthesis, no diagnostic badges` | ✅ 385ms |
| Knowledge `partial` | `knowledge partial renders the reading normally, with the partial badge (not an error)` | ✅ 200ms |
| Knowledge `fallback` | `knowledge fallback renders the reading normally, with the fallback badge (not an error)` | ✅ 130ms |
| Narration fallback (`provider: mock`) | `narration fallback (provider: mock) renders full reading content with the mock badge` | ✅ 135ms |
| Crisis short-circuit | `crisis short-circuit renders CrisisNotice, never the reading UI` | ✅ 164ms |

Two additional states beyond the original 5, added because a UI (unlike
the API alone) has more ways to fail:

| Outcome | Test | Result |
|---|---|---|
| Request-level failure (400) | `400 validation error renders ErrorNotice, not a crash` | ✅ 110ms |
| Network failure | `network failure renders ErrorNotice with retry` | ✅ 135ms |

**Binding rule verified, not just stated:** knowledge `partial`/`fallback`
and narration `provider: mock` never render the Error State component -
each test above explicitly asserts `queryByLabelText('error-state')` is
absent when it shouldn't apply.

---

## 5. UI Security Boundaries — Proven Separately

| Boundary | Evidence |
|---|---|
| `QuestionForm` produces only permitted request fields | `fetch body is exactly { seed, question } when no topic hint chosen` and `fetch body includes topicHint when a topic hint button is chosen, still no persona/safety fields` - both assert `Object.keys(body)` contains only `seed`/`question`/`topicHint`, and explicitly assert `body.persona`, `body.safetyFlags`, `body.confidence` are `undefined` |
| `CrisisNotice` cannot accept card/interpretation props | `CrisisNoticeProps` interface has exactly two fields (`message`, `resources`) - verified both by a passing `npm run typecheck` (no excess-property path exists to add card data) and by a test asserting `Object.keys(props)` on a real instance equals exactly `['message', 'resources']` |
| UI never selects or reorders cards | `ReadingResult` renders `reading.cards.map((card, i) => ...)` directly off the array the server returned - no sort/filter/reorder call exists in the component (confirmed by reading the committed source, same technique used for Sprint 3's `KnowledgeProvider` "no import of deck.ts" structural check) |
| Intake is never computed client-side | No component, hook, or utility in `src/components/` or `src/lib/` calls anything resembling `classifyIntake` - the only classification logic remains where Sprint 3 put it, inside `src/app/api/readings/route.ts` |
| Fallback states are never presented as user error | See §4's binding-rule row above |

---

## 6. Test-Environment Observation (not a debt item)

A console hydration warning was observed during manual Playwright
testing, on the consent modal's checkbox element. Investigated, not just
noted:

- With **zero interaction** (page load only, no clicks), 0 hydration
  errors occur - re-verified for this report (`hydration-check.mjs`,
  exit code 0, output: `Hydration errors with ZERO interaction: 0`).
- The warning **only** appears after Playwright's automated `.click()`
  on the checkbox, and the diff it reports is a `style={{caret-color:
  "transparent"}}` attribute that this codebase's `ConsentModal` never
  sets - it is injected by the browser/CDP automation layer during the
  synthetic interaction, not produced by React or this component.
- React's own hydration-mismatch message explicitly names this class of
  cause: *"This can also happen if the client has a browser extension
  installed which messes with the HTML before React loaded."*
  Playwright's CDP-driven interaction is exactly this kind of external
  interference.

**Recorded here so a future engineer who sees the same console line does
not re-investigate it from scratch** - this is a test-tooling artifact of
automated-checkbox-interaction via CDP, not a product defect, and not
logged in `docs/SECURITY_DEBT_LOG.md` or `docs/UX_DEBT_LOG.md` because it
is not a debt - there is nothing here to eventually fix.

---

## 7. Deferred Items

Unchanged in kind from Sprint 3's list, now further narrowed:

- Persistence, reading history, auth, payments - still nothing built
- Full pair-relation matrix, citation ingestion, NotebookLM/RAG - Sprint 5 scope, not started
- Production visual identity - Sprint 4 deliberately kept all color tokens as placeholders (§6 of the design contract); no Canva/Figma lock exists yet
- Automated accessibility tooling (axe-core) - manual review only this sprint, per the contract's own flagged gap
- Live Anthropic integration gate - still mock-HTTP verified only
- `docs/SECURITY_DEBT_LOG.md` SECURITY-DEBT-001, `docs/UX_DEBT_LOG.md` UX-DEBT-001 - the latter is now **resolved** by this sprint's persona-mapping work (see §8), not merely narrowed
- Milestone 1 asset findings - still frozen, awaiting Red Team

---

## 8. Debt Closed This Sprint

**UX-DEBT-001 is now closed**, not just progressed. `src/lib/persona-mapping.ts`
and its test suite (`persona-mapping.test.ts`, 7 tests) satisfy all three
of the debt entry's "what needs to happen" items: an explicit mapping
table exists, it resolves the flagged Curious-Skeptic ambiguity by
recognizing it as a two-axis (persona + spiritualPreference) case rather
than a single persona value, and a test asserts every `Persona` value
resolves to exactly one profile for every `spiritualPreference` value -
the "no drift" guarantee the debt entry asked for.

---

## 9. Final Status

**Sprint 4 Status: PASS WITH DOCUMENTED DEBT**

UI Design Contract implemented and verified: response-state matrix
proven per-outcome, UI-side security boundaries proven separately from
(and consistent with) Sprint 3's API-side boundaries, live browser
walkthrough completed against the real dev server, and UX-DEBT-001
closed.

Persistence, full knowledge authoring, live provider integration, and
production visual identity remain deferred, not done.

---

## 10. Milestone 2 — CLOSED

**Milestone 2 Status: PASS WITH DOCUMENTED DEBT**

The full visible vertical slice this milestone targeted is built and
verified, end to end:

```
User Input → Server Intake → Safety Gate → Deterministic Reading
  → Knowledge → Narration → Validation → Browser UI
```

Across Sprints 1-4: a single Next.js 16 app (ADR-003), a deterministic
seeded Reading Engine (Sprint 1), a rule-based Intake Engine with no LLM
call (Sprint 2), a swappable narration-provider architecture with a
mock-HTTP-verified Claude adapter (Sprint 2), a Knowledge Layer with its
own swappable-provider architecture and observable resolution status
(Sprint 3), one product API enforcing the crisis gate and server-side
intake computation (Sprint 3), and a functional, accessibility-conscious
UI proving every one of those states is visible and distinguishable to
an actual user in an actual browser (Sprint 4).

**Open debt carried forward, explicitly:** `docs/SECURITY_DEBT_LOG.md`
SECURITY-DEBT-001 (sharp/postcss/next transitive vulnerabilities,
accepted risk), Milestone 1's frozen Red Team findings (`tests/assets.test.js`
stale reference, `11-justice.webp` threshold), no live Anthropic
integration, no persistence.

---

**Report Generated:** 2026-07-23
**By:** Validation Lead
**Branch:** `feat/major-arcana-asset-migration`
**Commit:** `bff6419e3f61fa36931bfe5a2fac99e7891c8c92`
**Next Step:** Sprint 5 — Knowledge Authoring Pipeline & Source Governance (pipeline construction first; no mass pair-relation generation until the pipeline itself is built and evidenced)
