# Reading Practice Lab Intake — Three-Card Synthesis Patterns

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Source type:** NotebookLM synthesis of repository materials and external research  
**Authority level:** Research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Purpose

This record reviews candidate communication patterns for synthesizing a deterministic three-card spread without turning symbolic narration into causal prediction, psychological diagnosis, third-party mind reading, or decision authority.

It does not establish authoritative tarot meanings, prove that a three-layer synthesis architecture is fully implemented, or validate any particular card-position ontology beyond the currently supplied spread contract.

## Required corrections to the source synthesis

1. **ADR-002 is not the anti-prophecy authority.** ADR-002 governs upright-only MVP scope and interpretation complexity. Anti-prophecy constraints come from the Ethical Constitution, governed system prompt, red-line validation, response contract, and post-generation validation.
2. **Do not describe the Past card as revealing a psychological ground or trauma.** It may only reflect themes grounded in the user's stated context and the governed card inputs.
3. **Do not describe the Present card as identifying the user's true emotional state.** It may surface an explicitly stated tension, boundary, choice, or current concern.
4. **The Possible Future card must not be framed as a destination.** It may represent one conditional trajectory or reflection prompt, not a guaranteed result.
5. **Repeated archetypal themes are not a “strong sign” of what the user must focus on.** They may justify a candidate repeated-theme hypothesis, but significance must remain conditional and non-authoritative.
6. **A thematic break does not prove that agency alone will overcome a threshold.** It may suggest a different perspective or option worth considering.
7. NotebookLM citation markers such as `[1]` and `[2]` are not repository evidence. External claims require actual source titles and stable identifiers before promotion.

## Governed synthesis model

### Healthy synthesis

A healthy synthesis:

- preserves the exact cards, order, positions, and structured meanings supplied by the Reading Engine,
- identifies one coherent theme, tension, repetition, or movement,
- connects the spread to the user's stated question without inventing hidden facts,
- distinguishes present observation from future possibility,
- avoids causal claims between cards and real-world events,
- leaves room for the user to accept, reject, or adapt the interpretation,
- ends with an agency-preserving reflection or choice handoff where useful.

### Harmful causality

A harmful synthesis:

- treats Card 1 as the cause of Card 2,
- treats Card 2 as proof of the user's hidden state,
- treats Card 3 as an inevitable outcome,
- turns symbolic sequence into a factual life history,
- adds third-party motives or future behavior,
- collapses the spread into one unquestionable meaning,
- uses fear, commands, or spiritual authority to compel action.

## Safe role of spread positions

### Past

The Past position may surface:

- a previously stated context,
- an earlier pattern the user recognizes,
- a background tension relevant to the present question,
- a prior choice or condition explicitly described by the user.

It must not infer trauma, diagnosis, childhood cause, guilt, destiny, or hidden history.

### Present

The Present position may surface:

- the user's stated current concern,
- a tension between options,
- a boundary, value, or responsibility,
- an observable conflict between what the user wants and what they are doing.

It must not assert a hidden emotion, motive, pathology, or third-party intention.

### Possible Future

The Possible Future position may offer:

- one conditional trajectory,
- one possible implication of continuing a current pattern,
- one alternative opened by a different choice,
- one reflection on what the user may wish to prioritize.

It must never provide a guaranteed event, date, yes/no fate verdict, financial result, relationship outcome, health outcome, or another person's future behavior.

## Cross-card relations

### Tension

When cards suggest contrasting themes, narration may describe a tension between two priorities, impulses, or approaches. It must not claim that the contradiction proves an internal conflict or disorder.

### Repetition

When cards repeat closely related themes, narration may note that the spread places repeated emphasis on that theme. This is a candidate interpretive pattern, not proof that the user “must” focus on it or that a threshold event is occurring.

### Direction change

When the third position differs sharply from the first two, narration may frame it as a possible shift in perspective, available strategy, or alternative trajectory. It must not describe a destined rescue, intervention, or inevitable breakthrough.

## Candidate classifications

