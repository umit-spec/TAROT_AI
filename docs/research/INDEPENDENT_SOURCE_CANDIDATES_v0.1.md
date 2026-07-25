# Independent Source Candidates — Research v0.1

**Generated:** 2026-07-24 · **Commit context:** `71759b3`+ · **Status:** RESEARCH / CANDIDATES ONLY — not registered in `data/knowledge-authoring/sources.json`, not lesson material, no ingestion. Methodology extraction remains HOLD until after G1.
**Purpose:** Give the project a vetted pool of **genuinely independent external sources** (distinct from the two related-edition Bill Store books, which count as ONE lineage) to satisfy the governance rule: *a principle needs ≥1 genuinely independent external source before it may enter the authoring lifecycle.*
**Legal note:** rights statuses below are from public research (July 2026) and are general, not a legal opinion. Public-domain status varies by jurisdiction and by *edition*; before any commercial use an IP lawyer should confirm the specific edition/scan. This document reproduces **no** third-party text — it catalogs and characterizes sources only.

---

## How these map to the project's governance

- The registry already holds two genuinely independent entries: `waite-pictorial-key-1910` (PD classic) and `pollack-seventy-eight-degrees-1980` (academic), plus `tarot-ai-original-synthesis-v1` (own synthesis) and `notebooklm-major-arcana-research-2026-07` (ai-assisted, never sole backing).
- Candidates below **expand** that independent pool. **Public-domain** works may be quoted briefly and cited; **copyrighted** works are reference-only (read for understanding, cite the fact, never ingest/quote at length).
- A Bill Store principle corroborated by any *one* of these independent sources satisfies the "≥1 independent source" bar — but the two Bill Store editions together never do (same lineage family).

---

## A. Public-domain primary/historical texts (safe to cite; brief quotation OK)

| Source | Author / year | Authoritative for | Rights (general) | Access |
|---|---|---|---|---|
| **The Pictorial Key to the Tarot** | A. E. Waite, 1911 (deck 1909) | RWS card meanings, upright + reversed, three-card and other spreads, "tarot as symbolic" framing | **Public domain** (Waite d. 1942; PD in US/UK) — *already registered* as `waite-pictorial-key-1910` | Internet Archive; Internet Sacred Text Archive |
| **The Tarot of the Bohemians** | Papus (Gérard Encausse), 1889/1892 (Eng. tr.) | Esoteric/structural tarot theory, Marseille + Wirth lineage, numerology/astrology correspondences | **Public domain** | Internet Archive; sacred-texts |
| **The Tarot / "Book T"** | S. L. MacGregor Mathers & Golden Dawn, 1888 | Golden Dawn interpretive system foundation (not RWS-keyed) | **Public domain** | Internet Archive |
| **The Oracle of the Tarot** | Paul Foster Case, 1933 | Card meanings + a divination method (BOTA lineage) | **Likely public domain (US, pre-1978, verify renewal)** | TarotWorks / Internet Archive |
| **Le Tarot des imagiers du Moyen Âge** | Oswald Wirth, 1927 | Major Arcana symbolism (Continental/Marseille tradition) | **PD status varies by jurisdiction — verify** | Internet Archive (French; English translations may be in copyright) |

**Value:** these are the *independent, citable backbone* for card meanings and spread methodology. Waite (already registered) and Papus together give two independent traditions (RWS vs. Continental) — useful for triangulating a principle that the Bill Store books present.

## B. Public-domain imagery (RWS 1909) — **staging/free-beta fallback only, NOT the production deck**

| Asset | Rights (general) | Governance fit |
|---|---|---|
| **Rider–Waite–Smith 1909 "Roses & Lilies" scans** (Wikimedia Commons, ~80 files; individual cards marked PD Mark 1.0) | Original 1909 images **public domain in US and UK**; **modern recolorings (e.g. US Games 1971) may carry separate rights**; a 2024 Copyright Claims Board case shows the ownership chain still has live ambiguity | **D3 conflict — do NOT use for the original production deck.** May serve only as a *documented public-domain staging/internal/free-beta fallback* per the asset gate, and only for the **original 1909** scans (not recolored versions). The project's S1 requirement is a **fully original commissioned deck**; the reference books' RWS plates are never extracted. |
| **CC0 RWS-style redraws** (e.g. community CC0 sets) | Released CC0 by their creators | Same caution: verify the actual CC0 grant; still not a substitute for the original commissioned deck. |

**Bottom line:** PD imagery de-risks *staging only*. It does not satisfy the production requirement, and it must be recorded in `data/assets/pilot-license-manifest.json` as `staging-fallback` (verified-public-domain) with evidence — never `production`.

## C. Scholarly / academic references (copyrighted — reference-only, no ingestion)

