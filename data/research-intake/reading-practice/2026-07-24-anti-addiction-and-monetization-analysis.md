# Reading Practice Lab Intake — Anti-Addiction and Monetization Analysis

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Source type:** NotebookLM synthesis of repository materials and product hypotheses  
**Authority level:** Research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Purpose

This record separates currently implemented request-throttling controls from product-level anti-addiction mechanisms, and records monetization ideas as hypotheses rather than validated business facts.

It does not establish that durable cooldowns, account quotas, same-question detection, daily reflection, weekly summaries, threshold classification, or premium willingness-to-pay are implemented or validated.

## Required corrections to the source synthesis

1. **In-memory rate limiting is not an anti-addiction system.** It is a per-instance abuse and traffic-control mechanism. It may be bypassed by IP change, horizontal scaling, process restart, shared networks, or other deployment conditions.
2. **Do not mark in-memory rate limiting as `IMPLEMENTED_AND_TESTED` without exact test-path verification and a current successful test run.** Existing code presence is not equivalent to verified passing behavior.
3. **Durable cooldown, account quota, and same-question repetition detection are distinct controls.** They require persistence, identity strategy, data minimization, abuse analysis, and dedicated tests.
4. **Semantic repetition detection must not assume embeddings are required.** Embeddings may create privacy, retention, cost, and governance risks. Less invasive approaches must be evaluated first.
5. **Daily and weekly engagement are product hypotheses, not proven healthy habits.** They could themselves create habitual or compulsive engagement.
6. **Threshold reading is not considered fully implemented-and-tested merely because the three-card reading flow exists.** Threshold eligibility, classification, enforcement, and user-behavior outcomes remain separate questions.
7. **“Clinical/koçluk reflection tool” is unsafe positioning.** Insight Engine is not therapy, clinical care, diagnosis, or professional coaching unless separately designed, governed, licensed, and validated.
8. **High willingness-to-pay is unverified.** Pricing, frequency, conversion, retention, and customer segment assumptions require real user research and experiments.
9. **ADR references must not be stretched beyond their actual decisions.** ADR-002 is not the anti-prophecy authority. ADR-007 may record cooldown or metering decisions, but acceptance does not prove implementation. Any ADR-014 claim must be checked against the actual repository text before being presented as current truth.
10. **NotebookLM citation markers are not repository evidence.** Claims require exact repository paths, tests, ADR text, or verified external sources.

## Control separation matrix

| ID | Control | Primary purpose | Current governed status | Main bypass or failure risk | Data required | Minimum evidence before implementation claim |
|---|---|---|---|---|---|---|
| AA-001 | In-memory rate limit | Reduce burst abuse, bot traffic, and accidental request floods | `IMPLEMENTED_NOT_TEST_VERIFIED` based on known code path; current test run not established here | IP change, NAT collisions, multi-instance inconsistency, process restart, proxy misconfiguration | Request key, timestamp, deployment context | Exact code path, exact relevant test path, current passing run, deployment-key verification |
| AA-002 | Durable cooldown | Prevent rapid repeated readings across restarts and instances | `ACCEPTED_NOT_IMPLEMENTED` unless current code proves otherwise | Anonymous identity reset, account switching, clock issues, distributed consistency | Minimal user or device identifier, last eligible reading timestamp, reason code | Persistence implementation, bypass analysis, expiry tests, multi-instance tests, privacy review |
| AA-003 | Account quota | Enforce metered access by account and period | `ACCEPTED_NOT_IMPLEMENTED` unless current code proves otherwise | Disposable accounts, shared accounts, payment abuse | Account ID, period, usage count, plan state | Auth/persistence proof, quota boundary tests, reset tests, concurrency tests |
| AA-004 | Same-question repetition detection | Reduce certainty-seeking loops on identical or materially similar questions | `PRODUCT_HYPOTHESIS` | Rephrasing bypass, false positives, sensitive text retention, language variation | Prefer minimal normalized features; raw text retention should be avoided unless justified | Product rule, privacy model, similarity approach comparison, false-positive evaluation, appeal path |
| AA-005 | Daily non-tarot reflection | Offer lightweight reflection without card draw | `PRODUCT_HYPOTHESIS` | Habit loop, notification pressure, generic content, replacement dependency | Minimal engagement telemetry only after consent and retention design | User study, opt-in design, no-streak-pressure review, retention and wellbeing metrics |
| AA-006 | Weekly reflection | Summarize user-owned notes or themes without claiming diagnosis | `PRODUCT_HYPOTHESIS` | Overgeneralization, passive authority, sensitive-data accumulation | Explicitly consented user inputs, bounded retention, deletion path | Privacy design, summary-quality evaluation, no-diagnosis checks, user control |
| AA-007 | Threshold reading | Reserve deeper reading for meaningful user-defined moments | `PRODUCT_HYPOTHESIS_WITH_PARTIAL_PRODUCT_SUPPORT` | Everyday questions relabeled as thresholds, opaque gatekeeping, low usage | User-declared context; avoid hidden psychological classification | Clear eligibility rule, UX research, false-accept/reject review, user override or explanation model |

