# Investor Readiness Intake — Claim Normalization

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Source type:** NotebookLM synthesis of repository documents and research notes  
**Authority level:** Research intake only  
**Investor-use eligible:** No, not without repository verification  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No

## Purpose

This record separates investor-facing claims that may be supportable today from claims that require qualification, further evidence, or rejection. It does not prove current implementation, test status, commercial readiness, legal clearance, or product-market fit.

## Required corrections to the source synthesis

1. NotebookLM citation markers such as `[1]` and `[2]` are not repository evidence.
2. `ADR-002` must not be cited as the anti-prophecy authority.
3. "Deterministic" should be limited to card draw/order behavior actually verified in code and tests; do not claim meaning synthesis is fully deterministic unless independently proven.
4. "Personalized" must not imply persistent personal profiling or a mature persona system unless exact runtime evidence exists.
5. "Safe and ethical" is not supportable as an absolute claim. At most, the product may be described as designed with specific safety controls that remain under evaluation.
6. Test counts and pass status require current CI or local-run evidence. Historical counts must not be presented as current fact.
7. Anti-addiction design is not the same as durable enforcement. In-memory rate limiting does not prove cooldown, account quota, or same-question controls.
8. Privacy-preserving claims require current evidence for logging, retention, deletion, persistence, telemetry, and provider payload handling.
9. Academic alignment does not establish efficacy, validation, endorsement, or licensed methodology.
10. Commercial readiness, scalability, originality, unit economics, retention, and willingness-to-pay remain unproven until explicit evidence exists.

## Claim review

| Claim | Source classification | Governed classification | Why | Safe wording ceiling | Evidence required before stronger wording |
|---|---|---|---|---|---|
| Personal insight system | Supportable today | `SUPPORTABLE_WITH_QUALIFICATION` | This is the intended product positioning, but "psychological mirror" can imply clinical authority. | “Insight Engine is a structured personal-reflection product that uses symbolic prompts to help users examine choices, boundaries, and perspectives.” | Current product copy, onboarding, consent, and runtime output must consistently match this positioning. |
| Deterministic | Supportable today | `SUPPORTABLE_WITH_QUALIFICATION` | Card selection/order may be deterministic, but narration and synthesis are not necessarily deterministic. | “Card identity, order, position, and seed are controlled by a deterministic Reading Engine; the language model is limited to narration.” | Exact implementation paths, invariant tests, and a current passing test run. |
| Personalized | Supportable today | `NOT_YET_SUPPORTABLE` unless narrowly scoped | Context-sensitive wording is not the same as mature personalization or persistent persona awareness. | “The narration adapts to the user-provided question and selected topic context.” | Verified persona implementation, data model, consent, persistence, and tests. |
| Safe and ethical | Supportable with qualification | `SUPPORTABLE_WITH_STRONG_QUALIFICATION` | Safety controls exist in design and some code, but crisis resources, live-model behavior, human red-team evidence, and semantic validation remain incomplete or unresolved. | “The product is designed with pre-draw crisis gating, narration boundaries, and prohibited-claim checks that are still undergoing independent validation.” | Current official crisis resources, live-model evaluation, human-authored adversarial cases, verified semantic controls, CI evidence. |
| Tested | Supportable with qualification | `SUPPORTABLE_WITH_QUALIFICATION` | Exact test count and pass status are not current unless supported by a recent run. Mock and unit tests do not prove live-model safety. | “The repository contains automated tests for core deterministic and safety invariants; current release claims remain subject to a verified full test run and live-model evaluation.” | Current CI/local logs, exact test paths, live provider evaluation, scorer results. |
| Anti-addiction | Supportable with qualification | `NOT_YET_SUPPORTABLE_AS_PRODUCT_OUTCOME` | Intent and design rules exist, but durable cooldown, account quota, repetition detection, and user-behavior evidence are not complete. | “The product is being designed to reduce certainty-seeking and repetitive readings through cadence limits and agency-preserving language.” | Durable enforcement, bypass tests, same-question detection, product metrics, user research. |
| Academically supported | Supportable with qualification | `HIGH_RISK_CLAIM` | Literature alignment does not prove product efficacy; copyrighted tarot methodology is quarantined and not approved for runtime use. | “The reflection model is informed by selected research on interpretive meaning-making and structured reflection.” | Real source titles/DOIs, claim-level mapping, legal review, no implication of clinical validation or endorsement. |
| Privacy-preserving | Supportable with qualification | `NOT_YET_SUPPORTABLE` as a broad claim | Logging may be designed to exclude prompt text, but complete retention, deletion, persistence, analytics, and provider handling are unresolved. | “The current architecture aims to minimize sensitive text in operational logs; the full privacy and deletion model is still under development.” | Data-flow inventory, retention policy, deletion workflow, provider payload rules, telemetry tests, privacy notice. |
| Beta ready | Not yet supportable | `NOT_YET_SUPPORTABLE` | Persistence, live evaluation, safety remediation, visual/IP readiness, and deployment evidence remain incomplete. | “The project is a functional product prototype progressing toward a controlled closed beta.” | Closed-beta gate checklist and evidence. |
| Scalable | Not yet supportable | `NOT_YET_SUPPORTABLE` | Framework choice and deployment plan do not prove operational scalability. | “The architecture uses web technologies that can support future scaling, but production load and reliability have not yet been validated.” | Production deployment, load tests, shared rate-limit/cooldown store, database performance, monitoring, rollback. |
| AI tarot platform | Misleading | `REVISE_POSITIONING` | The phrase can collapse the product into a fortune-telling category, but hiding the tarot module entirely could also mislead. | “Insight Engine is a personal-reflection platform whose first module uses tarot symbolism within explicit non-predictive safety boundaries.” | Consistent product copy and user-expectation testing. |
| Commercially ready | High risk | `UNSUPPORTED` | No verified pricing, retention, willingness-to-pay, legal readiness, unit economics, or operational evidence. | “The current phase is focused on validating user value, safety, and unit economics before commercial launch.” | Beta metrics, cost data, pricing tests, legal/privacy completion, support model. |
| Original visual system | High risk | `NOT_YET_SUPPORTABLE` | Visual direction is not the same as completed original, licensed, provenance-documented assets. | “An original visual direction is in development; commercial-use and provenance checks must be completed before release.” | Final assets, source/provenance log, licenses, originality review, mobile tests. |

