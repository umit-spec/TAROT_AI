# Decision Log (Architecture Decision Records)

## Purpose

Her önemli karar kaydedilir. "Neden böyle yapmıştık?" sorusunun cevabını korur.

Gelecek, bu kararlar yeniden değerlendirilebilir.

---

## ADR Template

```markdown
# ADR-001: [Decision Title]

**Date:** 2026-08-15
**Status:** Accepted | Rejected | Pending Review
**Authors:** [names]
**Reviewers:** Product Owner, Engineering Lead

## Context

Neden bu kararı almak zorunda kaldık?
(Market research, technical constraint, user feedback, etc.)

## Options Considered

### Option A: [Name]
**Pros:**
- Benefit 1
- Benefit 2

**Cons:**
- Downside 1
- Downside 2

**Effort:** 5 days

### Option B: [Name]
**Pros:**
- Benefit 1

**Cons:**
- Major downside

**Effort:** 2 days

### Option C: [Name]
**Pros:**
- ...

**Cons:**
- ...

**Effort:** 10 days

## Decision

**We chose Option A because:**
1. Reason 1 (strongest business case, time constraint, etc.)
2. Reason 2

## Consequences

**Positive:**
- We can now...
- This enables...

**Negative:**
- We won't be able to... until Aşama X
- Adds complexity in...

## Future Revisit

**This decision can be revisited when:**
- User feedback suggests Option B is better
- Technical debt accumulates beyond threshold
- Business requirements change (e.g., scale >10k users)

**Review date:** Aşama 8 (or sooner if triggered)

## Related Decisions

- ADR-002: Previous decision that led to this
- ADR-005: Future decision that depends on this

---
```

---

## Existing Decisions (ADR-001 to ADR-010)

### ADR-001: 22 Büyük Arkana (not 78 cards) for MVP

**Status:** Accepted

**Context:** Original request was "3 kart açılımı" but no card limit specified. Team proposed 78 cards (full deck). UX research showed that:
- 78-card grid too complex for MVP (would need drag-drop, hard on mobile)
- Learning curve for users too high
- More cards = longer AI generation, higher cost
- Market research: First tarot app users prefer simplicity

**Options Considered:**
1. **78 cards (full deck)** — Complete, but complexity
2. **22 Big Arcana only** — Focused, learnable, scalable
3. **22 + 22 Minor (Cups/Wands)** — Compromise, but still complex

**Decision:** Option 2 (22 Big Arcana)

**Consequences:**
- MVP launches faster
- User onboarding simpler
- Can scale to 78 after validating product fit
- Data model designed to support 78 from day 1

**Revisit:** If user feedback strongly requests minor arcana, can be added in Aşama 11+

---

### ADR-002: Reversed Cards Excluded from MVP

**Status:** Accepted

**Context:** Tarot traditionally has upright/reversed meanings (doubles the interpretation space). But:
- Adds complexity (users need to understand reversal concept)
- Doubles UI work (show card upright vs reversed)
- Doubles AI generation (2x interpretations per card)
- MVP goal is simplicity, not completeness

**Decision:** Upright only. Reversed excluded but data model ready for future.

**Revisit:** Post-MVP, if users ask for depth

---

### ADR-003: Next.js 16 (not 14, not custom backend)

**Status:** Accepted

**Context:** Originally proposed Next.js 14 (2-year-old). Temmuz 2026 standard is Next.js 16. Tech debt vs. benefit:
- 14 requires migration path later
- 16 = current standard, React 19 integration smoother
- No custom Express API needed for MVP scope
- Route Handlers + Server Actions sufficient

**Decision:** Next.js 16, Route Handlers, no separate backend

**Consequences:**
- Simpler deployment (1 vercel app)
- Faster onboarding for new devs
- Can add tRPC/separate API if scale warrants (post-MVP)

**Revisit:** If API traffic >100 RPS, consider backend separation

---

### ADR-004: 3-Layer Reading Engine (not monolithic AI call)

**Status:** Accepted

**Context:** Naive approach: send cards + context to Claude, get reading. Problems:
- AI can invent meanings (risk)
- Tone inconsistent between calls
- Hard to debug ("why did it say X?")
- Hard to fallback (API down = no reading)

**Decision:** 3 layers:
1. Deterministic (DB lookup, no AI)
2. Synthesis (patterns, no AI)
3. Language (Claude rewrite only)

**Consequences:**
- More controlled, verifiable output
- Can run deterministic-only if Claude down
- Easy to test each layer
- Tone consistent (system-level control)

