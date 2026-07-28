# Platform Terms Evidence Snapshots (V2-D004, CRG-1B)

Dated access records for the official OpenAI and Canva terms pages
governing the Full Tarot Deck V2 asset chain. Each file below is a
**short-quote-plus-URL-plus-access-date** record, not a full copy of the
official terms text (per CRG-1's explicit instruction: do not copy full
official terms text into the repository).

## Access method disclosure

This CRG-1 execution attempted a **direct fetch** of each official URL
(`WebFetch`, a tool that retrieves and renders live page content). All
three direct fetches to `openai.com/policies/*` and `canva.com/policies/*`
returned **HTTP 403 Forbidden** — these sites block this environment's
automated fetcher. As a fallback, a **web search tool** (`WebSearch`) was
used to retrieve indexed snippets and secondary sources that quote the
primary terms text verbatim (with citations), and the exact quoted
language was cross-checked against the pre-existing RC/FAZ9-era terms
summary in `docs/evidence/FULL_DECK_V2_PLATFORM_TERMS_REVIEW.md` for
consistency.

**This is a materially weaker evidentiary form than an actual
screenshot or saved HTML capture of the primary source page**, and is
recorded as such. It does not meet the "immutable snapshot" bar the
debt log recommends for full V2-D004 closure. V2-D004 remains PARTIAL.

## Files

- `openai-terms-of-use.md` — OpenAI Terms of Use / OpenAI output-ownership clause
- `canva-terms-of-use.md` — Canva Terms of Use / User Content license clause
- `canva-ip-policy.md` — Canva Intellectual Property Policy / Licensed Content distinction
