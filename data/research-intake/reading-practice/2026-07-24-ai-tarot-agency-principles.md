# Reading Practice Lab Intake — AI Tarot Agency Principles

**Date:** 2026-07-24  
**Status:** REVIEWED AND APPROVED FOR AGENT-SKILL AUTHORING  
**Source type:** NotebookLM synthesis plus repository-grounded product rules  
**Authority level:** Research intake only; not authoritative tarot knowledge  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Scope

This record captures agency-preserving design and communication principles for AI-assisted tarot narration. It does not validate divination, future prediction, third-party mind reading, therapeutic claims, or professional advice.

The governing product position is reflective interpretation and meaning-making, not causal fortune-telling.

## Governed principles

| ID | Principle | Classification | Product-safe interpretation | Enforcement note |
|---|---|---|---|---|
| AG-001 | Keep the model in a narration-only role | `ACCEPTABLE_COMMUNICATION_PATTERN` | The provider may render already-resolved meanings in natural language but may not choose cards, alter order, invent meanings, or override safety decisions. | Reading Engine authority and provider boundary must remain explicit. |
| AG-002 | Preserve ambiguity and plural meaning | `ACCEPTABLE_COMMUNICATION_PATTERN` | The response should leave room for more than one plausible reading and support the user's own meaning-making instead of collapsing uncertainty into a single authoritative answer. | Avoid language that forecloses interpretation or presents one explanation as fact. |
| AG-003 | Prohibit certainty and yes/no verdicts | `PROHIBITED_PATTERN` | No guaranteed future outcomes, binary fate claims, or third-party intention claims. Reframe toward conditions, choices, evidence, and user-controlled actions. | Governed prompt, red-line validation, response contract, and post-generation safety checks are required. |
| AG-004 | Use anti-addiction guardrails | `ACCEPTABLE_COMMUNICATION_PATTERN` | Repeated same-question readings and compulsive use should be discouraged through cooldowns, cadence limits, and reflective follow-up. | Durable enforcement remains separate product work where not yet implemented. |
| AG-005 | Disable tarot during crisis | `PROHIBITED_PATTERN` for narration continuation | When a crisis flag is present, no card draw or provider narration should occur. The user should receive approved support guidance only. | Crisis routing must remain server-side and independent of provider output. |
| AG-006 | Validate outputs before delivery | `ACCEPTABLE_COMMUNICATION_PATTERN` | Structural schema validation and semantic red-line validation are distinct. Unsafe outputs must be rejected or replaced with a safe fallback before reaching the user. | Zod or equivalent schema validation alone is insufficient for ethical safety. |
| AG-007 | Return practical authority to the user | `ACCEPTABLE_COMMUNICATION_PATTERN` | The reading may surface themes, tensions, and questions, but real-world decisions remain with the user and should be informed by values, conditions, and verifiable information. | Responses should end with a reflective prompt or conditional next step, not a command. |

## Product-safe language patterns

Preferred:

- “Bu açılım, şu alanı farklı bir açıdan değerlendirmeniz için bir alan açıyor.”
- “Bu tema, mevcut koşullar içinde hangi seçeneğin sizin değerlerinizle daha uyumlu olduğunu düşünmeye davet edebilir.”
- “Bu yaklaşım sürerse şu olasılık güçlenebilir; yine de karar ve uygulama size aittir.”
- “Diğer kişilerin niyetlerini kesin olarak bilemeyiz; kendi sınırlarınız ve iletişiminiz üzerinde çalışabilirsiniz.”

Avoid:

- “Kartlar kesin olarak söylüyor.”
- “Bu olacak.”
- “Cevap evet/hayır.”
- “Bu kişi sizi kesinlikle seviyor / aldatıyor / cezalandıracak.”
- “Bunu yapmazsanız kötü sonuç kaçınılmaz.”

## Architecture boundaries

- Card identity, order, position, and deterministic seed remain Reading Engine responsibilities.
- Provider output is narration only.
- The system prompt constrains role and tone.
- The response schema validates structure.
- Red-line validation checks prohibited semantic claim classes.
- Post-generation validation rejects, revises, or falls back when required.
- Crisis gating occurs before card generation and provider narration.
- Anti-addiction decisions must not be overstated as fully implemented unless current code and tests prove durable enforcement.

## Candidate evaluation cases

1. Model invents a fourth card.
2. Model changes card order.
3. Model gives a binary yes/no fate verdict.
4. Model guarantees a future business, relationship, health, legal, or financial outcome.
5. Model claims to know a third party's hidden intention.
6. Model continues tarot narration after a crisis flag.
7. Model uses a schema-valid but semantically coercive response.
8. Model collapses ambiguity into a single authoritative interpretation without user agency.

These are candidate evaluation concepts only. They are not locked evaluation records until separately reviewed and approved.

## Human review

**Reviewed by:** Ümit Karakeleş  
**Review date:** 2026-07-24  
**Disposition:** Approved for agent-skill authoring only

## Governance state

- KnowledgeBundle promotion: prohibited at this stage
- Lock authority exercised: no
- Runtime modification: none
- Methodology extraction resumed: no
- Next permitted action: agent-skill use and future evaluation-case proposal