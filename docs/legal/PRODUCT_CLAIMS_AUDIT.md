# Product Claims Audit

**Phase:** CRG-1 (Commercial Release Gate Review)
**Date:** 2026-07-28
**Prepared by:** Claude (CRG-1 execution)
**Scope:** all user-facing copy in `src/` (components, fixed copy
modules, AI system-prompt constraints, red-line validators) plus
`docs/UI_PREMIUM_V1.md` and governance docs, scanned for risky claims.

## Method

Read all fixed-copy source files directly (`src/lib/constitution-copy.ts`,
`src/components/DisclaimerFooter.tsx`,
`src/server/intake/crisis-resources.ts`,
`src/server/reading-engine/providers/claude/prompt.ts`,
`src/server/reading-engine/validate.ts`) plus grepped every component
under `src/components/` for inline string literals of visible length.
Cross-referenced against the risky-claims and required-framing categories
below.

## Risky-claims categories checked (none found in current code)

| Category | Found? | Evidence |
|---|---|---|
| Predicts the future / claims certainty ("kesinlikle," "mutlaka," "garantili") | **No** | Explicitly forbidden in three independent layers: the consent modal ("YAPILMAZ: Kesin kehanet"), the AI system prompt ("Kesin kehanet yapma... kullanma"), and the red-line output validator (`CATEGORY_4_MANIPULATION` regex list in `validate.ts`, which throws on any output containing these phrases) |
| Claims to give "correct" answers | **No** | Result disclaimer: "Siz karar verirsiniz. Kartlar sadece ayna" (you decide, cards are only a mirror) — the opposite framing |
| Claims to analyze personality/subconscious in a clinical sense | **No** | No such copy found anywhere in components or fixed-copy modules |
| Claims to provide therapy | **No** | Consent modal: "Tıbbi tavsiye" listed under YAPILMAZ; result disclaimer: "Sağlık, hukuki, mali veya duygusal kriz için profesyonel destek alınız" (routes explicitly to real professionals) |
| Diagnoses a condition | **No** | AI system prompt forbids "Sağlık... kesin tavsiye"; reflection-prompt validator (`REFLECTION_DIAGNOSIS` regex) actively blocks any AI-generated text containing diagnosis-adjacent terms (depresyon, anksiyete, hastalık, teşhis, tanı, ilaç, terapi, or an imperative "-malısın/-melisin" construction) before it can reach the user |
| Certain-outcome framing ("olacaksın," "kazanacaksın," date-bound predictions) | **No** | `REFLECTION_PREDICTION` regex in `validate.ts` blocks this category specifically, including relative-time predictions ("yarın," "gelecek hafta," "ay içinde") |
| "Scientifically proven" / clinical-authority language | **No** | Not present; the product does not claim scientific validation anywhere |
| Professional counseling framing (positions itself as a substitute for a counselor) | **No** | Explicitly the opposite: routes to "profesyonel destek" for health/legal/financial/emotional-crisis situations |
| Over-personalization / "AI knows you" claims | **No** | No copy claims the AI has persistent knowledge of, memory of, or special insight into the specific user; each reading is stateless (no accounts, no persistence — see `docs/legal/DATA_FLOW_AND_USER_RIGHTS_INVENTORY.md`) |
| Third-party subject certainty ("O seni seviyor mu?" type claims about someone other than the user) | **No** | `REFLECTION_THIRD_PARTY` regex specifically blocks reflection prompts that make a third party (patronun, sevgilin, eşin, annen, baban, arkadaşın, kocan, karın, "o/onun") the certain subject |

## Required framing — present and verified

| Requirement | Present? | Evidence |
|---|---|---|
| Reflective-tool framing, not prophecy | Yes | "Bu uygulama, sembolik düşünme ve iç reflection aracıdır" (consent modal intro) |
| No health/therapy claim | Yes | See table above |
| Crisis screen makes no treatment promise | Yes | `CRISIS_MESSAGE`: "Bu zor bir durum olabilir. Yalnız değilsiniz - profesyonel destek almanız önemli." — acknowledges, does not diagnose, does not promise resolution, routes to 112 only |
| Card interpretations not presented as certain fact | Yes | Enforced at three layers (consent copy, system prompt, red-line validator) as shown above |
| User autonomy emphasized | Yes | "Siz karar verirsiniz. Kartlar sadece ayna." (autonomyNote in `RESULT_DISCLAIMER_COPY`) |

## Findings

**Zero risky-claim findings in the current codebase.** The product's
existing safety copy and validation architecture (fixed, non-generated
copy for safety-critical text; a system prompt with explicit forbidden-
phrase and forbidden-interpretation-type lists; a red-line regex
validator that runs on every AI output before it reaches the user,
covering both the free-form interpretation output and the reflection
prompt specifically) already implements the "required framing" column
above more strictly than this audit's checklist required. This is a
pre-existing property of the product (established across FAZ 2–8 and the
Ethical Constitution the copy is sourced from), not something this CRG-1
pass added.

## What this audit does not cover

- **Marketing copy outside the shipped application** (a future landing
  page, App Store/Play Store listing text, social media copy) does not
  exist yet in this repository and was not audited — it must be audited
  separately whenever it is written, using this same checklist.
- **The AI narration's actual runtime output** was not sampled live in
  this pass (no live Anthropic API call was made); this audit covers the
  *constraints* on that output (system prompt + validator), not a live
  transcript sample. The red-line validator is the mechanism that
  prevents a constraint violation from reaching a real user even if the
  model doesn't follow the system prompt.
- **Non-Turkish-language variants** do not exist yet; nothing to audit.

## Recommendation

No copy changes are recommended or needed as a result of this audit —
consistent with CRG-1's own boundary (default no production code
changes), this finding of "already compliant" means no separate
product-owner approval request is needed for a copy fix, because none is
being proposed.