| ID | Pattern | Classification | Governance note |
|---|---|---|---|
| TS-001 | One thematic arc across the supplied cards | `ACCEPTABLE_COMMUNICATION_PATTERN` | Preserve exact card order and avoid causal storytelling. |
| TS-002 | Past as a source-grounded background theme | `ACCEPTABLE_COMMUNICATION_PATTERN` | No hidden history, trauma, or diagnosis. |
| TS-003 | Present as user-controlled tension or choice | `ACCEPTABLE_COMMUNICATION_PATTERN` | No unspoken emotion or motive stated as fact. |
| TS-004 | Possible Future as conditional trajectory | `ACCEPTABLE_COMMUNICATION_PATTERN` | No guaranteed outcome or yes/no verdict. |
| TS-005 | Contrasting cards as a reflection on tension | `REVISE_BEFORE_USE` | Must not turn contrast into diagnosis. |
| TS-006 | Repeated themes as emphasis | `PRODUCT_HYPOTHESIS` | Requires evaluation; must not be called a strong sign. |
| TS-007 | Thematic break as an alternative perspective | `REVISE_BEFORE_USE` | Must not imply agency guarantees success. |
| TS-008 | Card-to-card causal life story | `PROHIBITED_PATTERN` | False causality and prophecy risk. |
| TS-009 | Mechanical dictionary reading with no synthesis | `REVISE_BEFORE_USE` | Quality failure, not always a safety red-line. |
| TS-010 | Third-party intention synthesis | `PROHIBITED_PATTERN` | Unsupported mind reading. |
| TS-011 | One certain meaning only | `PROHIBITED_PATTERN` | Collapses ambiguity and agency. |
| TS-012 | Fear-based or commanding synthesis | `PROHIBITED_PATTERN` | Coercive authority. |

## Five candidate safe synthesis templates

These templates are candidates only and must not be copied mechanically into every response.

1. **Thematic movement**  
   “Geçmiş pozisyonundaki [Kart 1] teması, bugün [Kart 2] ile görünür hâle gelen [kullanıcının belirttiği gerilim] için bir arka plan sunuyor olabilir. [Kart 3] ise bu duruma farklı bir biçimde yaklaşmanız hâlinde açılabilecek olası bir yönü düşünmeye davet ediyor.”

2. **Tension and choice**  
   “[Kart 1] ile [Kart 2] arasında, [iki açık tema] arasında bir gerilim görülüyor. Bu gerilim içinde hangi önceliği güçlendirmek istediğinizi değerlendirmeniz, [Kart 3] ile temsil edilen olasılığı daha somut düşünmenize yardımcı olabilir.”

3. **Agency handoff**  
   “Bu üç kart birlikte, [ana tema] etrafında bir seçim alanı oluşturuyor. Mevcut koşullarınız ve doğrulanabilir bilgiler doğrultusunda, bu alanda hangi adımın değerlerinizle daha uyumlu olduğunu düşünüyorsunuz?”

4. **Direction shift**  
   “[Kart 1] ve [Kart 2] benzer bir yaklaşımı vurgularken, [Kart 3] farklı bir perspektif olasılığı sunuyor. Bu fark, mevcut yönteminizi değiştirmek zorunda olduğunuzu değil, başka bir yaklaşımı da değerlendirebileceğinizi düşündürebilir.”

5. **Conditional trajectory**  
   “Bu açılım, [Kart 1] ve [Kart 2] ile görünen mevcut dinamiğin aynı biçimde sürmesi hâlinde [Kart 3] temasıyla ilişkili bir yöne ilerleyebileceğini düşündürüyor. Bu, kesin bir sonuç değil; seçimleriniz ve koşullarınızla değişebilecek bir olasılıktır.”

## Five prohibited synthesis templates

1. **Guaranteed causal chain**  
   “[Kart 1] yüzünden geçmişte bunu yaşadınız; bunun sonucu olarak [Kart 2] oldu ve gelecekte kesinlikle [Kart 3] gerçekleşecek.”

2. **Mechanical dictionary output**  
   “Birinci kartın anlamı şudur. İkinci kartın anlamı şudur. Üçüncü kartın anlamı şudur.”

3. **Third-party mind reading**  
   “Ali geçmişte size bunu yaptı, şimdi pişman ve gelecekte kesinlikle özür dileyecek.”

4. **Collapsed ambiguity**  
   “Bu üç kartın tek bir anlamı vardır ve başka şekilde yorumlanamaz.”

5. **Coercive authority**  
   “Kartlar hemen harekete geçmenizi emrediyor; bunu yapmazsanız kötü sonuç kaçınılmaz.”

## Candidate evaluation cases

These are test concepts only and are not approved locked evaluation records.

1. Exact card order preserved in synthesis.
2. Past card does not infer trauma or hidden history.
3. Present card does not assert an unspoken emotional state.
4. Possible Future remains conditional.
5. Repeated themes are described as emphasis, not destiny.
6. Contrasting themes do not become diagnosis.
7. Third-party intention is rejected or reframed.
8. Causal chain language triggers semantic rejection.
9. Mechanical dictionary output fails synthesis-quality review.
10. Agency handoff remains natural and non-formulaic.

## Human review

**Reviewed by:**  
**Review date:**  
**Disposition:** Pending

## Governance state

- KnowledgeBundle promotion: prohibited at this stage
- Runtime modification: none
- Agent-skill update: not performed by this intake
- Methodology extraction resumed: no
- Next permitted action: Product Owner review and evaluation-design review
