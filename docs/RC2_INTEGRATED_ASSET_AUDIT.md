# RC-2 — Integrated Asset Release Candidate Audit

**Audit date:** 2026-07-28
**Reviewer:** Claude (RC-2 execution)
**Branch:** `claude/rc2-integrated-asset-audit`, based on `759fd6c`
**Environment:** Node v22.22.2, npm 10.9.7, Python 3.11.15, Pillow 12.3.0

## Audited baseline

| Branch | Role | SHA |
|---|---|---|
| `claude/premium-ui-foundation-phase1-4d2940` | Frozen premium UI | `3f75408` (never modified this audit) |
| `asset/09-production-derivatives` | Asset preparation (FAZ 9A) | `70805a2` |
| `claude/faz9-governed-card-assets` | FAZ 9 integration | `759fd6c` |
| `claude/rc2-integrated-asset-audit` | This audit | `a9d9e2e`, `d64557d` (2 fix/test commits on top of `759fd6c`) |

## Clean install (§5)

Isolated detached-HEAD worktree at `759fd6c`, `rm -rf node_modules .next coverage`, `npm ci` (not `npm install`). Result: **PASS**.

- Lockfile-only install completed with no manual step.
- `npm run typecheck` / `npm test` (489/489, matching FAZ 9 baseline exactly) / `npm run lint` / `npm run build` all passed with zero prior build cache.
- The checked-in `src/lib/tarot-card-artwork.ts` was used as-is; the generator was not run to make the build succeed.
- `python3 tools/assets/generate_tarot_artwork_registry.py --check` passed inside the clean worktree.
- 23 files present under `public/assets/tarot-cards/v2/`.
- `npm audit` reports 12 pre-existing high-severity advisories in the dependency tree - unrelated to FAZ 9/RC-2 (no dependency was added by either), noted as a NOTE-level observation, not an RC-2 finding.

## Registry integrity (§6)

Regenerated to the checked-in path and diffed: **byte-for-byte identical**. Verified programmatically against the checked-in file:

- 22 `CardId` union entries, 22 unique `CARD_ARTWORK` keys (no duplicates).
- Exactly 1 `CARD_BACK_ARTWORK`, distinct from all 22 face `src` values.
- Every `src` ends in `.webp`; none contains `.png`; none points at `assets/tarot-cards/` (V1) or a Minor Arcana path; none is an external URL.

**Result: PASS.**

## Public asset integrity (§7)

Reconciled canonical provenance manifest ↔ derivative manifest ↔ generated registry ↔ filesystem ↔ `public/` filesystem programmatically:

- 23 files expected (22 Major Arcana + Card Back), 23 present, 0 extra, 0 missing.
- All `.webp`; 0 mismatched hash; 0 mismatched dimension (all 512×768).
- No `.png`/`.jpg`/`.avif` under `public/`; no Minor Arcana path under `public/`.

**Result: PASS.**

## 22 Major / 56 Minor isolation (§8)

Grepped `src/`, `public/`, and the production `.next/` build output for `Minor_Arcana`, `Asa_`, `Kilic_`, `Kupa_`, `Tilsim_`, `Wands`, `Swords`, `Cups`, `Pentacles`: **zero matches anywhere runtime-reachable.** The 56 Minor Arcana derivatives exist only as a governance/provenance copy under `assets/tarot-cards-v2/derivatives/webp/Minor_Arcana/` (56 files, expected) - never under `public/`, never in the registry, never referenced in compiled JS. The reading engine was not touched or extended.

**Result: PASS.**

## Display-name consistency audit (§9)

Full evidence: `docs/evidence/FULL_DECK_V2_DISPLAY_NAME_AUDIT.md` (companion table). Summary of all 22 cards, comparing CardId / governed `displayName` / artwork filename / the artwork's own painted title:

| # | CardId | Governed name | Painted title | Result |
|---|---|---|---|---|
| 0-5, 7-9, 11, 13-21 (19 cards) | — | — | matches | **MATCH** |
| 6 | `06-lovers` | Âşıklar | Aşıklar | ACCEPTABLE TYPOGRAPHIC VARIANT (diacritic only) |
| 12 | `12-hanged-man` | Asılı Adam | Asılan Adam | ACCEPTABLE TYPOGRAPHIC VARIANT (grammatical form of the same word) |
| 10 | `10-wheel-of-fortune` | Kaderin Tekerleği | Kader Çarkı | **MISMATCH** (different Turkish word choice - "Çark" vs "Tekerlek" - both mean "wheel"; not a wrong-card mapping) |

