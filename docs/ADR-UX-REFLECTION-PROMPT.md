# ADR-UX-REFLECTION-PROMPT — Governed reflection prompt field

**Status:** ACCEPTED — IMPLEMENTATION MAY BEGIN (rollout step 2), subject to the four binding amendments in §11.
**Type:** Architecture + schema/provider/validation decision. This ADR is docs; the amendments in §11 are binding on the implementation that follows.
**Decision owner:** Product Owner
**Unblocks:** the S-UX-5 reflection screen (`UX_FLOW_V2.md` §3.6 / §6), which is blocked until a governed `reflectionPrompt` field exists.
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr` (HEAD `be1d800`).
**Grounding:** `src/types/interpretation.ts` (`InterpretationOutputSchema`), `src/server/reading-engine/validate.ts` (`validateInterpretation`, forbidden-phrase scan), `src/server/reading-engine/index.ts` (`generateInterpretedReading`, `runProvider`, whole-output fallback), `src/server/reading-engine/providers/{types.ts,mock.ts,shared.ts}`, `docs/02-ETHICAL_CONSTITUTION.md`.

---

## 1. Why a new schema field is needed

The reflection screen must show **exactly one reflective question** that closes the session — the concrete "here is something to think about" moment that proves the product is reflection, not fortune-telling. That question is *narration* (it varies per reading), so it must be part of the governed `InterpretationOutput` produced through the provider boundary (ADR-011) and passed through the same validation gate as the rest of the reading. There is no field for it today; inventing it in the client would (a) let the UI author meaning, violating the no-invented-symbol boundary, and (b) escape the red-line validation that governs all narration. Therefore a governed `reflectionPrompt: string` is added to `InterpretationOutputSchema`.

## 2. Why `uncertaintyNotice` cannot be reused

`interpretation.uncertaintyNotice` is semantically an **uncertainty statement** — e.g. "Bu bir kesinlik değil, olası bir bakış açısıdır." (`providers/shared.ts` `UNCERTAINTY_NOTICE`). A reflection **question** — e.g. "Bu kararda kontrol etmeye çalıştığın şey ne?" — is a different content type with a different job (it invites the user to act on their own agency). Overloading one field to mean both:
- corrupts the boundary note (it must remain a calm epistemic disclaimer, not a prompt),
- makes it impossible to validate each with its own rules (a question must end in `?`; a notice must not read as a directive),
- and would force the UI to reinterpret text, which is banned.

They stay two distinct governed fields.

## 3. Provider contract

`InterpretationProvider.generate()` (`providers/types.ts`) returns `InterpretationOutput`; that output gains `reflectionPrompt`. Binding rules the field must satisfy — the prompt:

1. is **exactly one** reflective question;
2. is about the **user's own** thought, choice, need, or boundary;
3. makes **no future prediction**;
4. does **not** assert a third party's mind, intent, or behavior as certain;
5. gives **no** medical/psychological/legal/financial diagnosis or instruction;
6. uses **no blaming** language ("Neden hep böylesin?");
7. does **not** push compulsive re-use;
8. adds **no** symbol or meaning absent from the cards;
9. ends with a **single** question mark;
10. is **not** a list or multiple questions;
11. is **never empty**.

**Safe forms (illustrative):**
- "Bu durumda kendi ihtiyacını daha açık ifade etmek için neye dikkat edebilirsin?"
- "Şu anda kontrol edebildiğin en küçük adım ne olabilir?"
- "Bu örüntü sana hangi sınırını yeniden düşünmen gerektiğini gösteriyor?"

**Forbidden forms (illustrative):**
- "O sana geri dönecek mi?" (prediction + third-party)
- "Patronun seni kıskandığı için mi böyle davranıyor?" (third-party certainty)
- "Bu kartlar depresyonda olduğunu mu gösteriyor?" (diagnosis)
- "Yarın hangi kararı vermelisin?" (prediction/instruction)

## 4. Mock / fallback behavior

- **MockProvider** (`providers/mock.ts`) must emit a governed, deterministic `reflectionPrompt` (same byte-identical-output guarantee it has today). It draws from a central governed constant (see §9), so the fallback path always yields a compliant question.
- The existing **whole-output fallback** in `generateInterpretedReading` (provider throw / red-line failure → MockProvider) is unchanged in spirit, but see §5/§9: a *bad reflectionPrompt alone* should not necessarily nuke an otherwise-valid Claude reading to mock — a **field-level** governed fallback is preferred.

## 5. Validation and normalization

A dedicated `validateReflectionPrompt(text)` (new, alongside `validate.ts`) enforces, at minimum:
- **length** — a sane min/max (e.g. ~10–200 chars) so it is neither empty nor an essay;
- **single question** — exactly one `?`, and the trimmed text **ends** with `?`;
- **whitespace normalization** — collapse internal runs, trim ends, before checks;
- **prediction-language guard** — reject future-certain constructions (extends the `validate.ts` phrase spirit: "olacak", "kesinlikle", "mutlaka", date/timing promises);
- **third-party-certainty guard** — reject "o …-ecek/…-yor mu?" style claims about another person's mind/behavior as the subject;
- **diagnosis/instruction guard** — reject medical/psychological/legal/financial diagnosis or imperative advice;
- the existing **forbidden-phrase scan** (`scanForForbiddenPhrases`) also applies.

**On guard failure the provider's reflectionPrompt is NOT shown.** A normalization step substitutes the central governed fallback (§9) for that field while preserving the rest of the (valid) interpretation. This field-level fallback is preferred over a whole-reading fallback so a single bad question does not discard a good reading. (Alternative — reuse the existing whole-output fallback — is simpler but coarser; recommended: field-level.)

## 6. Prompt-injection boundaries

The reflection prompt is generated from the same isolated `InterpretationInput` as the rest of narration; the raw `questionText` is carried as data, never concatenated into instructions (existing ADR-011 guarantee). Additional boundaries:
- The guards in §5 run on the model's output regardless of provider, so an injected instruction that produced a prediction/diagnosis/multi-question prompt is caught and replaced.
- The field is length-bounded, so an attempt to smuggle a long payload through the reflection prompt is rejected.
- No user-supplied text is ever echoed verbatim into the prompt by the client; the client only renders the governed field.

## 7. Eval corpus

The live-eval harness (`scripts/evaluation/*`, the fixed case set) gains a `reflectionPrompt` assertion per case. The reflection-specific eval matrix must cover at least:

| # | Scenario | Expectation |
|---|---|---|
| 1 | relationship | one safe, user-focused question |
| 2 | career | one safe, user-focused question |
| 3 | self-reflection | one safe, user-focused question |
| 4 | empty question | governed neutral prompt, still valid |
| 5 | prediction-style input | prompt does not predict |
| 6 | third-party mind-reading input | prompt redirects to the user, no third-party certainty |
| 7 | intense emotional language | supportive, non-clinical, non-directive |
| 8 | provider malformed output | field-level fallback used |
| 9 | two-question output | rejected → fallback (single-question guard) |
| 10 | diagnosis-language output | rejected → fallback |
| 11 | imperative/advice-heavy output | rejected → fallback |
| 12 | prompt-injection input | guards hold; no prediction/diagnosis/multi-question leaks |

## 8. API backward compatibility

`reflectionPrompt` is **additive** to the reading response (`ReadingResponse.interpretation`). Existing API consumers that read specific fields are unaffected by an extra field. Making the field **required in the Zod schema** means any `InterpretationOutput` built without it fails `parse` — so the engine must guarantee it (§9) before `validateInterpretation` runs. No breaking change to request shapes or to `/api/readings` / `/api/readings/preview` contracts.

## 9. Migration / fallback strategy

- **Central governed source.** A single server-side constant (co-located with `UNCERTAINTY_NOTICE` in `providers/shared.ts`, e.g. `REFLECTION_PROMPT_FALLBACK`) holds the neutral fallback: **"Bu okuma sana şu anda hangi noktayı yeniden düşünmek için alan açıyor?"** — one question, user-focused, no prediction. It is the ONLY fallback source; the client never fabricates one.
- **Normalization guarantees presence.** `runProvider` gains a step: take the provider's `reflectionPrompt`; run §5 validation; if valid, keep it; if missing/empty/invalid, substitute the central fallback — *then* `validateInterpretation` parses a schema that now requires the field. This makes old providers/fixtures that don't set the field non-breaking at runtime (the engine fills it).
- **Recommended schema stance:** field **required** in `InterpretationOutputSchema` (clean type; the engine guarantees it). Accept the fixture/test edits this implies (§ closing "fixture impact").

## 10. UI acceptance criteria (S-UX-5, later commit — not now)

- The reflection screen shows **exactly one** question — the governed `reflectionPrompt` — rendered verbatim, alone, as the session's close.
- It is **not** sourced from `uncertaintyNotice`; the boundary note stays on the pattern screen.
- No "save", no "next reading", no upsell (S4), no re-use nudge.
- Reads as the user's own reflection; no diagnostic field, provider, confidence, or safety flag appears.
- a11y: semantic heading focused on mount; keyboard-operable; the question is not visually crushed with other content.
- Placed after the pattern/detail per `UX_FLOW_V2.md`; crisis/error never reach it.

---

## Closing — proposed diffs, impact, matrix, rollout, gate

### Proposed schema diff (illustrative, not applied)
```ts
// src/types/interpretation.ts — InterpretationOutputSchema
   practicalReflection: z.string().min(1),
+  reflectionPrompt: z.string().min(1), // governed; one reflective question (ADR-UX-REFLECTION-PROMPT)
   uncertaintyNotice: z.string().min(1),
```

### Provider changes
- `providers/shared.ts`: add `REFLECTION_PROMPT_FALLBACK` (central source).
- `providers/mock.ts`: emit a governed `reflectionPrompt`.
- `providers/claude/mapper.ts`: map a `reflectionPrompt` from model output.
- `reading-engine/index.ts` (`runProvider`): add the §5 validate-or-fallback normalization before `validateInterpretation`.
- `validate.ts` (or a sibling): add `validateReflectionPrompt`.

### Fixture impact
- Every `InterpretationOutput` literal in tests/fixtures (`src/__tests__/**`, `tests/**`, eval fixtures) must gain `reflectionPrompt` — or rely on engine normalization where they flow through `generateInterpretedReading`. Directly-constructed literals need the field added. This is a mechanical, wide-but-shallow edit to enumerate at implementation time.

### Test matrix
- Unit: `validateReflectionPrompt` (each guard: length, single-question, ends-with-?, normalization, prediction, third-party, diagnosis/instruction, forbidden-phrase).
- Engine: field-level fallback substitutes on invalid/missing; valid prompt preserved; whole reading not nuked for a single bad prompt.
- Provider: mock emits compliant prompt; Claude mapper maps it.
- Eval: the §7 matrix.
- UI (S-UX-5): §10 acceptance.

### Rollout order
1. **This ADR** (docs-only). ← current
2. Schema + central fallback + `validateReflectionPrompt` + `runProvider` normalization + MockProvider (one reviewed commit or a small set).
3. Claude mapper + eval fixtures + §7 matrix.
4. S-UX-5 reflection UI (§10).
5. Then card-name mapping, then visual polish (separate, later).

### GO / NO-GO
Implementation may begin only if:
- [ ] `reflectionPrompt` is a governed schema field, filled through the provider boundary (never client-authored).
- [ ] `uncertaintyNotice` is **not** repurposed as the question.
- [ ] A single central server-side fallback exists; the client fabricates nothing.
- [ ] Guards (§5) run on every provider's output; on failure the governed fallback is used, provider text not shown.
- [ ] Field-level fallback preserves an otherwise-valid reading.
- [ ] `/api/readings` and `/api/readings/preview` contracts remain backward compatible.
- [ ] The §7 eval matrix and §test matrix are covered.

**NO-GO** if the question would be client-authored, if `uncertaintyNotice` would be reused, or if a guard failure could surface non-compliant model text to the user.

### Sign-off
- **Decision:** GO (Product Owner, 2026-07-24) — rollout step 2 may begin, subject to §11.
- On GO: proceed with rollout step 2 as a separate reviewed change. Do not start S-UX-5 UI, card-name mapping, or visual polish before their turn.

---

## 11. Binding amendments (Product Owner)

These four amendments are binding on the implementation.

### A1 — Separate raw provider output from the final governed output
The provider may emit output whose `reflectionPrompt` is **missing or unknown**. That raw output is validated against a **raw** schema where `reflectionPrompt` is **optional**; the **final** `InterpretationOutputSchema` (where it is **required, non-empty**) is produced **only after** normalization fills/validates the field. This ordering prevents the final-schema parse from throwing *before* the field-level fallback can run.
- `RawInterpretationOutputSchema` — `reflectionPrompt: z.string().optional()`; the return type of `InterpretationProvider.generate()`.
- `InterpretationOutputSchema` — `reflectionPrompt: z.string().min(1)`; produced by `runProvider` after normalization; what the API/UI see.

### A2 — Field-level fallback applies ONLY to a `reflectionPrompt` violation
If only the `reflectionPrompt` is missing/invalid, substitute the central fallback for that field and keep the rest of the reading. If **any other** field carries prediction, diagnosis, or a forbidden phrase, the existing **whole-reading fallback** (provider → MockProvider in `generateInterpretedReading`'s catch) still applies. Field-level fallback never masks a bad reading elsewhere.

### A3 — Fixed validation thresholds (no repair)
`validateReflectionPrompt` normalizes whitespace (trim + collapse internal runs), then accepts only if the candidate is:
- **20–220 characters**,
- exactly **one** `?`,
- **ends** with `?`,
- **single line, not a list** (no newline, no list markers).
On any failure it does **not** attempt to repair the text (no trimming a second question, no appending `?`): it goes **directly** to the central governed fallback. The §5 prediction / third-party-certainty / diagnosis-instruction guards and the existing forbidden-phrase scan also apply, with the same straight-to-fallback outcome.

### A4 — Fallback telemetry is metadata-only
If (and only if) suitable telemetry infrastructure exists, a fallback may record **only** `provider | fallback` and a **categorical** reason (e.g. `reflection_prompt_invalid`). It must **never** log the raw question, the rejected prompt, or any reflection text. In this rollout the engine exposes a categorical `reflectionPromptSource: 'provider' | 'fallback'` (no text); nothing logs the rejected or accepted prompt text.

### Binding choices (confirmed)
| Topic | Decision |
|---|---|
| Required / optional | Required in the **final** schema; optional in the **raw** schema (A1) |
| Field-level / whole-output | Field-level for `reflectionPrompt`; whole-output for other fields (A2) |
| Central fallback | Approved (single server-side source) |
| Fallback sentence | Approved |
| Client-side fallback | Forbidden |
| `uncertaintyNotice` reuse | Forbidden |
