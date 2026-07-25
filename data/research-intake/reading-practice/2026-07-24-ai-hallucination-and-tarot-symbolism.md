# AI Hallucination and Tarot Symbolism

**Date:** 2026-07-24  
**Status:** RESEARCH_INTAKE_ONLY  
**Review:** DRAFT — CLAIM REVIEW PENDING  
**Promotion:** NO AUTOMATIC RUNTIME, KNOWLEDGEBUNDLE, LOCKED-EVAL, OR AGENT-SKILL PROMOTION

## Scope

This research intake records two related risk areas for Insight Engine:

1. Textual hallucination during tarot narration and meaning construction.
2. Visual hallucination during AI-assisted tarot card design and symbolic interpretation.

The source material includes academic discussion, practitioner commentary, historical tarot analysis, video material, and existing Insight Engine governance. NotebookLM-style numeric references are not accepted as sufficient bibliographic evidence until they are resolved to real source records.

## 1. Textual interpretation risks

### Accepted findings

- A large language model does not establish a real causal relationship between a tarot card and events in a user's life.
- A model can generate coherent, emotionally aligned, and personally resonant language without the claims being factually grounded.
- Persuasive tone, emotional resonance, or narrative fluency must not be treated as evidence of truth.
- Users may incorrectly assign divine, cosmic, diagnostic, or predictive authority to statistically generated language.
- Context-sensitive generation can make an unsupported inference feel highly personal and therefore more credible than it is.

### Required claim qualifications

The following formulations are too strong and must not be promoted as product facts:

- "The model reflects the user's unconscious."
- "The model creates meanings specifically designed for the user's unconscious."
- "Hallucination is a valid source of ritual truth."

Safer formulations:

- The model may imitate themes, tone, wording, and associations present in the user's input, creating a personal-seeming reflection effect.
- The model may produce contextually appropriate but unsupported inferences.
- Some practitioners may treat unexpected model output as a creative prompt, but Insight Engine must not present hallucination as a valid symbolic message or supernatural signal.

### Product boundary

Hallucinations must not be framed as useful mystical randomness. Unsupported claims should be rejected, regenerated, or routed to a safe fallback.

The system may support reflection, but it must not imply that the model has access to:

- the user's unconscious,
- divine intent,
- cosmic truth,
- hidden third-party motives,
- certain future events,
- clinical or diagnostic knowledge.

## 2. Visual symbolism risks

### Accepted findings

- Uncontrolled generative-image systems may produce anatomical, compositional, textual, or symbolic artifacts.
- A visually attractive tarot image may still contain incoherent or misleading symbolic details.
- Visual ambiguity can leak into narration if the model describes symbols that are not actually present on the governed card image.
- Human review, provenance, card-by-card annotation, and symbolic consistency checks materially reduce this risk.

### Required claim qualifications

The following statements must remain practitioner opinion or community perception rather than objective product facts:

- "Every line and color in a traditional tarot deck has a documented esoteric meaning."
- "AI-generated decks are soulless."
- "AI art necessarily destroys tarot symbolism."

Safer formulations:

- Some historical decks draw heavily on specific symbolic and esoteric traditions, but not every visual detail should be assumed to have a documented intended meaning.
- Some practitioners regard AI-generated decks as lacking artistic intention, symbolic coherence, or human authorship.
- Uncontrolled AI image generation can weaken symbolic reliability, especially when artifacts or invented details survive review.

### Asset-governance implication

AI-assisted tarot imagery is not automatically disallowed, but it requires:

- documented provenance,
- rights and licence review,
- human art direction,
- card-by-card visual QA,
- canonical symbol annotation,
- rejection of malformed or ambiguous details,
- no automatic interpretation of unverified visual elements.

## 3. Fabricated evidence red line

### Proposed governed definition

`FABRICATED_EVIDENCE` occurs when the narration model asserts, describes, or relies on a visual symbol, historical fact, source claim, card property, or user-specific fact that is not supported by governed evidence available to the system.

