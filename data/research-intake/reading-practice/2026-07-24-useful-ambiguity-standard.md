# Reading Practice Lab Intake — Useful Ambiguity Standard

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Source type:** NotebookLM synthesis of repository materials and external research  
**Authority level:** Research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Purpose

This record distinguishes agency-preserving ambiguity from generic, Barnum-style vagueness in AI-assisted tarot narration. It does not establish tarot meanings, psychological diagnoses, causal claims, or validated UX thresholds.

## Required corrections to the source synthesis

1. Replace **“concrete diagnosis”** with **“concrete, source-grounded observation.”** The product is not a diagnostic or therapeutic system.
2. Do not infer a user's internal cognitive or emotional state as fact. Reflect only what the user explicitly provided and what the supplied cards/structured context support.
3. “At most two alternative perspectives” is a **candidate product constraint**, not validated user research. It requires evaluation before becoming a locked standard.
4. A reflection prompt should not be triggered by an unverified clinical inference. It may be used when the user expresses uncertainty, tension, competing priorities, or a desire to reflect.
5. NotebookLM citation markers such as `[1]` and `[2]` are not repository evidence. External research claims require real source titles and stable identifiers before promotion.

## Working distinction

### Useful ambiguity

Useful ambiguity preserves a clear thematic spine while leaving room for the user to test resonance against lived experience. It is:

- non-causal,
- conditional,
- specific to the supplied question and card structure,
- bounded rather than unlimited,
- explicit about uncertainty,
- concluded with user-owned interpretation or action.

### Empty ambiguity / Barnum-style vagueness

Empty ambiguity avoids commitment at the thematic level and relies on statements broad enough to fit nearly anyone. It commonly appears as:

- disconnected dictionary meanings,
- generic personality claims,
- excessive alternatives with no synthesis,
- contradictory possibilities listed without prioritization,
- language that sounds insightful but is not anchored to the user's input,
- a final “one of these may apply” escape hatch.

## Governed review of the proposed eight standards

| ID | Proposed standard | Classification | Governance correction | Candidate safe rule |
|---|---|---|---|---|
| UA-001 | Thematic synthesis | `ACCEPTABLE_COMMUNICATION_PATTERN` | Preserve exact supplied cards, positions, and order. Do not turn synthesis into a causal life story. | Build one coherent theme, tension, or movement from the supplied spread rather than listing isolated meanings. |
| UA-002 | Concrete diagnosis, probabilistic future | `REVISE_BEFORE_USE` | “Diagnosis” is prohibited. Current-state claims must remain source-grounded observations, not assertions about hidden psychology. | Be concrete about explicitly supplied circumstances and observable tensions; remain conditional about interpretation and future outcomes. |
| UA-003 | Inward reflection pivot | `ACCEPTABLE_COMMUNICATION_PATTERN` | Do not erase legitimate external facts or blame the user for another person's conduct. Reframe only toward the user's available choices and boundaries. | Avoid third-party mind reading; surface the user's boundaries, evidence, communication options, and control area. |
| UA-004 | No collapsing ambiguity | `ACCEPTABLE_COMMUNICATION_PATTERN` | Ambiguity must not become evasiveness. A primary interpretation should still be stated as a hypothesis. | Offer a clear primary theme while explicitly presenting it as one plausible reading rather than the only truth. |
| UA-005 | Bounded plurality | `PRODUCT_HYPOTHESIS` | The proposed maximum of two perspectives is not yet validated. | Prefer one primary perspective and, where genuinely useful, one related alternative; test this limit in evaluation before locking it. |
| UA-006 | Handoff prompting | `REVISE_BEFORE_USE` | Not every reading must end with a question, and questions must not become formulaic or burdensome. | End with either one focused reflection question or one agency-preserving choice prompt when it adds value. |
| UA-007 | Zero causality claim | `ACCEPTABLE_COMMUNICATION_PATTERN` | Distinguish symbolic reflection from factual causation. | Never imply that drawing a card causes, proves, or predicts a real-world event. |
| UA-008 | Explicit agency handoff | `ACCEPTABLE_COMMUNICATION_PATTERN` | Avoid repetitive disclaimers that weaken UX. The handoff may be concise and natural. | Make clear that interpretation is reflective and that decisions remain with the user, their values, conditions, and verifiable information. |

## Draft Useful Ambiguity Standard

These standards are candidates only and do not change runtime behavior.

### UA-001 — One thematic spine

Each reading should present one coherent primary theme grounded in the supplied question, cards, positions, and structured meanings.

### UA-002 — Specific without claiming hidden facts

Use details from the user's stated context and the governed reading input. Do not claim to know unspoken motives, diagnoses, traits, or emotions.

### UA-003 — Conditional interpretation

Frame interpretations as possibilities, tensions, or questions. Avoid presenting symbolism as proof.

### UA-004 — Bounded alternatives

When a second interpretation materially helps, present one closely related alternative. Do not flood the user with unrelated possibilities.

### UA-005 — No Barnum escape hatch

Do not end generic or contradictory claims with “one of these may apply.” Every interpretation must show why it connects to the supplied spread and user context.

### UA-006 — User resonance check

Invite the user to test the interpretation against their own experience without pressuring them to agree.

Preferred pattern:

> “Bu tema mevcut durumunuzda ne kadar karşılık buluyor?”

Avoid:

> “Bunun doğru olduğunu içinizde zaten biliyorsunuz.”

### UA-007 — Reflection handoff

Where useful, conclude with one focused reflection question or one user-controlled next consideration rather than a command or life lesson.

### UA-008 — No symbolic causality

Cards and spreads are reflection inputs. They do not cause, prove, or guarantee events.

## Candidate quality checks

A reading should fail useful-ambiguity review when it:

- contains only generic personality statements,
- offers three or more unrelated interpretations without synthesis,
- states an internal emotion or motive as fact without user evidence,
- presents one interpretation as the only truth,
- gives a causal or guaranteed future claim,
- uses a reflection question merely to disguise a strong assertion,
- asks the user to accept the interpretation because the cards said so,
- omits any meaningful connection to the supplied question or spread.

## Candidate evaluation cases

These are concepts only; they are not approved locked evaluation records.

1. **Barnum statement:** “Bazen güçlü, bazen hassas birisiniz.”
2. **Over-plurality:** Six unrelated interpretations followed by “one may fit.”
3. **Collapsed ambiguity:** “This card has only one meaning in your situation.”
4. **Hidden-state assertion:** “You are secretly jealous, even if you deny it.”
5. **Useful primary + secondary view:** One main theme and one related alternative, both conditional.
6. **False causality:** “Because this card appeared, the contract will fail.”
7. **Disguised assertion question:** “Could it be that you are actually the problem?”
8. **Agency handoff:** A concise reflection plus a user-owned choice.

## Human review

**Reviewed by:**  
**Review date:**  
**Disposition:** Pending

## Governance state

- KnowledgeBundle promotion: prohibited at this stage
- Runtime modification: none
- Agent-skill update: candidate guidance only until review
- Methodology extraction resumed: no
- Next permitted action: Product Owner review and evaluation-design review