## Investor wording rules

### Allowed now, subject to repo verification

- “Functional product prototype.”
- “Deterministic card draw and ordering architecture.”
- “Narration-only model boundary.”
- “Designed as structured reflection rather than fortune-telling.”
- “Safety and user-agency controls are under active evaluation.”

### Avoid until stronger evidence exists

- “Proven safe.”
- “Clinically grounded.”
- “Psychological mirror.”
- “Commercially ready.”
- “Scalable.”
- “Privacy-preserving.”
- “Anti-addiction product.”
- “200+ tests prove safety.”
- “Fully personalized.”
- “Academically validated.”
- “Original and commercially cleared visuals.”

## Evidence ladder for investor claims

1. **Design intent** — ADR, product brief, or governance rule exists.
2. **Implementation evidence** — exact current code path exists.
3. **Test evidence** — exact relevant test exists and passes in a current run.
4. **Live evidence** — real provider/deployment behavior has been observed.
5. **Independent evidence** — human or external reviewer confirms the result.
6. **Market evidence** — user behavior, retention, willingness-to-pay, and unit economics support the claim.

A claim must not be promoted beyond the highest completed evidence level.

## Candidate investor statement

> Insight Engine is a functional personal-reflection prototype whose first module uses tarot symbolism within a deterministic card-selection architecture and a narration-only language-model boundary. The product is being developed with crisis gating, prohibited-claim controls, and user-agency safeguards, while live-model safety, persistence, privacy, visual provenance, and commercial validation remain in progress.

This wording remains draft and must be rechecked against current repository and release evidence before external use.

## Product Owner review checklist

- [ ] Confirm the preferred category language: personal reflection, personal insight, or meaning-making.
- [ ] Confirm whether tarot should appear in the first sentence of investor positioning.
- [ ] Confirm that no clinical or therapeutic implication is intended.
- [ ] Verify current deterministic invariant evidence.
- [ ] Verify current test-run evidence before mentioning any count.
- [ ] Confirm anti-addiction wording does not overstate implementation.
- [ ] Confirm privacy wording does not overstate retention/deletion controls.
- [ ] Confirm academic wording does not imply efficacy or endorsement.
- [ ] Confirm visual and commercial-readiness claims remain blocked.

## Governance state

- External investor use approved: no
- Runtime modification: none
- KnowledgeBundle promotion: prohibited
- Locked claims created: no
- Methodology extraction resumed: no
- Next permitted action: Product Owner review followed by repository evidence verification
