# UX Copy Contract — Insight Engine

**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW (revised per PO review, 2026-07-24)
**Scope:** Documentation only. This is the binding source for user-facing strings and the copy-level guardrails that every screen must satisfy. It changes no runtime code. Where it lists Turkish strings, those are *proposed* copy pending Product Owner approval — not yet wired into components.
**Branch verified:** `claude/insight-engine-investor-audit-bkofgr` (HEAD `6ceb3f1`)
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

### 5.1b `CONSENT_DECLINED` (informational only — NO reading CTA) — PO point 2
Shown when the user declines consent. It must offer only information and a way back to review consent. It must **not** contain any control that starts a reading.
| key | copy |
|---|---|
| `declined.title` | Anladım, acele yok |
| `declined.body` | Onay vermeden okuma başlatmıyoruz. İstersen nasıl çalıştığımızı ve gizliliği okuyabilir, hazır olduğunda geri dönebilirsin. |
| `declined.howItWorks` | Nasıl çalışır? |
| `declined.privacy` | Gizlilik |
| `declined.back` | Onayı yeniden gözden geçir |

> No `declined.startReading` key exists, by design. A reading requires `consentStatus === 'accepted'` (`UX_FLOW_V2.md` §3.1).

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
| `compose.cta` | Sorumu netleştir |
| `compose.cta.loading` | Netleştiriliyor... |

> Note on `compose.scaffold.*`: these steer toward reflective phrasing and away from prediction — the copy-level enforcement of §3. They are prompts, never required.

> **Binding (S-UX-3 copy correction):** the compose submit button is `compose.cta` = **"Sorumu netleştir"**, NOT "Kartları Çek". That button starts the framing preview — it draws no card and runs no shuffle — so it must carry no card/draw/shuffle language ("kart", "çek", "karıl", "shuffle"). The actual draw is initiated later, after framing confirmation.

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

> This is the draw that happens AFTER framing confirmation — a distinct moment from the compose submit (`compose.cta` = "Sorumu netleştir", §5.4). The compose button no longer says "Kartları Çek"; card/draw language belongs only here, on the post-framing draw.

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

### 5.10 `reflection` (priority #5) — SHIPPED (`ReflectionClose.tsx`)
| key | copy |
|---|---|
| `reflection.title` | Kendine bırakacağın soru |
| `reflection.body` | (governed) `interpretation.reflectionPrompt`, rendered verbatim |
| `reflection.boundary` | Yanıtlamak zorunda değilsin. Bu soruyu yanında taşıman yeterli. |
| `reflection.restart` | Yeniden başla |

> The question body is the governed `interpretation.reflectionPrompt` field (ADR-UX-REFLECTION-PROMPT). It is rendered **verbatim** — the client never rewrites it, appends punctuation, produces its own fallback, or shows more than one question. It is **not** sourced from `interpretation.uncertaintyNotice`. The screen shows no `uncertaintyNotice`, provider, `reflectionPromptSource`, `fallbackReason`, confidence, safety flag, or persona. **No save, no "next reading", no share, no upsell** (S4). Reachable from two paths — the pattern's primary CTA and the end of the details — both landing here (see `UX_FLOW_V2.md` §3.6).

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

> **The crisis resource numbers themselves are NOT set by this contract.** `CrisisNotice.tsx` renders whatever the reviewed gate provides via `src/server/intake/crisis-resources.ts`. Those numbers were set by a separate safety review (`docs/SAFETY_CRISIS_RESOURCES_REVIEW.md`, 2026-07-24): the runtime list is now **112 only** (155 removed, unverified private line removed, ALO 183 deferred to future context-aware routing). This copy contract only governs the surrounding *framing* language, and only proposes it — the crisis path is safety-critical and any wording change needs its own safety review.

### 5.13 `error` — rate-limit variant (a variant of the error screen, not a separate screen)
| key | copy |
|---|---|
| `error.rate.title` | Kısa bir ara |
| `error.rate.body` | Art arda çok fazla okuma açıldı. Biraz bekleyip tekrar deneyebilirsin. |

> This is abuse-prevention copy for the in-memory limiter (`src/server/observability/rate-limit.ts`), **not** a durable "come back tomorrow" cooldown (that is S4). Copy must not imply an account quota or a daily limit. Per `UX_FLOW_V2.md` §2 this is the `error` screen with a `rate-limit` reason, not its own screen.

### 5.14 `error` — two honest variants keyed by `cardsResolved` (PO point 3)
The draft's single unconditional "açılışın kaybolmaz" was corrected: that promise is only true once the cards actually resolved. The `error` screen picks its variant from `SessionMeta.cardsResolved`.

**PRE_DRAW_ERROR** (`cardsResolved === false` — failure before any card was selected):
| key | copy |
|---|---|
| `error.preDraw.title` | Bir şeyler ters gitti |
| `error.preDraw.body` | Henüz kart seçilmedi. Yeniden deneyebilirsin. |
| `error.preDraw.retry` | Tekrar dene |

**POST_DRAW_NARRATION_ERROR** (`cardsResolved === true` — cards resolved, narration failed):
| key | copy |
|---|---|
| `error.postDraw.title` | Yorum hazırlanamadı |
| `error.postDraw.body` | Kartların korundu. Yalnız yorum yeniden hazırlanacak. |
| `error.postDraw.retry` | Yorumu yeniden hazırla |

> The UI must **never** show a preservation promise unless `cardsResolved === true`. "Kartların korundu" encodes the §4 recovery rule: the same seed is re-narrated; the draw is not lost. The pre-draw variant makes no such claim.

### 5.15 Diagnostic badges (internal, hidden by default)
`DiagnosticBadge.tsx` copy is a developer/diagnostic affordance, **not** user insight. It must read as a build/quality signal, never as part of the reading. A successful narration fallback (`narrationStatus: 'fallback'`) does **not** get its own screen or interrupt the flow — the user proceeds through the normal `reveal → pattern → reflection` path (PO point 5, `UX_FLOW_V2.md` §4). Only if content is genuinely limited may a plain trust note appear.

| kind | copy |
|---|---|
| `knowledge-partial` | Bilgi bağlamı kısmi |
| `knowledge-fallback` | Bilgi bağlamı yedek kaynaktan |
| `narration-fallback` | Anlatım yedek sağlayıcıdan |

---

## 6. Reflective-question sourcing — governed `reflectionPrompt` field (SHIPPED)

`reflection` (§5.10) shows exactly one reflective *question*, sourced from the governed `interpretation.reflectionPrompt` field (ADR-UX-REFLECTION-PROMPT). `interpretation.uncertaintyNotice` is an *uncertainty statement* — **not** a question — and **must not** be used as the reflection-question source. The engine guarantees `reflectionPrompt` is always exactly one safe reflective question (the provider's if it passes the guards, else the single central governed fallback); the client renders whatever governed value arrives, verbatim, and invents nothing.

**Decision:** a dedicated governed `reflectionPrompt` field must be added to `InterpretationOutputSchema` through the normal governed path (schema + provider + eval fixtures + red-line coverage). **That schema change is NOT in this sprint** and is **not** authorized by this contract — it is recorded here as the required future contract. Until it lands, the `reflection` screen renders no fabricated question.

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