## Product-layer principles

### AA-P1 — Do not optimize for repeated uncertainty checking

The product must not use streaks, urgency, expiring certainty, “one more card,” escalating unlocks, or fear-of-missing-out mechanics to increase reading frequency.

### AA-P2 — Separate reflection cadence from tarot cadence

Non-tarot journaling or reflection may be explored, but it must not become a disguised daily dependency loop. Frequency must remain opt-in, non-punitive, and easy to disable.

### AA-P3 — User-defined threshold, not hidden psychological classification

The system should not claim to know that an event is a “true threshold” based on inferred mental state. Threshold eligibility should be transparent, explainable, and based on explicit product rules or user choice.

### AA-P4 — No monetized anxiety relief

The product must not charge users to obtain reassurance, reverse an unfavorable reading, unlock repeated readings, remove fear, or reveal a supposedly hidden answer.

## Communication-layer principles

### AA-C1 — Do not encourage repetition for clarity

Avoid language such as:

> “Bu yeterince net değilse bir kart daha çekelim.”

Prefer:

> “Bu yorumu bir süre gözlemlemek ve yeni bilgi ortaya çıkmadan aynı soruyu tekrar etmemek daha sağlıklı bir düşünme alanı sağlayabilir.”

### AA-C2 — Do not frame cooldown as punishment

Cooldown copy should explain the reflective purpose and offer non-tarot alternatives without moralizing, diagnosing, or shaming the user.

### AA-C3 — Do not promise certainty after payment

Premium plans must not imply that a paid reading is more truthful, spiritually powerful, fate-revealing, or guaranteed.

## Technical architecture principles

### AA-T1 — Rate limit, cooldown, quota, and repetition detection are separate services

They must have separate policies, reason codes, telemetry, tests, and user-facing messages.

### AA-T2 — Privacy-first repetition detection

Before embeddings or raw prompt history are considered, evaluate:

- local or ephemeral normalization,
- keyed hashes of normalized user-owned text,
- short retention windows,
- topic labels selected by the user,
- explicit consent,
- deletion and appeal behavior.

No similarity system should silently create a long-lived sensitive-question archive.

### AA-T3 — Fail safely without creating lockout harm

Controls need clear handling for:

- shared IP addresses,
- clock drift,
- account recovery,
- concurrent requests,
- service restart,
- multi-instance deployment,
- false-positive repetition matches,
- legitimate materially changed questions.

## Monetization hypotheses

The following are hypotheses only and require validation.

