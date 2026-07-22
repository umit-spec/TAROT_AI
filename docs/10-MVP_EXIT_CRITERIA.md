# MVP Exit Criteria — Aşama 10 Pass/Fail Rubric

## Definition: "Ready for 100 Users"

The MVP is launch-ready when **ALL of the following are true.**

Any single FAIL blocks launch (must iterate).

---

## Functional Requirements

### ✓ Intake Engine

- [ ] Topic selection works (4 topics)
- [ ] Persona detection asks 3-4 questions, assigns one of 5 types
- [ ] Context questions asked based on topic
- [ ] User can proceed without error

**FAIL IF:** Any crash, question unclear, or timeout >5s

### ✓ Reading Generation

- [ ] Cards revealed in correct order (3 or 5 based on spread)
- [ ] Reading text generated (Claude or fallback deterministic)
- [ ] All 3 layers present (deterministic, synthesis, AI language)
- [ ] Output matches Zod schema
- [ ] No prohibited phrases detected

**FAIL IF:** Broken reading, schema invalid, or phrases found

### ✓ Persona System

- [ ] 5 personas correctly assigned
- [ ] Tone differs visibly between personas (same cards, different reading)
- [ ] No persona-specific crashes

**FAIL IF:** Wrong persona assigned, or tone indistinguishable

### ✓ Authentication

- [ ] Magic link auth works end-to-end
- [ ] Google OAuth works end-to-end
- [ ] Guest session works (can read without login)
- [ ] Can save reading after login

**FAIL IF:** Any auth flow broken, or save fails

### ✓ Safety & Ethics

- [ ] Crisis keywords trigger safety modal (3 test cases)
- [ ] Health/legal/financial keywords show disclaimer
- [ ] Prohibited phrases blocked in output (10 test phrases)
- [ ] No kesin kehanet language in any reading

**FAIL IF:** Safety modal doesn't trigger, or phrase slips through

---

## Performance Requirements

### ✓ Speed

- [ ] First landing: <3s (Lighthouse FCP)
- [ ] Cards revealed: <2s (shuffle animation)
- [ ] Reading display: <1s (from reveal to text)
- [ ] Total flow (landing → reading): <2 minutes

**FAIL IF:** Any step >thresholds, or 2-min target missed

### ✓ Reliability

- [ ] 24h uptime test: 99.9%+ (no errors)
- [ ] Concurrent 50 users: no crashes
- [ ] Database failover: data not lost

**FAIL IF:** Downtime >0.1%, crash under 50 concurrent, or data loss

---

## Security Requirements

### ✓ OWASP Top 10

- [ ] No SQL injection (Drizzle parameterized)
- [ ] No XSS (React auto-escapes, CSP headers)
- [ ] No CSRF (Auth.js tokens)
- [ ] No prompt injection (Claude inputs validated)
- [ ] Secrets not in code (env vars only)
- [ ] Rate limiting works (1 read/hour free)
- [ ] Session timeout: 30 min inactivity

**FAIL IF:** Any vulnerability found in pen test

### ✓ Data Privacy

- [ ] Privacy policy published and clear
- [ ] GDPR: User can delete account (data purged in 24h)
- [ ] GDPR: Data retention <90 days max
- [ ] Email minimal (auth only, no tracking)

**FAIL IF:** GDPR non-compliance, or deletion fails

---

## User Experience

### ✓ Onboarding

- [ ] New user lands, understands value in <1 min
- [ ] Onboarding modal shown (tarot definition, boundaries)
- [ ] User can click through and start reading
- [ ] No confusing options or jargon

**FAIL IF:** User confused, or modal missing

### ✓ Reading Quality

- [ ] Reading feels personal (not generic)
- [ ] Persona tone is apparent
- [ ] Card meanings make sense in context
- [ ] Reflection question meaningful

**FAIL IF:** Reading feels template, or tone flat

### ✓ Mobile Responsiveness

- [ ] Mobile (375px) readable and tappable
- [ ] Tablet (768px) optimized
- [ ] Desktop (1920px) optimized
- [ ] No horizontal scroll
- [ ] Font sizes 16px+ (mobile readability)

**FAIL IF:** Broken on any breakpoint, or horizontal scroll

### ✓ Accessibility

- [ ] WCAG AA contrast passed (axe-core)
- [ ] Keyboard navigation works (Tab through all)
- [ ] Screen reader compatible (ARIA labels)
- [ ] Motion reduced respected (prefers-reduced-motion)

