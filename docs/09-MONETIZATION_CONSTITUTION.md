# Monetization Constitution — Freemium Model & Premium Intent

## MVP Pricing Strategy

**NO REAL PAYMENTS IN MVP.** Premium is *intent measurement* only.

Goal: Understand if users value the product enough to pay.

---

## Free Tier (Default)

**Usage:**
- 2 short readings / week (rolling 7-day window)
- 3-card only (not 5-card)
- Same-topic cooldown: 24 hours
- Can view 1 past reading (summary only)
- No saved history beyond 30 days

**Limits:**
```sql
SELECT COUNT(*) FROM readings 
WHERE user_id = ? AND created_at > NOW() - 7 days
  AND spread_type = 'three_card'
LIMIT 2  -- enforce in code
```

**No upsell mechanics:**
- ❌ "Upgrade to get instant access"
- ❌ "Unlock now, pay later"
- ❌ "Limited time offer"
- ✓ "Here's what premium members see"

---

## Premium Tier (Future, But Measured Now)

**Usage (future):**
- 12-20 readings / month
- Both 3-card AND 5-card
- No cooldown (same-topic allowed)
- Full history access
- Detailed reflection & journal
- Export readings to PDF
- (No ads because we don't have ads)

**Price:** TBD (user testing will inform)
- Likely: $5-10/month or $50/year
- Based on: Comparable tools (Insight Timer $15/mo, Reflectly $5-10/mo)

---

## Premium Intent Measurement (MVP)

### Modal Content

After first reading, show:

```
┌─────────────────────────────────┐
│  Tarot Premium                  │
│                                 │
│  "This reading was personalized │
│  just for you."                 │
│                                 │
│  Premium members get:           │
│  • Unlimited readings           │
│  • 5-card spreads               │
│  • Full reading history         │
│  • Weekly reflection prompts    │
│                                 │
│  [Tell me when it launches]     │
│  [Learn more]  [Maybe later]    │
└─────────────────────────────────┘
```

### Measurement

Track:

- `premium_modal_viewed`: Did user see it?
- `premium_modal_clicked` → button action:
  - "tell_me_when" = strong interest (collect email)
  - "learn_more" = medium interest (link to landing page)
  - "maybe_later" = low interest (dismiss)

**Goal:** 15%+ CTR on "Tell me when it launches"

---

## Waitlist Mechanism

If user clicks "Tell me when it launches":

```
Modal: "Notify me at launch"
Input: [Email prefilled from auth]
Button: [Get notified]

Save to: waitlist table
  - email
  - timestamp
  - referred_by (if any)
  - estimated_launch_interest
```

---

## Pricing Hypotheses (To Be Tested)

1. **Willingness to pay:** >30% of users who engage will pay at launch
2. **Freemium ratio:** 20-30% of active users will be premium
3. **Price sensitivity:** $5-10/mo (lower bound), $15+/mo (upper bound)
4. **Upsell moment:** Strongest signal = "I saved this reading" (engagement signal)

---

## No Dark Patterns

**BANNED:**
- "Premium expired, re-subscribe now"
- "You've used X of X readings, upgrade!"
- "Limited time 50% off"
- "Act now before price goes up"
- Angry red buttons
- Aggressive notifications

**ALLOWED:**
- "Here's what premium members can do"
- "Ready to explore more?"
- "Want full history access?"
- Soft, clear CTAs

---

## Exit Ramp for Premium

If user wants to cancel (post-launch):

- [ ] 1-click cancel (no retention offers)
- [ ] Optional: "Tell us why?" (feedback)
- [ ] Optional: "Come back anytime" (gentle)
- [ ] No naggy emails or dark patterns

---

## Ethical Monetization Principles

1. **No addiction-based upsell:** Don't charge for things that prevent addiction
2. **No deception:** Be clear what free vs premium means
3. **No paywall on safety:** Crisis resources always free
4. **No therapeutic claims:** Don't sell "healing" or "transformation"
5. **No FOMO:** Don't create artificial scarcity

---

## Next Steps

MVP Exit Criteria. What "success" looks like at Aşama 10.