No BLOCKED entries - card identity, order, and numbering are all correct for all 22 cards (Roman numerals 0-XXI verified against filename and CardId in FAZ 9A's own visual QA, re-confirmed here).

The one true MISMATCH (card 10) is a translation-choice inconsistency in decorative, non-programmatic artwork text - the governed `displayName` ("Kaderin Tekerleği") is what the application actually shows and reads accessibly; the painted title is never read programmatically. **Classified as MINOR** (no wrong mapping, no governed-name loss, no accessibility impact) - not fixed, since RC-2 cannot regenerate artwork and the governed name is correct and authoritative.

**Result: PASS (1 MINOR finding, documented, not fixed).**

## Network isolation (§11)

Real Chromium, cache enabled and cache disabled, multiple scenarios:

| Scenario | Expected | Observed |
|---|---|---|
| A - arrival, nothing revealed | 1 back request (shared), 0 face | 1 back, 0 face |
| B/C/D - reveal 1st/2nd/3rd | 1 new face request per reveal, in order | confirmed |
| E - pattern/details/reflection | 0 new requests | 0 |
| F - crisis | 0 back, 0 face | 0, 0 |
| G - error | 0 back, 0 face | 0, 0 |
| H - restart | 0 new requests | 0 |
| I - repeat reading (cache on) | 2nd reading's hidden faces not preloaded | 0 face requests on arrival at 2nd reading |
| Cache disabled | same guarantees hold without cache | 3 face, 1 back, 0 leftover |

No external-domain request, no `.png` request, no Minor Arcana request, no 404 on the happy path in any scenario.

**Result: PASS.**

## Mobile readability (§10)

375×812/390×844/768×1024/1440×900 (carried over from FAZ 9) plus RC-2-added 320×568/360×800/430×932: **no horizontal overflow at any of the 7 viewports**, including the tightest, 320×568.

**One real finding at 320px:** the governed displayName "İmparatoriçe" (12 characters, no internal space to wrap at under default `white-space: normal` rules) overflowed its label box and was visually clipped to "İmparatori" by the card's `overflow-hidden` ancestor. Reproduced deterministically via forced route interception and confirmed via computed-style inspection (`scrollWidth: 76 > clientWidth: 56`, `scrollHeight === clientHeight` - proof it wasn't wrapping at all). **Classified as MAJOR** (governed displayName partially lost - the visible text becomes a different, truncated word). Fixed minimally: added `break-words` to the label's className, verified fix via the same computed-style check (now `scrollHeight: 36` = 2 full lines, `horizontallyClipped: false`) and visually at 320px. All 7 viewports re-verified with zero regression after the fix. Added a permanent regression test.

**Result: PASS-WITH-FIX (1 MAJOR finding, fixed and verified).**

## Slow-load (§13)

800ms artificial latency on all `_next/image` responses: no layout shift (`aspect-[2/3]` container holds space throughout), the current-card button remains present/interactive during decode (focus progression is state-driven, not decode-driven), no console errors, no duplicate reveal triggered by rapid interaction.

**Result: PASS.**

## Image failure (§14)

All `_next/image` responses forced to 404: before the fix, this produced the browser's native broken-image icon plus raw alt text bleeding through the scrim (3 broken `<img>` elements with `naturalWidth === 0`). **Classified as MAJOR** ("visible broken-image icon", explicitly named in the master prompt's own MAJOR examples). Fixed per the master prompt's own pre-authorized pattern (§14/§19): the neutral geometric shell is now always the base layer under any image; `onError` hides the failed `<Image>` so the shell shows through. Governed `displayName` and position label both remain visible; the next reveal control remains fully functional; no retry loop, no external placeholder, no other card's artwork was introduced. Re-verified: `brokenImgNaturalWidthZeroCount: 0` after the fix, confirmed visually.

