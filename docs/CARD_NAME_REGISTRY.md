# Card Name Registry (Governance)

**Status:** ACTIVE
**Scope:** The user-facing display **name** of each card. Presentation layer only — no card meaning, symbol, interpretation, or new text. `cardId` remains the single authority for identity and order.
**Registry:** `src/lib/card-display.ts` · **Lock test:** `src/__tests__/unit/card-display.test.ts`

---

## 1. Naming source

Display names are **sourced verbatim** from the governed card data — the `name_tr` field of each `data/cards/*.json` — not a free re-translation. The registry is a client-safe static map (the reveal/reading components are client components and must not read `data/cards` via `fs`, and the API response is unchanged). A test locks the registry to the card data: every deck card must have a registry entry whose `displayName === name_tr` and matching `arcana`, and the registry id-set must equal the deck exactly. So the two can never drift.

`name_tr` (and thus the display name) is the **governed Turkish name**; it is not free translation and any change to it is a governed card-data change (see §4).

## 2. Turkish translation decisions

The current governed names are locked as below. Two of them differ from examples raised during the naming request and are **flagged for a Product Owner decision** — they currently stay on the governed `name_tr` rather than forking a second source of truth:

| Card | Current governed name (`name_tr`) | Raised alternative | Status |
|---|---|---|---|
| `02-high-priestess` | **Yüksek Rahibe** | "Başrahibe" | Open — PO to confirm keep vs. change `name_tr` |
| `05-hierophant` | **Hiyerofant** | "Aziz / Başrahip" (undecided) | Open — PO to pick, if changing |
| `20-judgement` | **Yargı** | (not "Mahkeme") | Resolved — already "Yargı" |
| `21-world` | **Dünya** | "Dünya" | Resolved — matches |

Changing either open item means editing the card data `name_tr` (a governed change, §4); the registry then follows automatically and the lock test enforces the match.

## 3. `cardId → displayName` table (22 Major Arcana)

| cardId | displayName | arcana |
|---|---|---|
| `00-fool` | Deli | major |
| `01-magician` | Büyücü | major |
| `02-high-priestess` | Yüksek Rahibe | major |
| `03-empress` | İmparatoriçe | major |
| `04-emperor` | İmparator | major |
| `05-hierophant` | Hiyerofant | major |
| `06-lovers` | Âşıklar | major |
| `07-chariot` | Savaş Arabası | major |
| `08-strength` | Güç | major |
| `09-hermit` | Ermiş | major |
| `10-wheel-of-fortune` | Kaderin Tekerleği | major |
| `11-justice` | Adalet | major |
| `12-hanged-man` | Asılı Adam | major |
| `13-death` | Ölüm | major |
| `14-temperance` | Denge | major |
| `15-devil` | Şeytan | major |
| `16-tower` | Kule | major |
| `17-star` | Yıldız | major |
| `18-moon` | Ay | major |
| `19-sun` | Güneş | major |
| `20-judgement` | Yargı | major |
| `21-world` | Dünya | major |

## 4. Change process

1. To change a display name, edit the card's `name_tr` in `data/cards/<id>.json` (the governed source) and bump `DECK_DATA_VERSION` if content changes meaningfully.
2. Update the corresponding `displayName` in `src/lib/card-display.ts` to match.
3. `card-display.test.ts` enforces `displayName === name_tr`; a mismatch fails the build.
4. Naming changes are copy/governance decisions — they must not introduce meaning, symbolism, or interpretation. The registry stays presentation-only.

## 5. Missing / unknown card policy

- The raw `cardId` is **never** shown to the user.
- An unmapped `cardId` resolves to the neutral governed fallback **"Kart"** via `cardDisplayName()`; the client never invents a name.
- The registry currently covers the **22 Major Arcana** (the full current deck, ADR-002 upright-only). Extending to the 78-card deck (Minor Arcana) is future work: add the cards to `data/cards` with governed `name_tr`, add registry entries, and the lock test will require them.

## 6. Out of scope

Card faces/artwork, the visual system, and any 78-card deck expansion are separate later work. This registry governs names only.