Examples include:

- describing an animal, object, colour, gesture, inscription, celestial body, or background element that is not present in the governed card data or verified visual annotation;
- inventing historical symbolism or presenting a disputed correspondence as settled fact;
- claiming that a card proves another person's motives;
- treating an image-generation artifact as intentional symbolism;
- citing a nonexistent source or unsupported tradition;
- presenting generated interpretation as evidence of cosmic, clinical, or factual truth.

### Candidate product rule

> The narration model must not infer, invent, or describe a visual symbol unless that symbol is explicitly present in governed card data or in a human-verified visual annotation record.
>
> Any unsupported visual or factual claim must be classified as `FABRICATED_EVIDENCE` and must trigger rejection, regeneration, or safe fallback.

This is a candidate rule pending claim review, evaluation design, and explicit Product Owner approval. It is not automatically a runtime standard.

## 4. Determinism clarification

Invented symbolism does not change the deterministic card draw itself. The draw may remain correct while the narration becomes ungrounded.

The accurate risk statement is:

> Fabricated visual or symbolic claims do not alter the Reading Engine's deterministic draw, but they can corrupt the interpretation layer by attributing unsupported meaning to the selected cards.

The Reading Engine remains the sole authority for card identity, order, position, orientation, and seed. The narration provider remains narration-only.

## 5. Evaluation implications

Future evaluation should include cases where the model is tempted to:

- mention a symbol absent from the card annotation;
- merge symbols from two different cards;
- infer reversed imagery in an upright-only system;
- invent astrological, numerological, Kabbalistic, alchemical, or historical correspondences;
- interpret image artifacts as intentional details;
- state practitioner opinion as historical fact;
- convert emotional resonance into certainty;
- attribute cosmic or diagnostic authority to generated text.

Candidate outcomes:

- PASS: all visual and factual claims are grounded.
- REGENERATE: one or more unsupported claims appear but can be safely retried.
- FALLBACK: grounding cannot be restored reliably.
- BLOCK: content creates a serious safety, diagnostic, defamatory, or fabricated-evidence risk.

## 6. Source and copyright governance

- Video transcripts and practitioner commentary remain copyrighted unless a compatible licence is explicitly verified.
- Long quotations, transcript storage, and distinctive wording reuse are prohibited.
- Practitioner opinions must be labelled as opinion, not consensus.
- Public-domain status must be verified per work and jurisdiction.
- NotebookLM numeric references must be replaced with canonical metadata before claim approval.
- No source in this intake becomes automatic runtime authority.

## 7. Product implications accepted for further review

- Separate emotional resonance from factual truth.
- Do not frame hallucination as a mystical message.
- Ground all literal symbol references in governed card data or verified annotations.
- Treat unsupported visual claims as a fabricated-evidence risk.
- Keep human review and provenance central to AI-assisted card artwork.
- Preserve the narration-only boundary and deterministic Reading Engine authority.

## 8. Rejected overclaims

- AI reads or mirrors the user's unconscious.
- AI hallucinations provide divine or cosmic truth.
- Every traditional tarot detail is intentionally encoded and documented.
- All AI-generated decks are symbolically invalid or "soulless."
- A narration hallucination changes the deterministic card draw.
- Community commentary alone establishes a technical, historical, or legal fact.

## 9. Open actions

- Resolve all source metadata and real bibliographic references.
- Compare the proposed `FABRICATED_EVIDENCE` definition with existing semantic red-line taxonomy records.
- Define a governed visual-annotation schema before runtime promotion.
- Add adversarial evaluation cases only through a separate evaluation-governance review.
- Review the current 22-card asset set for literal symbol accuracy, provenance, and commercial rights.
- Obtain explicit Product Owner approval before promotion into prompts, validators, card data, agent skills, or locked evaluation.

## Final status

```text
RESEARCH_INTAKE_ONLY
DRAFT — CLAIM REVIEW PENDING
NO AUTOMATIC RUNTIME OR KNOWLEDGE PROMOTION
```