| Source | Author(s) / year | Authoritative for | Rights |
|---|---|---|---|
| **Seventy-Eight Degrees of Wisdom** | Rachel Pollack, 1980 | Psychological/symbolic reading of all 78 cards; reflective (non-fortune-telling) framing | Copyrighted — *already registered* as `pollack-seventy-eight-degrees-1980` |
| **The Game of Tarot** | Michael Dummett, 1980 | Definitive tarot *history* (origin as a card game; corrects occult myths) | Copyrighted |
| **A Wicked Pack of Cards: The Origins of the Occult Tarot** | Decker, Depaulis & Dummett, 1996 | Scholarly history of tarot divination's origins | Copyrighted |
| **A History of the Occult Tarot** | Decker & Dummett, 2002 | How tarot became a divination tool; occult systems compared | Copyrighted |
| **A Cultural History of Tarot: From Entertainment to Esotericism** | Helen Farley, 2009 | Academic cultural history/symbolism | Copyrighted |
| **The Tarot: History, Symbolism, and Divination** | Robert M. Place, 2005 | Bridges scholarship + practice; symbolism + method | Copyrighted |

**Value:** independent grounding for **history and symbolism claims** and for the "reflection, not prophecy" positioning. Read for understanding; cite facts; never ingest or long-quote.

## D. Contemporary practitioner references (copyrighted — reference-only)

| Source | Author / year | Authoritative for | Rights |
|---|---|---|---|
| **The Complete Guide to the Tarot** | Eden Gray, 1970 | Popularized the simple Past/Present/Future 3-card method + accessible meanings | Copyrighted |
| **Tarot for Your Self** | Mary K. Greer, 1984 | Reflective, self-inquiry-oriented reading practice (aligns with Insight Engine framing) | Copyrighted |
| **Tarot Wisdom / The Complete Book of Tarot Reversals** | Mary K. Greer | Reversals + reflective method (out of MVP scope for reversals, useful post-MVP) | Copyrighted |

## E. Reputable digital archives (for locating PD works only)

- **Internet Archive** (archive.org) — scans of Waite, Papus, Mathers, Case.
- **Internet Sacred Text Archive** (sacred-texts.com) — Waite PKT full text, RWS copyright FAQ.
- **Wikimedia Commons** — original 1909 RWS scans (verify per-file license).
- **Project Gutenberg** — for any PD tarot texts it hosts.

---

## Copyright nuance that matters here (verified July 2026)

- The **original 1909/1911 RWS images and Waite's text are public domain in the US and UK** (Waite d. 1942 → +70; UK term for the artwork has also lapsed). **US Games Systems' 1971 recoloring** is a distinct, slightly-variant edition with its own rights claim — use the **original** scans, not the 1971 recolor.
- There is **live legal ambiguity** (a 2024 Copyright Claims Board matter) over parts of the ownership chain — a reason to keep the project's stance: *original commissioned art for production; PD only as documented staging fallback; lawyer review before commercial launch.*
- None of this changes the **Bill Store books' status**: fully copyrighted, no ingestion, lineage-only.

## Recommended next steps (all optional, docs/data-only, still pre-G1)

1. **Register 1–2 more independent PD sources** in `data/knowledge-authoring/sources.json` (candidates: `papus-tarot-of-the-bohemians-1892`, `mathers-book-t-1888`) so the post-G1 lifecycle has ≥2 independent traditions to triangulate — *on your approval*.
2. **Add academic history sources** (Dummett 1980; Decker/Depaulis/Dummett 1996) as `academic`, reference-only, for history/symbolism corroboration.
3. If a **PD staging fallback deck** is ever wanted, record the specific 1909 RWS scans in the asset manifest as `staging-fallback` + `verified-public-domain` with per-file evidence — never `production`.

**No source above is registered or turned into lesson material by this document.** It is a vetted candidate pool for the Product Owner to select from, consistent with the HOLD-until-G1 governance.

---

## Sources consulted (research provenance)

- The Pictorial Key to the Tarot — Internet Archive; Internet Sacred Text Archive; Wikipedia.
- RWS copyright status — Plagiarism Today (2024 CCB case), Wikipedia (Pamela Colman Smith), Rideau River Tarot, sacred-texts RWS Copyright FAQ, The Wild Hunt (2021).
- Public-domain tarot book lists — benebell wen "Public Domain Tarot Books"; Internet Archive.
- Academic works — Amazon/Google Books/Goodreads listings for Dummett, Decker, Depaulis, Farley, Place; Wikipedia (Michael Dummett).
- Wikimedia Commons — "Category:Rider-Waite tarot deck" (1909 Roses & Lilies), individual card files (PD Mark 1.0).
