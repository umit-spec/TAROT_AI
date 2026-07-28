# Platform Terms Review — Full Tarot Deck V2

**Reviewed:** 2026-07-28  
**Scope:** OpenAI-generated card outputs uploaded/stored as Canva User Content  
**Purpose:** Evidence for asset-governance classification; not jurisdiction-specific legal advice

## OpenAI

Official sources reviewed:

- `https://openai.com/policies/terms-of-use/`
- `https://openai.com/policies/eu-terms-of-use/` or locale-equivalent EU terms
- `https://openai.com/policies/service-terms/`

Recorded conclusions:

1. As between the user and OpenAI, and to the extent permitted by applicable law, the user owns Output; OpenAI assigns any right, title and interest it may have in Output.
2. The user remains responsible for Input and for lawful, appropriate use of Output.
3. AI outputs may not be unique and another user may receive similar output.
4. Platform allocation of Output rights does not itself guarantee copyright eligibility, non-infringement, trademark clearance or exclusivity in every jurisdiction.
5. Commercial deployment therefore remains subject to human review and applicable law.

## Canva

Official sources reviewed:

- `https://www.canva.com/policies/terms-of-use/`
- `https://www.canva.com/policies/intellectual-property-policy/`

Recorded conclusions:

1. As between the user and Canva, the user retains ownership of uploaded User Content.
2. The user grants Canva the service licence needed to host, store, display and provide the service.
3. Canva Licensed Content carries separate licence terms and can affect downstream use of a design.
4. The safest integration path is to use the generated cards as uploaded User Content without adding Canva library illustrations, stock elements or templates to the final card artwork.
5. A final Canva element-level audit is required before FAZ 9 integration.

## Internal governance result

The full deck is classified internally as:

`IE-AI-OUTPUT-PROPRIETARY-1.0`

This supports intended Insight Engine product use, subject to the gates in:

- `docs/ASSET_LICENSE_MANIFEST.md`
- `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`

It does not grant a public licence and does not represent that the images are public domain, CC0, guaranteed exclusive or automatically protected by copyright in every jurisdiction.

## Recheck trigger

Repeat this review if:

- OpenAI or Canva materially changes relevant terms;
- the generation platform changes;
- Canva Licensed Content is added;
- the project enters paid beta/public launch;
- a third-party similarity or IP concern is raised.

## CRG-1B update (2026-07-28) — dated evidence attempt, V2-D004 remains PARTIAL

A commercial-release gate review (CRG-1) pass attempted to strengthen
this record with dated, snapshot-style evidence per
`docs/evidence/platform-terms/`. Direct fetch of all three official URLs
returned HTTP 403 (bot-blocked in this execution environment); the
fallback evidence (search-indexed snippets and secondary-source quotes,
cross-checked for consistency with the conclusions above) is recorded in
that folder with full disclosure of this limitation.

Two open sub-questions surfaced during this pass that the original
review did not carry, both requiring the product owner's own account
records to resolve (not further external search):

1. Whether generation occurred under OpenAI's **consumer ChatGPT** Terms
   of Use specifically (vs. Business Terms), and on what date relative to
   the current terms revision — see `platform-terms/openai-terms-of-use.md`.
2. Whether the Canva design(s) holding the 79 card images were ever
   **shared** (triggering Canva's separate perpetual-license clause for
   shared Designs) rather than kept private — see
   `platform-terms/canva-terms-of-use.md`.

**V2-D004 status: remains PARTIAL.** This pass added evidence structure
and surfaced two new factual questions; it did not close the gate. A
successful primary-source re-fetch (manual browser visit + dated
screenshot) or legal counsel's own terms review is still recommended
before commercial release, per `docs/legal/COMMERCIAL_RELEASE_LEGAL_REVIEW_PACKET_TR.md`.
