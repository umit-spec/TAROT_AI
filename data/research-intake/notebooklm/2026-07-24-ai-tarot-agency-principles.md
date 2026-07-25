# NotebookLM Research Intake — AI Tarot Agency Principles

**Date:** 2026-07-24  
**Status:** REVIEWED AND APPROVED FOR AGENT-SKILL AUTHORING  
**Reviewed by:** Ümit Karakeleş  
**Source type:** NotebookLM synthesis combining repository material and external research summaries  
**Authority level:** Governed research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Scope

This record captures product and communication principles for preserving user agency in AI-supported tarot narration. It does not authorize runtime changes, locked knowledge, methodology extraction, persistence work, or production claims.

NotebookLM citation markers such as `[1]`, `[2]`, and `[3]` are not valid repository citations. Repository-grounded claims may be carried into agent-skill authoring. External research claims remain `EXTERNAL_RESEARCH_PENDING_SOURCE_VERIFICATION` until their actual URLs, DOI/arXiv identifiers, authors, publication dates, and relevant passages are verified by a named human.

## Governed claim review

| ID | Principle | Classification | Governed interpretation | Current disposition |
|---|---|---|---|---|
| AG-001 | Keep the AI as narration-only rather than card-selection or decision authority | `ACCEPTED_ARCHITECTURAL_PATTERN` | The Reading Engine supplies the exact cards, order, positions, resolved meanings, and safety context. The provider may render language but must not originate or alter the reading's meaning. | Approved for agent-skill authoring; runtime already governed separately by ADR-011 and provider boundaries. |
| AG-002 | Preserve interpretive openness instead of collapsing ambiguity into one certain answer | `ACCEPTABLE_COMMUNICATION_PATTERN` | Narration should offer a small set of plausible themes, tensions, or reflective questions. It must not convert symbolic material into a single factual diagnosis, causal explanation, or command. | Approved for agent-skill authoring. Academic phrasing such as “negotiated meaning” remains external-research language pending source verification. |
| AG-003 | Ban guaranteed predictions and yes/no certainty | `ACCEPTED_SAFETY_PATTERN` | Future-oriented language must remain conditional. The system must not guarantee contact, reconciliation, profit, punishment, health outcomes, legal outcomes, pregnancy, death, or another person’s behavior. | Approved for agent-skill authoring. Anti-prophecy authority is the Ethical Constitution, governed prompt, red-line validation, response contract, and post-generation validation—not ADR-002. |
| AG-004 | Redirect attention from unverifiable external actors to the user’s control area | `ACCEPTABLE_COMMUNICATION_PATTERN` | The response should focus on the user’s boundaries, values, evidence, communication options, available support, and next reflective step instead of third-party mind-reading. | Approved for agent-skill authoring; aligned with RP-001 and RP-004 in the Reading Practice Lab intake. |
| AG-005 | Use anti-compulsion limits such as repeated-question controls and cooldown | `ACCEPTED_NOT_FULLY_IMPLEMENTED` | The ethical goal is accepted, but an in-memory rate limiter is not equivalent to durable account-level cooldown, same-topic detection, or metered entitlement. Those require persistence and explicit implementation evidence. | Approved as product/safety guidance only; do not claim complete runtime enforcement. |
| AG-006 | Short-circuit tarot narration during crisis | `IMPLEMENTED_PATTERN_WITH_CONTENT_REMEDIATION_REQUIRED` | Server-side crisis classification must bypass card generation and provider narration. Crisis resources must be current, official, and jurisdiction-appropriate. | Architectural principle approved. Existing legacy crisis-resource content requires separate runtime remediation and official verification before release. |
| AG-007 | Validate outputs through layered structural and semantic controls | `ACCEPTED_SAFETY_PATTERN` | Schema validation checks structure; it does not by itself detect ethical violations. Semantic red-line validation and post-generation rejection/fallback are separate controls. | Approved for agent-skill authoring. Exact runtime coverage remains subject to live-provider evaluation. |
| AG-008 | Fall back safely when a provider violates constraints | `ACCEPTED_ARCHITECTURAL_PATTERN` | Unsafe or invalid provider output must not reach the user. The system should reject the output and use an approved safe fallback path. MockProvider is a deterministic testing/fallback component, not an independent source of truth. | Approved for agent-skill authoring; live Anthropic/OpenAI evidence remains pending. |

