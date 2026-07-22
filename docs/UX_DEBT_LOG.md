# UX Debt Log

Same pattern as `docs/SECURITY_DEBT_LOG.md`, for UX/copy debt instead of
dependency risk: an entry closes when the actual UI work lands, not when
someone stops noticing the mismatch.

---

## UX-DEBT-001: Map legacy wireframe personas to session-scoped Intake personas

**Opened:** 2026-07-22
**Status:** Open, not blocking
**Review date:** Before any screen from `AŞAMA_2_WIREFRAME_SPEC.md` /
`AŞAMA_2_PERSONA_WIREFRAME_PATHS.md` is actually built (Sprint 3+)

### Context

`AŞAMA_2_PERSONA_WIREFRAME_PATHS.md` defines 5 UX archetypes for wireframe/
copy purposes: First-Time User, Regular Practitioner, Highly Anxious User,
Decision-Maker, Curious Skeptic - each with its own tone, word count, and
screen-copy variants.

The Intake Engine (this sprint) defines a different 5-value taxonomy,
deliberately: `reflection-seeking`, `decision-seeking`,
`emotionally-overwhelmed`, `curious-explorer`, `experienced-practitioner`
(`src/types/intake.ts`). This is not the same list, and not meant to be -
it's session-scoped context (this question, right now), not an enduring
user-type label the wireframe docs describe.

Backend code (`MockProvider`, and `ClaudeProvider` once it's live) now
speaks only the Intake Engine's vocabulary. The wireframe/copy documents
still speak the older one.

### Risk

If UI copy is built directly from `AŞAMA_2_PERSONA_WIREFRAME_PATHS.md`
without reconciling the two vocabularies first, the product will show
copy tuned for "Highly Anxious User" while the backend is reasoning about
`emotionally-overwhelmed` sessions - probably fine semantically, but
undocumented and untested as a mapping, which means it can silently drift
(e.g. someone edits one list and not the other) with nothing catching it.
Even if the backend is correct, an inconsistent product surface reads as
broken.

### What needs to happen

Before building any screen that varies copy by persona:
1. Write an explicit mapping table: wireframe archetype -> Intake persona
   (they're conceptually close but not 1:1 - e.g. it's unclear whether
   "Curious Skeptic" maps to `curious-explorer` or `reflection-seeking`).
2. Either update `AŞAMA_2_PERSONA_WIREFRAME_PATHS.md` to use the Intake
   taxonomy directly, or keep both and make the mapping a tested function,
   not a convention someone has to remember.
3. Add a test asserting every Intake `Persona` value maps to exactly one
   UX copy variant (and vice versa) - the same "no drift" guarantee
   `tools/assets/canonical_names.py` gives the card-naming layer.

### Mitigation status

Not started. Not blocking Sprint 2 (no persona-varying UI exists yet).
Blocking before Sprint 3's Card Selection/Shuffle UI or any screen that
renders persona-conditional copy.

### Review log

| Date | Reviewer | Result |
|---|---|---|
| 2026-07-22 | Validation Lead | Opened, per explicit instruction when the Intake Engine's persona taxonomy was introduced. |