**Revisit:** If Claude behaves unexpectedly, can audit via 3-layer logs

---

### ADR-005: Persona-Aware Readings (not one-size-fits-all)

**Status:** Accepted

**Context:** Early feedback: same readings felt generic to different users. Solution:
- Detect user type (first-time, regular, anxious, etc.)
- Adapt tone + depth for persona
- Data model: persona_type stored with reading

**Decision:** Persona engine integrated into intake

**Consequences:**
- Readings feel more personal
- Higher perceived value (premium opportunity)
- More complex AI prompting, but manageable

**Revisit:** Post-MVP, test if persona still predicts satisfaction

---

### ADR-006: Magic Link + Google Auth (not password)

**Status:** Accepted

**Context:** Passwordless auth reduces friction:
- No password reset complexity
- Simpler security (no bcrypt vulnerabilities)
- Lower user friction (1-click Google or email link)
- Reduces auth backend burden

**Decision:** Auth.js with magic link + Google OAuth, no password auth

**Consequences:**
- Faster signup
- Lower auth security surface
- Email required (can't bypass)
- Can add passwords later if needed

**Revisit:** If users complain about email dependency

---

### ADR-007: Cooldown + Metered Free Tier (not unlimited)

**Status:** Accepted

**Context:** Tarot app addiction risk (user keeps re-reading same question). Options:
1. Unlimited readings (user growth, but addiction risk)
2. Metered (2/week free, no same-topic 24h) + premium
3. Paid-only (high friction)

**Decision:** Metered free, controlled premium

**Consequences:**
- Ethical product (no addiction loop)
- Forces reflection (can't obsessively re-read)
- Clear premium value proposition

**Revisit:** If <20% free users convert to premium, reconsider model

---

### ADR-008: 100-User Test Before Full Launch

**Status:** Accepted

**Context:** Too many unknowns for blind launch:
- Tarot apps are niche (need to validate demand)
- Persona system untested (does tone matter?)
- AI quality subjective (need real feedback)
- Metrics targets educated guesses

**Decision:** Controlled 100-user MVP test (Aşama 10)

**Consequences:**
- Slower path to market (2-3 extra weeks)
- Better data for post-MVP decisions
- Reduced risk of public failure
- Can pivot quickly based on feedback

**Revisit:** After 100-user test, decide: scale, iterate, or sunset

---

### ADR-009: PostgreSQL + Drizzle (not MongoDB or SQLite)

**Status:** Accepted

**Context:** Database choice trade-offs:
- SQLite: Simple, but doesn't scale (file-based)
- MongoDB: Flexible, but wrong data model (relational)
- PostgreSQL: Proven, relational, scales, Drizzle is clean ORM

**Decision:** PostgreSQL + Drizzle ORM

**Consequences:**
- Must manage DB (Railway or Supabase)
- Slightly more setup than SQLite
- Better performance at scale
- Can handle complex queries (analytics)

**Revisit:** If <100 users, could use SQLite; but PostgreSQL ready from day 1

---

### ADR-010: Vercel Deployment (not self-hosted)

**Status:** Accepted

**Context:** Deployment options:
- Self-hosted: Full control, ops burden
- Vercel: Managed, fast, integrated Next.js
- AWS/GCP: Flexible, but more complex

**Decision:** Vercel for web, Railway for PostgreSQL

**Consequences:**
- Auto-scaling on traffic spikes
- GitHub integration (auto-deploy on merge)
- No DevOps hire needed
- Less flexible (Vercel-specific constraints)

**Revisit:** If costs balloon (Vercel expensive at scale), migrate to self-hosted

---

### ADR-011: Interpretation Knowledge Architecture (LLM as narration layer only)

**Status:** Accepted

**Context:** Sprint 2 begins Claude integration (Layer 3, ADR-004). Risk: if
the Reading Engine binds directly to Claude's SDK, and the eventual
interpretation knowledge model (card pair relations, position/persona/topic
rule matrices, sourced and curated content) is designed later, Sprint 2's
integration work becomes incompatible with it and has to be rewritten. The
full knowledge model (potentially hundreds of card-pair relations, a
NotebookLM-based research pipeline, sourced/citable content, a SQLite or JSON
build pipeline, curation + Red Team review) is real future work — but
building it now, before its shape is validated by a working product, is
premature. This ADR locks the *architecture* so Sprint 2 can proceed without
that model existing yet.

**Decision:** Interpretation knowledge is structured, versioned data, layered
as follows — all of it already exists in skeletal form as of Sprint 1
(`data/cards/*.json`) except where marked "not yet built":

1. **Card core character** — per-card base symbolic + psychological meaning,
   independent of context. *(Exists: `symbolicMeaning`, `psychologicalReflection`, `keywords`.)*
2. **Adjacent card influence** — how a card's reading is modulated by the
   cards drawn before/after it in the same spread. *(Not yet built — Sprint 1's
   Layer 2 only does keyword-overlap pattern detection, not directional
   pairwise influence. Schema, not data, is Sprint 2/3 scope at most.)*
3. **Spread position semantics** — meaning contributed by position (past/
   present/future today; extensible to 5-card and beyond). *(Exists: `positionMeanings`.)*
4. **Question domain (topic) context** — meaning contributed by the user's
   stated topic. *(Exists: `contextualMeanings`, currently relationship/
   career/general.)*
5. **Persona adaptation** — tone/depth variation across the 5 personas
   (`AŞAMA_2_PERSONA_WIREFRAME_PATHS.md`). Applied at the narration layer
   (step 7), never by rewriting the underlying structured meaning itself.
6. **Safety constraints** — `docs/02-ETHICAL_CONSTITUTION.md` red lines,
   enforced as a validation gate on whatever the narration layer produces
   (extends the `validate.ts` forbidden-phrase pattern from Sprint 1).
7. **LLM as narration-only layer** — Claude (or any model) receives the
   fully-resolved output of steps 1-6 and does exactly one job: render it as
   natural, persona-toned Turkish. It never originates a card meaning,
   pairing, or safety judgment. Enforced in code via an `InterpretationProvider`
   interface (`ClaudeProvider`, `MockProvider`, future providers all
   implement the same contract and receive the same structured input) —
   swapping the provider must never change what the reading *means*, only
   how it *reads*.

**Explicitly deferred (not Sprint 2, not this ADR's scope):**
- Generating the full card-pair relation matrix (previous/next-card
  influence data for all combinations)
- NotebookLM-based research pipeline for sourced interpretation content
- Citation/source structure for interpretations
- SQLite or JSON build pipeline for a larger interpretation knowledge base
- Curation workflow and Red Team review of that content

These become real work no earlier than Milestone 3 (Intelligence Layer, per
`MILESTONE_2_GAP_ANALYSIS_ROADMAP_v1.1.md`), once Milestone 2's working
product has validated which relations actually matter.

**Consequences:**
- Sprint 2's Claude adapter depends only on the `InterpretationProvider`
  contract and `DeterministicReading` shape (already defined,
  `src/types/reading.ts`) — not on any future knowledge-model internals.
- A `MockProvider` can satisfy the same contract for deterministic testing,
  with no network calls and no API key required.
- Adding real pairwise/persona/citation depth later means adding a new
  provider or enriching steps 1-6's data — the provider boundary doesn't move.

**Revisit:** Before Milestone 3 (Intelligence Layer) work begins, when the
pair-relation model and NotebookLM pipeline get designed for real.

---

## Future Decision Points

These decisions will likely be needed post-MVP:

- **ADR-012:** 56 Küçük Arkana expansion strategy (when?)
- **ADR-013:** Reversed cards inclusion (MVP+ or later?)
- **ADR-014:** Multi-language support (roadmap?)
- **ADR-015:** Other modules (Dream Analysis, Journaling — priority?)
- **ADR-016:** Real payment integration (post-MVP test?)
- **ADR-017:** Backend separation (if API load warrants?)
- **ADR-018:** AI model upgrade path (Claude → GPT-4.5 parity?)

---

## Adding New Decisions

When a major decision is made:

1. **Create ADR-0XX markdown file** in this log
2. **Follow template** (Context, Options, Decision, Consequences, Revisit)
3. **Get signoff** from Product Owner
4. **Link to related ADRs**
5. **Set revisit date** (not indefinite)
6. **Commit to git** (decision history is auditable)

Example:
```bash
# After deciding on something big:
git add docs/decisions/ADR-011-*.md
git commit -m "ADR-012: [Decision Title] - [reason in 1 line]"
```

---

## Current Status

**Total Decisions Recorded:** 11
**Pending Review:** 0
**Rejected (documented for learning):** 0

All Aşama 1 founding decisions plus ADR-011 (Sprint 2 knowledge architecture) are documented and signed off.

---

## Review Schedule

- **Weekly:** Product Owner reviews open decisions
- **Aşama boundaries:** Revisit decisions that have "Aşama X" revisit date
- **User feedback trigger:** If feedback suggests rethinking a decision, ADR opened for revision