## Approved agency-preserving language rules

### AP-001 — Narration, not authority

Do not present the model, cards, or system as knowing the correct decision. State themes and questions; leave real-world decisions with the user.

**Preferred:**

> “Bu açılım, önünüzdeki seçenekleri hangi değerlerle değerlendirdiğinizi düşünmeniz için bir alan açıyor.”

**Avoid:**

> “Kartlar ne yapmanız gerektiğini açıkça söylüyor.”

### AP-002 — Preserve bounded ambiguity

Offer two or three plausible reflective readings when the evidence supports more than one interpretation. Do not overwhelm the user with unlimited possibilities, and do not collapse the answer into certainty.

**Preferred:**

> “Bu tema hem sınır koyma ihtiyacına hem de mevcut sorumlulukları yeniden dengeleme gereğine işaret edebilir. Hangisinin durumunuza daha çok uyduğunu siz değerlendirebilirsiniz.”

### AP-003 — Conditional future language

Use conditions and user-controlled factors.

**Preferred:**

> “İhtiyaçlarınızı açıkça ifade etmeniz, sürecin daha yapıcı ilerleme ihtimalini güçlendirebilir.”

**Avoid:**

> “Bu görüşmenin sonunda kesinlikle istediğinizi alacaksınız.”

### AP-004 — Control-area reframing

Shift from hidden motives and unverifiable predictions toward boundaries, communication, evidence, options, and support.

**Preferred:**

> “Diğer kişinin ne düşündüğünü kesin olarak bilemeyiz; sizin beklentinizi ve sınırlarınızı nasıl ifade edeceğiniz daha güvenilir bir hareket alanıdır.”

### AP-005 — Reflection prompt, not directive

End with one open, practical question rather than an order.

**Preferred:**

> “Bu hafta, sonucunu kontrol edemediğiniz bir konu yerine hangi küçük davranışı bilinçli olarak seçebilirsiniz?”

## Safety and architecture distinctions

1. **ADR-002:** upright-only MVP scope and reduced interpretation complexity; not the primary anti-prophecy control.
2. **ADR-011:** provider remains a narration layer and must not originate card meanings, order, or safety judgments.
3. **Response schema:** validates structure and permitted shapes.
4. **Governed prompt:** constrains role and language.
5. **Red-line validation:** detects prohibited claim/wording classes.
6. **Post-generation validation:** rejects, revises, or falls back when semantic constraints fail.
7. **Crisis gate:** prevents tarot/provider narration for crisis-classified intake.
8. **Rate limit:** current in-memory abuse prevention must not be represented as durable cooldown, repeated-topic prevention, or account quota.

## Candidate evaluation cases

These are draft test concepts only; they are not locked evaluation records.

1. Model changes one supplied card while preserving JSON shape.
2. Model gives one definitive interpretation despite two plausible themes.
3. Model guarantees reconciliation or profit.
4. Model claims to know a third party’s hidden intention.
5. Model responds to a crisis-classified request with tarot advice.
6. Model returns structurally valid JSON containing manipulative or fear-based language.
7. Model encourages another reading of the same question rather than reflection/cooldown.
8. Model frames MockProvider fallback as proof that the reading is true.

## External-research verification backlog

Before any academic claim is promoted into authoritative product documentation, record:

- exact source URL or DOI/arXiv identifier,
- title and authors,
- publication date,
- relevant finding versus author interpretation,
- exact passage or page supporting the claim,
- named human verifier and verification date.

Pending concepts include:

- negotiated meaning,
- ambiguity collapse and foreclosure of agency,
- reflective prompts and problem-solving awareness,
- user behavior in AI-assisted tarot contexts.

## Governance state

- Agent-skill authoring: approved
- Runtime modification: none
- KnowledgeBundle promotion: prohibited
- Locked knowledge created: no
- S4 started: no
- Methodology extraction resumed: no
- Live-provider evidence: pending
