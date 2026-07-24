# UX Copy Contract — Insight Engine

**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW
**Scope:** Documentation only. This is the binding source for user-facing strings and the copy-level guardrails that every screen must satisfy. It changes no runtime code. Where it lists Turkish strings, those are *proposed* copy pending Product Owner approval — not yet wired into components.
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr` (HEAD `95b68f6`)
**Companion:** `docs/UX_FLOW_V2.md` (flow & state model)
**Upstream authority:** `docs/02-ETHICAL_CONSTITUTION.md` (red-line categories), `src/server/reading-engine/validate.ts` (`validateInterpretation`, forbidden patterns), `docs/03-PERSONA_CONSTITUTION.md` (voice).

---

## 1. The one rule this contract exists to enforce

Insight Engine is a **reflection and insight** product, not fortune-telling. Every user-facing string must read as an invitation to think, never as a claim about what *will* happen or a statement of certain fact about the user's life.

Copy is a safety surface, not just a style choice. The same red-line categories that `validate.ts` enforces on model output apply to *static UI copy written by humans*. A hardcoded button label can violate the anti-prophecy contract just as easily as a generated sentence.

---

## 2. Voice

| Principle | Do | Don't |
|---|---|---|
| Reflective, not predictive | "Bu kart neyi düşünmeye davet ediyor?" | "Bu kart sana X olacağını söylüyor." |
| Tentative, not certain | "olabilir", "düşünülebilir", "bir olasılık" | "kesinlikle", "mutlaka", "olacak" |
| User holds agency | "Sen karar veriyorsun." | "Yapman gereken şu:" |
| Warm, not clinical | plain, calm Turkish | diagnostic/psychological jargon |
| Honest about limits | name the uncertainty | imply hidden knowledge |

Voice source of truth: `docs/03-PERSONA_CONSTITUTION.md`. This contract does not restate it — it constrains it.

---

## 3. Banned copy patterns (hard block)

These map directly to the red-line categories enforced on generated output in `src/server/reading-engine/validate.ts`. They apply equally to **static copy** authored in components, docs, placeholders, aria-labels, and error strings.

**Banned — prediction / certainty:**
- Future-certain verbs about the user's life: "olacak", "gerçekleşecek", "başına gelecek".
- Absolute quantifiers: "kesinlikle", "mutlaka", "her zaman", "asla" — when attached to a life outcome.
- Date/timing claims: "yakında", "üç ay içinde", "önümüzdeki hafta" as promises of events.

**Banned — authority / diagnosis:**
- Medical, psychiatric, or clinical claims ("depresyondasın", "hastalık", diagnosis language).
- Legal or financial directives ("boşan", "bu hisseyi al", "işten ayrıl").
- Third-party mind-reading ("o seni seviyor", "o sana yalan söylüyor").

**Banned — invented symbolism:**
- Any symbolic meaning, correspondence, keyword, or lineage **not present in governed card data** (`data/cards/*.json`) or governed knowledge. The UI must never author a card meaning inline. If a string needs a symbol, it cites governed data; it does not invent one. This is the copy-layer expression of the project's no-invented-symbol boundary.

**Banned — dependency / compulsion:**
- Copy that pressures return frequency ("her gün bak", "kaçırma"), streak/loss-aversion mechanics, or manufactured urgency. (Anti-addiction posture; durable cooldown itself is S4, but the *copy* must not push compulsion now.)

**Banned — false transparency:**
- Surfacing internal diagnostics as if they were insight: raw `confidence` numbers, `safetyFlags`, raw persona enum values, or `providerUsed` in user-facing prose. These are internal (see `UX_FLOW_V2.md` §6).

---

## 4. Allowed reflective frame

Permitted verb moods and constructions (the affirmative side of §3):

- Invitation: "…düşünmeye davet ediyor", "…üzerine düşünebilirsin".
- Possibility, hedged: "olabilir", "bir olasılık olarak", "belki de".
- Question-as-close: reflective questions the user answers for themselves.
- Agency: "Karar senin.", "Bunu nasıl okuduğun sana kalmış."
- Named uncertainty: "Bu bir kesinlik değil, bir bakış açısı."

---

## 5. Per-screen copy (proposed — pending approval)

Strings are proposals for the flow stages in `docs/UX_FLOW_V2.md`. IDs are stable keys for future i18n/testing. Turkish is the primary locale.

### 5.1 `CONSENT` (existing — do not change wording without a safety review)
`ConsentModal.tsx` copy is already tested (`src/__tests__/unit/ui-components.test.tsx:13-38`, exact-copy render). **This contract does not modify it.** Any change is a separate reviewed task because a test asserts the exact string.

### 5.2 `WELCOME`
| key | copy |
|---|---|
| `welcome.title` | Bir yansıma alanı |
| `welcome.body` | Burası bir kehanet değil. Kartlar, sorunu farklı bir açıdan düşünmen için bir ayna. Karar her zaman sende kalır. |
| `welcome.cta` | Başla |

### 5.3 `TOPIC_SELECT` (priority #1)
| key | copy |
|---|---|
| `topic.prompt` | Aklında ne var? İstersen bir alan seç — istemezsen geç. |
| `topic.relationship` | İlişkiler |
| `topic.relationship.hint` | Bir bağ, bir mesafe, bir soru işareti üzerine. |
| `topic.career` | Kariyer |
| `topic.career.hint` | Bir karar, bir yön, bir tıkanma üzerine. |
| `topic.self` | Kendim |
| `topic.self.hint` | Kendi halin, kendi ritmin üzerine. |
| `topic.skip` | Alan seçmeden devam et |

### 5.4 `QUESTION_COMPOSE` (priority #1)
| key | copy |
|---|---|
| `compose.label` | Sorunu yazmak istersen |
| `compose.placeholder` | Merak ettiğin bir şey varsa yazabilirsin — boş da bırakabilirsin. |
| `compose.scaffold.title` | Yardımcı olabilir |
| `compose.scaffold.1` | "…hakkında neyi gözden kaçırıyor olabilirim?" |
| `compose.scaffold.2` | "…konusunda kendime hangi soruyu sormalıyım?" |
| `compose.scaffold.3` | "Şu an neye dikkat etmem iyi olur?" |
| `compose.note` | İpucu: "ne olacak?" yerine "neyi düşünmeliyim?" çoğu zaman daha çok işe yarar. |
| `compose.cta` | Devam et |

> Note on `compose.scaffold.*`: these steer toward reflective phrasing and away from prediction — the copy-level enforcement of §3. They are prompts, never required.

### 5.5 `FRAMING_REVIEW` (priority #2)
| key | copy |
|---|---|
| `framing.title` | Seni doğru mu anladım? |
| `framing.body` | Sorunu şöyle ele alacağım: {framingLabel}. |
| `framing.confirm` | Evet, böyle devam et |
| `framing.edit` | Hayır, düzelteyim |
| `framing.note` | Bu bir teşhis değil; sadece hangi açıdan bakacağımızı netleştiriyoruz. |

> `{framingLabel}` is the human-readable label already produced by `resolvePersonaProfile` (`ReadingResult.tsx:25`). **No raw diagnostic field, confidence number, or safety flag appears here** (`UX_FLOW_V2.md` §6).

### 5.6 `DRAW_INVITATION` (priority #3)
| key | copy |
|---|---|
| `draw.prompt` | Hazır olduğunda kartları kendi ritminde açacaksın. |
| `draw.cta` | Kartları çek |

> Replaces the current always-on `QuestionForm` submit label "Kartları Çek" — same words, but now the moment is user-initiated, not the end of a form.

### 5.7 `SHUFFLING`
| key | copy |
|---|---|
| `shuffle.status` | Kartlar hazırlanıyor… |

### 5.8 `CARD_REVEAL` (priority #3)
| key | copy |
|---|---|
| `reveal.next` | Sıradaki kartı aç |
| `reveal.position.past` | Geçmiş |
| `reveal.position.present` | Şimdi |
| `reveal.position.future` | Yön |
| `reveal.card.note` | Kartın anlamı yorumdur, kehanet değil. |

> Card symbolic text itself comes only from governed card data — never authored here (§3, invented-symbolism ban). `reveal.position.future` uses "Yön" (direction), deliberately **not** "Gelecek olan" — a direction to consider, not an event foretold.

### 5.9 `PATTERN` (priority #4)
| key | copy |
|---|---|
| `pattern.title` | Üç kart arasındaki ip ucu |
| `pattern.lead` | Bu üç kartı bir arada düşününce ortaya şu çıkıyor: |
| `pattern.uncertainty` | Bu bir kesinlik değil, bir bakış açısı. |

> Body of the pattern is `interpretation.patterns` + `interpretation.practicalReflection` (governed output), not authored here.

### 5.10 `REFLECTION` (priority #5)
| key | copy |
|---|---|
| `reflection.title` | Kendine sorabileceğin tek soru |
| `reflection.agency` | Cevap sende. Karar da sende. |

> The single question body is governed output (`interpretation.uncertaintyNotice` / a reflective-prompt field). Exactly one question, alone. No "save", no "next reading", no upsell (that is S4).

### 5.11 `CLOSE`
| key | copy |
|---|---|
| `close.disclaimer` | Bu bir yansıma aracıdır, kehanet değil. Kararların tıbbi, hukuki veya finansal tavsiye yerine geçmez. |
| `close.restart` | Yeniden başla |

> `DisclaimerFooter.tsx` already renders a disclaimer; `close.disclaimer` should reconcile with it in the coded slice rather than duplicate it.

### 5.12 `CRISIS` (safety — copy owned by a separate safety task)
| key | copy |
|---|---|
| `crisis.lead` | Yazdıkların bana seni zorlayan bir şeyler olduğunu düşündürdü. Yalnız değilsin. |
| `crisis.body` | Şu an bir kart açmak yerine, konuşabileceğin gerçek destek hatlarını paylaşmak istiyorum. |

> **The crisis resource numbers themselves are NOT set by this contract.** `CrisisNotice.tsx` renders whatever the gate at `src/app/api/readings/route.ts` provides. Correcting those numbers (`155`, the private İntihar Önleme number, `183`, `112`) is a **separate reviewed safety-remediation task** against official sources (`https://www.112.gov.tr/`, ALO 183). This copy contract only governs the surrounding *framing* language, and only proposes it — the crisis path is safety-critical and its final wording needs an explicit safety review.

### 5.13 `RATE_LIMITED`
| key | copy |
|---|---|
| `rate.title` | Kısa bir ara |
| `rate.body` | Art arda çok fazla okuma açıldı. Biraz bekleyip tekrar deneyebilirsin. |

> This is abuse-prevention copy for the in-memory limiter (`src/server/observability/rate-limit.ts`), **not** a durable "come back tomorrow" cooldown (that is S4). Copy must not imply an account quota or a daily limit.

### 5.14 `ERROR`
| key | copy |
|---|---|
| `error.title` | Bir şeyler ters gitti |
| `error.body` | Kartların hazırlanırken bir sorun oldu. Tekrar deneyebilirsin — açılışın kaybolmaz. |
| `error.retry` | Tekrar dene |

> "açılışın kaybolmaz" encodes the §4 recovery rule of the flow doc: a provider failure re-narrates the same seed; the draw is not lost.

### 5.15 Diagnostic badges (internal, hidden by default)
`DiagnosticBadge.tsx` copy is a developer/diagnostic affordance, **not** user insight. It must read as a build/quality signal, never as part of the reading.

| kind | copy |
|---|---|
| `knowledge-partial` | Bilgi bağlamı kısmi |
| `knowledge-fallback` | Bilgi bağlamı yedek kaynaktan |
| `narration-fallback` | Anlatım yedek sağlayıcıdan |

---

## 6. Reflective-question sourcing (open item for the coded slice)

`REFLECTION` (§5.10) needs exactly one reflective question. Today the nearest field is `interpretation.uncertaintyNotice` (`src/types/interpretation.ts:44-52`), which is an *uncertainty statement*, not necessarily a *question*. Whether to:
- (a) reuse `uncertaintyNotice` as-is,
- (b) add a governed `reflectiveQuestion` field to `InterpretationOutputSchema`, or
- (c) derive it in the narration layer,

is an implementation decision for slice **S-UX-5**, flagged here so the copy contract and the schema stay honest. Option (b) would be a schema + provider + eval change and must go through the normal governed path — it is **not** authorized by this contract, only noted.

---

## 7. Enforcement

- Static copy is subject to the same red-line spirit as generated output. A future check may lint component strings against the §3 banned patterns, mirroring `validate.ts` for authored copy — proposed, not built here.
- No string in this contract is wired into a component until this contract is **approved** and the relevant coded slice (`UX_FLOW_V2.md` §7) lands as a separate reviewed change.
- `CONSENT` (§5.1) and `CRISIS` (§5.12) strings are safety-tested / safety-critical and must not be changed except through their own reviewed tasks.

---

## 8. Approval

- **Reviewed by:** ____________________  **Date:** ____________
- **Decision:** PENDING
- On approval: this document becomes the binding source for all user-facing strings; coded slices in `UX_FLOW_V2.md` §7 draw their copy from here.
