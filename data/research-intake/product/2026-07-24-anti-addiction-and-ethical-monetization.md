# Product Research Intake — Anti-Addiction and Ethical Monetization

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Source type:** NotebookLM synthesis of repository materials and external research  
**Authority level:** Product research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Purpose

This record separates anti-abuse controls, anti-addiction controls, cadence hypotheses, and monetization hypotheses for Insight Engine. It does not authorize pricing, persistence work, clinical positioning, production analytics, or payment integration.

## Required corrections to the source synthesis

1. **In-memory rate limiting is not anti-addiction enforcement.** It is a per-instance abuse-prevention control. It must not be represented as durable cooldown, account quota, or same-question repetition prevention.
2. **Implemented-and-tested claims require exact test evidence.** The existence of `src/server/observability/rate-limit.ts` is verified, but the claimed `observability-s3.test.ts` path and exact 429 coverage must be independently confirmed before using `IMPLEMENTED_AND_TESTED`.
3. **The claim that the threshold reading is validated by “201 tests” is not accepted here.** Exact current-branch gate output and relevant test paths are required. A total test count does not prove that threshold-reading quality, safety, or user value is validated.
4. **ADR-014 cadence is a product hypothesis.** Daily and weekly features must not be described as approved user behavior or proven retention mechanisms.
5. **Same-question detection does not automatically require embeddings.** Embeddings may introduce privacy, retention, cost, and false-positive risks. Lower-risk alternatives must be evaluated first.
6. **“Psychological pattern,” “mental-health tracking,” “clinically approved,” and similar positioning are prohibited without a separate regulated clinical product strategy.** Insight Engine is not therapy, diagnosis, mental-health monitoring, or a clinical tool.
7. **Independent scoring is not clinical validation.** A human evaluator or `scoredBy` field may support product-quality review but cannot justify “clinical/ethical quality” claims.
8. **Paying for more readings must never weaken cooldown or safety limits.** Premium access cannot sell exemption from anti-addiction controls.
9. NotebookLM citation markers are not repository evidence. Exact ADRs, file paths, tests, external source identifiers, and current branch evidence are required before promotion.

## Control separation

| Control | Primary purpose | Verified / proposed status | Key governance note | Candidate MVP classification |
|---|---|---|---|---|
| In-memory rate limit | Protect endpoint from bursts and basic abuse | `IMPLEMENTED_NOT_TEST_VERIFIED` | Per-instance and IP-oriented; not durable user behavior control | Keep as infrastructure control |
| Durable cooldown | Prevent rapid repeat readings by the same user | `ACCEPTED_NOT_IMPLEMENTED` | Requires durable identity/state and carefully defined exceptions | Release-gate candidate before open beta |
| Account quota | Enforce plan usage limits | `ACCEPTED_NOT_IMPLEMENTED` | Commercial control; must not become the only anti-addiction control | Post-persistence product work |
| Same-question repetition detection | Reduce certainty-seeking loops | `PRODUCT_HYPOTHESIS` | Requires privacy-preserving similarity design and false-positive review | Research and prototype first |
| Daily reflection | Create low-intensity non-divination engagement | `PRODUCT_HYPOTHESIS` | Could still become a compulsive engagement loop | Exclude from MVP until validated |
| Weekly reflection | Offer periodic user-led review | `PRODUCT_HYPOTHESIS` | Must not infer psychological patterns as facts | Exclude from MVP until validated |
| Threshold reading | Provide a low-frequency, deeper reflection flow | `IMPLEMENTED_NOT_TEST_VERIFIED` | Code existence is not proof of user value or safety under live models | Core prototype flow |

## Detailed governed analysis

### AA-001 — In-memory rate limit

**Purpose:** infrastructure abuse prevention.

**Known limitation:** per-instance state can reset and may differ across deployments. IP-based identity can block shared networks and can be bypassed.

**Must not be claimed as:**

- durable cooldown,
- account-level quota,
- same-question protection,
- proven anti-addiction enforcement.

**Evidence required before test status upgrade:** exact rate-limit test path, 429 behavior, reset behavior, disabled-test-mode behavior, and production-enablement evidence.

### AA-002 — Durable cooldown

A durable cooldown should prevent rapid repeat use while allowing legitimate exceptions such as a materially different topic or new verified information.

Candidate data requirements:

- stable user or privacy-preserving session identity,
- last eligible reading time,
- reading topic/category,
- cooldown reason,
- override/audit event if human support exists.

Risks:

- anonymous bypass,
- shared-device confusion,
- blocking legitimate different-topic reflection,
- creating frustration without transparent explanation.

### AA-003 — Account quota

Quota is a commercial entitlement control, not a safety substitute. A paid plan must not remove hard safety rules, crisis gating, or reasonable cooldowns.

Candidate principle:

> Premium may increase depth, export, history, or support features; it must not sell unlimited certainty-seeking.

### AA-004 — Same-question repetition detection

This is not yet a confirmed implementation requirement.

Before embeddings, compare lower-risk approaches:

1. user-confirmed topic label,
2. normalized keyword/topic fingerprint,
3. local or short-retention semantic classification,
4. optional user-visible “Is this substantially the same question?” confirmation.

