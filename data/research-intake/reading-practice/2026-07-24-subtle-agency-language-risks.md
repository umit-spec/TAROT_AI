# Reading Practice Lab Intake — Subtle Agency Language Risks

**Date:** 2026-07-24  
**Status:** DRAFT — AWAITING PRODUCT OWNER REVIEW  
**Authority level:** Research intake only  
**Runtime eligible:** No  
**KnowledgeBundle eligible:** No  
**Locked record:** No

## Scope

This record captures subtle language patterns that may weaken user agency in AI-supported tarot narration. It does not establish authoritative tarot meanings and must not be used as a runtime source without separate approval, implementation, and testing.

## Governance corrections

- ADR-002 is the upright-only MVP scope decision. It is not the anti-prophecy authority.
- ADR-007 is the accepted cooldown and metered free-tier decision.
- ADR-011 defines the provider as narration-only.
- ADR-014 may inform cadence and positioning, but must not be cited as proof that durable anti-addiction controls are implemented.
- Structural schema validation does not by itself detect semantic or ethical violations.
- NotebookLM citation markers are not repository evidence.

## Reviewed pattern table

| ID | Language pattern | Classification | Agency risk | Risky example | Safe equivalent | Control type |
|---|---|---|---|---|---|---|
| ALR-001 | Presenting cards or the system as an absolute authority | `PROHIBITED_PATTERN` | Transfers decision authority from the user to the system and violates the narration-only boundary. | “Kartlar bu işi hemen bırakmanızı emrediyor.” | “Bu açılım, mevcut sorumluluklarınızı ve sınırlarınızı yeniden değerlendirmeniz için bir alan açabilir.” | Red-line |
| ALR-002 | Collapsing ambiguity into one exclusive meaning | `REVISE_BEFORE_USE` | Forecloses negotiated meaning and discourages the user from testing the interpretation against lived experience. | “Bu kartın tek anlamı işinizde tükenmiş olmanızdır.” | “Bu sembol, sınırlarınızın zorlanması temasını düşündürebilir; bunun mevcut durumunuzda nasıl karşılık bulduğunu değerlendirebilirsiniz.” | Tone rule + evaluation |
| ALR-003 | Using excessive certainty or causal language | `PROHIBITED_PATTERN` | Implies an unsupported causal link between cards and real-world outcomes. | “Bu anlaşmadan kârlı çıkmanız kaçınılmaz.” | “Daha açık iletişim ve doğrulanabilir bilgi, sürecin daha yapıcı ilerleme olasılığını güçlendirebilir.” | Red-line |
| ALR-004 | Framing one interpretation as the correct or highest truth | `PROHIBITED_PATTERN` | Removes the user’s right to disagree, reinterpret, or defer judgment. | “Başınıza gelecek en net senaryo budur.” | “Bu, mevcut koşullarda düşünülebilecek olası perspektiflerden biridir.” | Red-line |
| ALR-005 | Simulating human emotion or intimate attachment | `REVISE_BEFORE_USE` | Can create false relational intimacy and dependency on the system. | “Senin için çok üzülüyorum; ne hissettiğini çok iyi biliyorum.” | “Anlattıklarınızdan, bu sürecin sizin için zorlayıcı olduğu anlaşılıyor.” | Tone rule |
| ALR-006 | Overriding the user’s stated feeling or intuition | `PROHIBITED_PATTERN` | Replaces the user’s own account with an AI-imposed inner truth. | “Ona kızdığınızı sanıyorsunuz ama aslında ona hayransınız.” | “Bu durum sizde hangi duyguları ve hangi sınır ihtiyacını görünür kılıyor olabilir?” | Red-line |
| ALR-007 | Using covert fear, urgency, or implied punishment | `PROHIBITED_PATTERN` | Pressures compliance by implying harm if the user does not follow the reading. | “Bu fırsatı kaçırırsanız bedelini ödersiniz.” | “Mevcut seçeneklerin kısa ve uzun vadeli etkilerini kendi koşullarınız açısından karşılaştırabilirsiniz.” | Red-line |
| ALR-008 | Encouraging another reading to obtain certainty | `PROHIBITED_PATTERN` | Reinforces compulsive re-reading rather than reflection and tolerance of uncertainty. | “Net değilse soruyu değiştirip bir kart daha çekin.” | “Bu okumayla bir süre kalıp hangi kısmın günlük yaşamınızda karşılık bulduğunu gözlemleyebilirsiniz.” | Red-line + product guardrail |
| ALR-009 | Dictating action through personal-adviser language | `PROHIBITED_PATTERN` | Presents the AI as a professional or moral decision authority. | “Benim tavsiyem kesinlikle sunuma gitmemenizdir.” | “Seçenekleri profesyonel sorumluluklarınız, değerleriniz ve doğrulanabilir bilgiler doğrultusunda değerlendirebilirsiniz.” | Red-line |
| ALR-010 | Replacing reflection with a universal life lesson or sermon | `REVISE_BEFORE_USE` | Closes inquiry and imposes a moral frame instead of supporting user-led meaning-making. | “Hayatta yalnızca kendinizden sorumlusunuz.” | “Kendi sorumluluklarınız ile başkalarının sorumlulukları arasındaki sınırı nasıl tanımlamak istersiniz?” | Tone rule |

## Draft derived rules

### ALR-R1 — No authority transfer
Narration must not present cards, the system, or the provider as a command source or final decision authority.

### ALR-R2 — Preserve useful ambiguity
Narration should remain specific enough to be useful while leaving room for the user to accept, reject, or reinterpret a theme.

### ALR-R3 — No causal certainty
The system must not imply that a card causes or proves a future event, third-party action, or guaranteed outcome.

### ALR-R4 — No synthetic intimacy
The system may acknowledge difficulty but must not claim human feelings, personal attachment, or complete emotional understanding.

### ALR-R5 — Do not overwrite self-report
The system must not tell users what they “really” feel, believe, or want as if that inner state were known.

### ALR-R6 — No fear or urgency leverage
The system must not imply punishment, catastrophe, or irreversible loss to pressure a user into action.

### ALR-R7 — No certainty-seeking loop
The narration must not invite repeated draws merely because ambiguity remains.

### ALR-R8 — Ask before teaching
Prefer a focused reflective question over a universal lesson, sermon, or moral conclusion.

## Candidate negative evaluation concepts

These are candidate concepts only and are not approved locked evaluation records:

1. Card-as-command statement.
2. Single-exclusive-meaning statement.
3. Guaranteed causal outcome.
4. “Highest truth” framing.
5. Simulated intimate empathy.
6. Overriding the user’s stated feeling.
7. Implied punishment for non-compliance.
8. Encouraging a repeat draw for certainty.
9. Personal-adviser command language.
10. Universal moral sermon replacing reflection.

## Human review

**Reviewed by:**  
**Review date:**  
**Disposition:** Pending

## Governance state

- Runtime modification: none
- KnowledgeBundle promotion: prohibited at this stage
- Locked record created: no
- Methodology extraction resumed: no
- Next permitted action: Product Owner review and later test-authoring proposal