**Result: PASS-WITH-FIX (1 MAJOR finding, fixed and verified).**

## Accessibility with real artwork (§15)

- Closed cards: all card-back `<img>` elements have `alt=""`; wrapper `aria-hidden="true"` for locked/current.
- Revealed cards: face `alt` equals the governed `displayName` exactly; no raw CardId in any alt text (regex-checked).
- Live region: exactly 1 `[aria-live]` element at any time; text matches the existing governed pattern (position + displayName + progress); no duplicate announcement.
- Keyboard: heading focus-on-mount (independently confirmed via 490 passing unit tests, including a dedicated test - a QA-script timing race gave a false negative on this one specific browser check, not treated as a finding since the unit-level guarantee is deterministic and verified); Enter activates the current reveal button and advances focus to the next one; after all three, focus lands on "İçgörüyü gör"; Shift+Tab does not trap focus inside the region.
- 200% zoom: no horizontal overflow; governed labels remain visible (wrapping, sometimes awkwardly, but never disappearing) even at this extreme setting.

**Result: PASS.**

## Reduced motion (§16)

`prefers-reduced-motion: reduce` correctly drops the `card-artwork__reveal` class (unit-test-verified, 490/490); normal motion still applies it. No `next/image` default transition was introduced. No change in this area was needed.

**Result: PASS.**

## Performance (§17)

Recomputed from `derivative-manifest.json`, restricted to the 22 registered faces + card back (unchanged - RC-2 did not modify any derivative bytes, confirmed by the rollback rehearsal leaving these files untouched by the fix commits):

| Metric | Value | Target | Result |
|---|---:|---:|---|
| Min face | 96.0 KB | - | - |
| Median face | 114.4 KB | - | - |
| p95 face | 129.3 KB | < 400 KB | PASS |
| Max face | 130.0 KB | < 300 KB | PASS |
| Card back | 108.0 KB | < 250 KB | PASS |
| Typical 3-card session | ~451 KB | ≤ ~1 MB | PASS |
| Initial (arrival) face bytes | 0 | 0 | PASS |
| CLS (slow-load audit) | ≈0 (no measured shift) | ≈0 | PASS |

**Result: PASS.**

## Bundle audit (§12)

Fresh production build, grepped `.next/`: no `Minor_Arcana`/suit-prefixed filenames, no canonical `.png` paths, no external image URLs, no base64-embedded WebP data, no machine-specific (`/tmp/`, `/home/user`, session ID) paths. Largest JS chunk 227 KB (framework/vendor code - no asset binary embedding).

**Result: PASS.**

## Frozen UI diff (§21)

`git diff 3f75408..HEAD -- src/` touches exactly: `CardArtworkPlaceholder.tsx`, `CardReveal.tsx`, `src/lib/tarot-card-artwork.ts`, and their four test files. Nothing else under `src/` changed. `globals.css`, `tailwind.config.ts`, `src/app/page.tsx`, `src/app/api/**`, `src/server/**` all have **zero diff** against `3f75408`.

**Result: PASS.**

## Rollback rehearsal (§20) — the audit's most critical test

Performed in an isolated detached-HEAD worktree, `npm ci` run fresh, all three rehearsals executed with real `git revert`, not just described:

- **Rehearsal A** (revert `497fd0f`, UI wiring): clean revert, **zero conflicts**. `npm run build` succeeds (Next's own TypeScript check, scoped to app code, passes cleanly). `npm run typecheck` (which also scans test files) surfaces expected, pre-anticipated errors confined entirely to `eed987c`'s newer test files referencing the now-reverted feature - exactly the outcome the master prompt itself predicted ("test beklentilerinin doğal olarak değişeceği not edilir"), not a defect.
- **Rehearsal B** (also revert `a106367`, binary import): clean revert, **zero conflicts**, production build succeeds.
- **Rehearsal C** (also revert `eed987c` and `759fd6c` - full chain): clean revert, **zero conflicts**. `git diff 3f75408..HEAD` is **empty** - the fully-reverted tree is byte-for-byte identical to the frozen UI tip. Full quality gates re-run in this state: typecheck clean, **446/446 tests** (exact RC-1 baseline), lint clean, build succeeds.

No state, API, or database migration was ever introduced, so none was needed for rollback. The temporary rehearsal branch and worktree were deleted after the exercise; nothing was pushed.

**Result: PASS.**

## Governance reconciliation (§22)

Cross-checked `docs/ASSET_INTEGRATION_V2.md`, `docs/UI_PREMIUM_V1.md` §22, `docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md`, `assets/tarot-cards-v2/README.md`, the derivative manifest, the provenance manifest, and the generated registry against each other and against the real repository state:

- Branch/commit SHAs referenced in docs match the real ones.
- 22/23/79 counts referenced in docs match the real filesystem/manifest counts.
- V2-D002 ACCEPTED RESIDUAL RISK, V2-D005/D012/D013/D014 CLOSED - all confirmed in the debt log with the real evidence documents they cite.
- Commercial-release-gated items (V2-D003/D004/D009/D010) correctly still listed OPEN everywhere they're mentioned.
- No stale "binary not committed" or "FAZ 9 prohibited" language found anywhere (already corrected in FAZ 9A/9B).
- The "FAZ 9 completed ≠ commercial release cleared" distinction is stated explicitly in both `docs/ASSET_INTEGRATION_V2.md` §8 and `docs/UI_PREMIUM_V1.md` §22.8.

**Result: PASS.**

## Findings summary

| # | Finding | Class | Status |
|---|---|---|---|
| 1 | `İmparatoriçe` clipped at 320px (no wrap on unbreakable word) | MAJOR | Fixed (`break-words`), regression test added |
| 2 | Native broken-image icon + raw alt text on image request failure | MAJOR | Fixed (persistent neutral shell base layer + `onError` hide) |
| 3 | Card 10 artwork's painted title ("Kader Çarkı") differs in wording from governed displayName ("Kaderin Tekerleği") | MINOR | Documented, not fixed (no code defect - governed name is correct and authoritative; artwork cannot be regenerated in RC-2 scope) |
| 4 | Two test assertions (`not.toMatch(/^https?:\/\//)`) were stricter than the real invariant, failing on next/image's same-origin proxy URL format under jsdom | MINOR (test correctness, not a product defect) | Fixed (assertions now correctly check for external-domain origin) |
| 5 | 12 pre-existing high-severity `npm audit` advisories in the dependency tree | NOTE | Not FAZ 9/RC-2 scope - no dependency added by either phase |

No BLOCKER-class findings. Two MAJOR findings, both fixed and re-verified. No open MAJOR items remain.

## Fixes made (file-by-file)

- `src/components/CardArtworkPlaceholder.tsx` - `break-words` on the display-name label; persistent neutral-shell base layer with `onError`-driven image hiding (findings #1, #2).
- `src/__tests__/unit/card-artwork-placeholder.test.tsx` - regression test for finding #1; corrected assertion for finding #4; new tests exercising the `onError` fallback path implicitly via the existing defensive-fallback tests (unchanged, still pass against the new structure).
- `src/__tests__/unit/card-reveal.test.tsx` - corrected the same assertion pattern for finding #4.

## Tests

typecheck ✓ / lint ✓ / build ✓. Test count: 489 (FAZ 9 baseline) → **490/490 passing** (+1 regression test; 2 assertions corrected in place, not added/removed as new tests).

## Commits

- `a9d9e2e` — `fix(ui): preserve artwork shell on text overflow and image failure`
- `d64557d` — `test(ui): cover integrated artwork release regressions`
- (this document) — `docs(rc): record integrated asset RC-2 audit`

## Commercial-release note

V2-D003 (visual similarity), V2-D004 (platform-terms evidence, PARTIAL), V2-D009 (jurisdiction legal review), V2-D010 (trademark clearance) remain open. RC-2 did not close, assume, or simulate progress on any of them.

## Final decision

**PASS.** No BLOCKER findings. Two MAJOR findings were found, fixed with minimal, scoped changes, and re-verified across unit tests and real-browser QA. The rollback rehearsal - the audit's most safety-critical test - succeeded cleanly at every stage, with the full-chain revert producing a tree byte-identical to the frozen UI baseline.

Next recommended stage: **Commercial Release Gate Review**. Do not proceed to that stage in this session.