Any design must specify:

- retention period,
- whether raw questions are stored,
- whether embeddings are reversible or linkable,
- false-positive appeal behavior,
- deletion behavior,
- bypass expectations.

### AA-005 — Daily engagement

Daily engagement is not inherently ethical merely because it avoids tarot draws. Notifications, streaks, badges, urgency, and loss-framing can still create dependency.

Prohibited candidate mechanics:

- streak loss,
- countdown pressure,
- “your insight is waiting” urgency,
- repeated push notifications,
- emotional-state scoring presented as fact.

### AA-006 — Weekly reflection

A weekly summary may support reflection only when it is user-led and evidence-bounded. It must not claim to detect hidden psychological patterns or mental-health trends.

Safer framing:

> “Bu hafta kaydettiğiniz notlarda tekrar eden bazı başlıklar olabilir. Hangisinin sizin için anlamlı olduğunu siz değerlendirebilirsiniz.”

### AA-007 — Threshold reading

Threshold is a positioning hypothesis and current product-flow candidate, not a verified behavioral segment.

Open questions:

- What qualifies as a threshold?
- Is self-declaration sufficient?
- Does threshold framing create artificial drama?
- Does low frequency improve value or simply reduce retention?
- Can users receive value without escalating emotional stakes?

## Ethical monetization principles

### EM-001 — Do not monetize safety bypass

Never sell:

- cooldown removal,
- unlimited same-question readings,
- extra clarifier cards to chase certainty,
- crisis-path access to tarot narration,
- stronger certainty language,
- guaranteed outcomes.

### EM-002 — Charge for durable utility, not dependency

Candidate monetizable value:

- private history with clear retention controls,
- user-authored journals and tags,
- exports,
- structured reflection summaries,
- accessibility features,
- visual personalization,
- longer but still bounded reflective reports,
- optional human-reviewed product-quality feedback where accurately described.

### EM-003 — Keep non-clinical positioning

Do not market the product as:

- therapy,
- mental-health tracking,
- clinical reflection,
- psychologist-approved diagnosis,
- treatment support,
- professional coaching unless a separate qualified human service exists.

Safer positioning:

> “Kişisel düşünme ve anlamlandırma için yapılandırılmış bir dijital araç.”

### EM-004 — Subscription hypothesis

A subscription may be tested only if value does not depend on frequent readings. Candidate subscription value should come from continuity features rather than reading volume.

Potential model:

- limited threshold readings,
- journal/history tools,
- weekly user-led review,
- exports,
- privacy controls.

This remains a product hypothesis and requires willingness-to-pay research.

### EM-005 — Transactional hypothesis

Pay-per-report may fit low-frequency usage, but must not inflate life events into artificial “thresholds.” Pricing must be transparent and must not imply expert, clinical, legal, or financial approval.

## Candidate MVP recommendation

### Keep now

- deterministic bounded reading flow,
- in-memory abuse protection,
- clear non-authority language,
- no repeated-reading encouragement,
- crisis short-circuit,
- measurement plan for repeat-use behavior.

### Build only after gate approval

- durable cooldown,
- account-level entitlement,
- privacy-preserving repetition detection,
- persistence-backed history,
- payment integration.

### Keep out of MVP

- daily streak mechanics,
- unlimited premium readings,
- mental-health tracking,
- clinical positioning,
- embedding-based question memory without privacy review,
- monetized safety overrides.

## Candidate product metrics

These metrics are proposals only:

- repeat same-topic attempt rate within 24 hours,
- percentage of users accepting cooldown without retry attempts,
- user-reported agency after a reading,
- percentage of sessions ending in a real-world next step or reflection note,
- certainty-seeking language rate,
- average readings per active user without reward optimization,
- retention driven by non-reading utility,
- false-positive rate for repetition detection.

Do not optimize for maximum readings per user.

## Candidate evaluation cases

1. Premium user requests cooldown removal.
2. User paraphrases the same question five minutes later.
3. Two users share an IP address.
4. User asks a materially different topic during cooldown.
5. Daily notification uses urgency or streak-loss framing.
6. Weekly summary claims a psychological pattern as fact.
7. Product copy claims independent scoring equals clinical approval.
8. Pay-per-report copy implies guaranteed life guidance.

These are candidate concepts only, not locked evaluation records.

## Product Owner decisions required

1. Is durable cooldown required before controlled beta or only before public launch?
2. What minimum interval should be tested, and should it vary by reading type?
3. Should anonymous users be allowed threshold readings?
4. Should raw questions be retained at all for repetition detection?
5. Is subscription, transaction, or hybrid pricing the first research hypothesis?
6. Which non-reading utility is strong enough to justify recurring payment?

## Human review

**Reviewed by:**  
**Review date:**  
**Disposition:** Pending

## Governance state

- KnowledgeBundle promotion: prohibited
- Runtime modification: none
- S4/persistence work started: no
- Pricing approved: no
- Clinical positioning approved: no
- Methodology extraction resumed: no
- Next permitted action: Product Owner review and evidence verification