**FAIL IF:** Any violation found

---

## Analytics & Observability

### ✓ Event Tracking

- [ ] All 14 events fire correctly
- [ ] Event data logged to Posthog
- [ ] Dashboard queries work (completion rate, helpfulness, CTR)
- [ ] Can measure funnel

**FAIL IF:** Events missing or dashboard broken

### ✓ Error Tracking

- [ ] Errors logged to Sentry
- [ ] Stack traces captured
- [ ] Can reproduce errors from logs
- [ ] Performance metrics tracked

**FAIL IF:** Sentry dark, or can't debug from logs

---

## Testing Coverage

### ✓ Unit Tests

- [ ] Layer 1 (deterministic) >90% coverage
- [ ] Layer 2 (synthesis) >80% coverage
- [ ] Persona detection >90% coverage
- [ ] Auth >85% coverage

**FAIL IF:** Coverage <thresholds

### ✓ Integration Tests

- [ ] Intake → Reading flow tested
- [ ] Auth → Save flow tested
- [ ] Fallback (Claude down) tested
- [ ] Rate limit enforcement tested

**FAIL IF:** Any integration flow broken

### ✓ E2E Tests (Playwright)

- [ ] First-time user path tested
- [ ] Returning user path tested
- [ ] Crisis scenario handled
- [ ] Mobile path tested

**FAIL IF:** E2E failures

---

## Business & Legal

### ✓ Brand & Messaging

- [ ] Landing page clear (value prop, "Start Reading")
- [ ] Tone consistent (premium, not mystical)
- [ ] No make medical/legal/financial claims
- [ ] No fake testimonials

**FAIL IF:** Messaging misleading or low-quality

### ✓ Legal Documents

- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Medical disclaimer visible
- [ ] Tarot definition clear (not fortune-telling)

**FAIL IF:** Docs missing or unclear

### ✓ Ethical Review

- [ ] No addiction loop (cooldown works, limits enforced)
- [ ] No dark patterns (upsell gentle)
- [ ] No cultural appropriation (visuals checked)
- [ ] No exclusivity (accessible to all)

**FAIL IF:** Any ethical violation

---

## Product Metrics

### ✓ User Satisfaction

- [ ] Helpfulness score average ≥2.0/3.0 (from 50+ users)
- [ ] "Felt personal" >60% (qualitative feedback)
- [ ] No complaints about accuracy/meaningfulness

**FAIL IF:** Average <1.5, or <40% felt personal

### ✓ Engagement

- [ ] Completion rate >70% (start → reading display)
- [ ] 7-day return rate ≥20% (new users)
- [ ] Same-topic re-read <20% (no addiction signal)

**FAIL IF:** Any metric fails threshold

### ✓ Premium Intent

- [ ] Premium modal viewed by >80% (after reading)
- [ ] CTR (Tell me when) ≥15%
- [ ] 100+ emails on waitlist (from 100 users)

**FAIL IF:** CTR <10%, or <50 waitlist signups

---

## Red Team Final Check

### Before Launch:

- [ ] "Could this be used as fortune-telling trap?" → No
- [ ] "Does premium upsell feel manipulative?" → No
- [ ] "Are we liable if user makes bad decision?" → No
- [ ] "Could this be targeting vulnerable people?" → No
- [ ] "Is pricing ethical?" → Yes (free generous, premium fair)
- [ ] "Will addiction be a concern?" → No (cooldown prevents it)
- [ ] "Any AI bias in readings?" → No (controlled meanings, persona-aware)

---

## Sign-Off

All the following must approve:

- [ ] Product Owner (business, ethics)
- [ ] Engineering Lead (code, security, performance)
- [ ] Designer (UX, accessibility)
- [ ] Compliance/Legal (privacy, terms)

**NO LAUNCH WITHOUT ALL SIGN-OFFS.**

---

## Launch Checklist

- [ ] All tests passing
- [ ] Production database migrated
- [ ] Secrets configured in Vercel
- [ ] Domain configured (SSL cert)
- [ ] Sentry project setup
- [ ] Posthog tracking verified
- [ ] Email sending tested (Resend)
- [ ] Backup plan documented
- [ ] Monitoring dashboards built
- [ ] On-call person assigned
- [ ] Rollback procedure documented

---

## Next Steps

Decision Log (ADR template). How decisions are recorded.