| ID | Hypothesis | Ethical advantage | Primary risk | Evidence needed |
|---|---|---|---|---|
| M-001 | Low-frequency subscription with a small number of deep readings | Revenue is not tied to endless draws | Low perceived recurring value and high churn | Pricing interviews, willingness-to-pay test, retention cohort |
| M-002 | Paid reflection archive, export, or user-owned report formatting | Monetizes organization rather than prediction | Sensitive-data retention and privacy burden | Privacy design, export demand, deletion tests |
| M-003 | One-time threshold reflection package | Aligns payment with an intentional event rather than compulsion | Transactional anxiety monetization if copy is poorly designed | Message testing, refund policy, no-certainty review |
| M-004 | Premium non-tarot journaling and review tools | Diversifies value away from card frequency | Product drifts into pseudo-therapy or generic journaling | User research, positioning review, safety scope |
| M-005 | Gift or annual membership with capped usage | Predictable revenue without unlimited consumption | Unused-value dissatisfaction or pressure to consume quota | Usage study, expiry policy, rollover policy |

## Monetization red lines

The product must not monetize:

- unlimited or escalating repeated readings,
- removal of cooldowns,
- “better fate” or favorable-card rerolls,
- reassurance after an alarming output,
- access to crisis support,
- supposedly more accurate predictions,
- hidden third-party intentions,
- exact dates or guaranteed outcomes,
- fear-based urgency,
- user vulnerability or distress signals.

## Candidate MVP recommendation

This is a product recommendation, not an implementation claim:

1. Keep live readings intentionally limited.
2. Do not introduce a paid cooldown bypass.
3. Test a small capped plan only after live safety evaluation.
4. Keep daily engagement opt-in and non-streak-based.
5. Avoid raw prompt history until a privacy and deletion model is approved.
6. Validate whether users value reflection summaries, exports, and continuity more than reading volume.
7. Measure agency and certainty-seeking alongside conversion and retention.

## Required evaluation dimensions

Anti-addiction and monetization experiments should not be judged only by revenue or retention. At minimum measure:

- repeated-question rate,
- attempts to bypass cooldown,
- user-reported certainty-seeking,
- perceived pressure to return,
- agency preservation,
- understanding that readings are reflective rather than predictive,
- false-positive cooldown/repetition blocks,
- churn caused by ethical limits,
- support incidents,
- deletion and privacy requests.

## Candidate tests

These are test concepts only; exact repository paths must be verified before implementation.

1. In-memory limit returns the intended response after the configured threshold.
2. Shared-NAT users do not receive an unjustified permanent block.
3. Multi-instance deployment does not pretend to provide a durable cooldown.
4. Durable cooldown persists across restart and concurrent requests.
5. Quota increments atomically and resets on the correct boundary.
6. A materially rephrased identical question is detected without storing unnecessary raw text.
7. A genuinely changed question is not falsely blocked.
8. Cooldown copy does not shame or frighten the user.
9. Payment never bypasses safety or anti-addiction controls.
10. Premium copy does not promise greater truth, certainty, or fate accuracy.
11. Daily reflection works without streaks, urgency, or push-notification pressure.
12. User deletion removes retained anti-addiction and similarity data according to policy.

## Product Owner decisions required

1. Is threshold eligibility user-declared, rule-based, or a hybrid?
2. Is any question history retained? If so, for how long and for what precise purpose?
3. Are embeddings prohibited for repetition detection until privacy review?
4. Which ethical monetization hypothesis should be tested first?
5. What is the maximum reading cadence for free and paid plans?
6. Can unused paid readings roll over without encouraging consumption pressure?
7. Which agency and wellbeing metrics are release gates rather than analytics-only signals?

## Human review

**Reviewed by:**  
**Review date:**  
**Disposition:** Pending

## Governance state

- KnowledgeBundle promotion: prohibited at this stage
- Runtime modification: none
- Agent-skill update: not performed
- Methodology extraction resumed: no
- Monetization claim validation: not established
- Next permitted action: Product Owner review, repository verification, privacy review, and experiment design
