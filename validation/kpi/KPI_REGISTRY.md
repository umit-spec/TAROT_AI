# KPI Registry — Insight Engine Validation

**Version:** 1.0.0  
**Last Updated:** 2026-07-22  
**Owner:** Analytics & Validation Lead

---

## PRIMARY KPIs

### KPI-001: Time to First Insight

**Definition:** Elapsed time from user landing on the page to First Insight text appearing and being readable on screen.

**Formula:**
```
Time to First Insight = 
  timestamp(first_insight_displayed) - timestamp(landing_view)
```

**Data Source:**
- Event: `first_insight_displayed` (analytics_events table)
- Property: `time_to_delivery_ms`
- Raw measurement: Stopwatch (milliseconds)

**Pass Threshold:** ≤90,000 ms (90 seconds) average across 5 users

**Fail Threshold:** >90,000 ms average OR any single user >100,000 ms (100 seconds)

**Measurement Method:** Automated event tracking + manual stopwatch validation

**Owner:** UX Research Lead

**Calculation Frequency:** Per-session, aggregated per validation run

**Replication:**
```bash
SELECT 
  session_id,
  EXTRACT(EPOCH FROM (
    MAX(CASE WHEN event_name='first_insight_displayed' THEN created_at END) - 
    MIN(CASE WHEN event_name='landing_view' THEN created_at END)
  )) * 1000 as time_to_first_insight_ms
FROM analytics_events
WHERE event_name IN ('landing_view', 'first_insight_displayed')
GROUP BY session_id
ORDER BY time_to_first_insight_ms DESC;
```

**Confidence Score:** 0.95 (automated timestamp tracking, high precision)

**Known Biases:**
- Network latency variation
- Device performance variation
- User hesitation at decision points

**Mitigation:**
- Measure on multiple device types
- Use percentile analysis (p50, p95), not just average
- Run on controlled network (not WiFi)

---

### KPI-002: Core Flow Completion Time

**Definition:** Elapsed time from user landing until save prompt is completed (or dismissed).

**Formula:**
```
Core Flow Time = 
  timestamp(save_prompted) - timestamp(landing_view)
```

**Data Source:**
- Event: `save_prompted` (analytics_events table)
- Property: `user_action` (save | dismiss)
- Raw measurement: Automated timestamps

**Pass Threshold:** ≤120,000 ms (120 seconds) average across 5 users

**Fail Threshold:** >120,000 ms average OR any single user >130,000 ms (130 seconds)

**Measurement Method:** Automated event tracking

**Owner:** UX Research Lead

**Calculation Frequency:** Per-session, aggregated per validation run

**Replication:**
```bash
SELECT 
  session_id,
  EXTRACT(EPOCH FROM (
    MAX(CASE WHEN event_name='save_prompted' THEN created_at END) - 
    MIN(CASE WHEN event_name='landing_view' THEN created_at END)
  )) * 1000 as core_flow_time_ms
FROM analytics_events
WHERE event_name IN ('landing_view', 'save_prompted')
GROUP BY session_id
ORDER BY core_flow_time_ms DESC;
```

**Confidence Score:** 0.95 (automated timestamps)

**Known Biases:**
- User reading speed variation (intentional; part of UX)
- Decision hesitation at save point

---

## SECONDARY KPIs

### KPI-003: Insight Quality Score

**Definition:** Subjective 1-3 rating by user of how helpful/relevant the reading was.

**Formula:**
```
Insight Quality Score = AVG(helpfulness_submitted.score)
  where score IN [1, 2, 3]
```

**Data Source:**
- Event: `helpfulness_submitted` (analytics_events table)
- Property: `score` (1 | 2 | 3)
- Optional: `text_note` (qualitative feedback)

**Pass Threshold:** ≥2.0/3.0 average (minimum "helpful")

**Fail Threshold:** <1.5/3.0 average (unacceptable quality signal)

**Measurement Method:** User input + optional qualitative feedback

**Owner:** Product Manager

**Calculation Frequency:** Aggregated per validation run, per persona

**Replication:**
```bash
SELECT 
  CAST(event_data->>'score' AS INT) as score,
  COUNT(*) as count,
  ROUND(AVG(CAST(event_data->>'score' AS DECIMAL)), 2) as avg_score
FROM analytics_events
WHERE event_name='helpfulness_submitted'
GROUP BY event_data->>'score'
ORDER BY score DESC;
```

**Confidence Score:** 0.80 (user subjective ratings have inherent variability)

**Known Biases:**
- Barnum effect (general statements feel personal)
- Recency bias (recent reading disproportionately influences rating)
- Self-selection (users more likely to rate if strongly opinionated)

**Red Team Attack:** Persona confusion (does skeptic rate differently than anxious? Should be significantly different if persona system works)

---

### KPI-004: Continue Reading Rate

**Definition:** Percentage of users who scroll to or view the Detailed Synthesis section after First Insight.

**Formula:**
```
Continue Reading Rate = 
  COUNT(DISTINCT sessions with detailed_synthesis_viewed) / 
  COUNT(DISTINCT sessions with first_insight_displayed) * 100
```

**Data Source:**
- Event: `detailed_synthesis_viewed` (analytics_events table)
- Event: `first_insight_displayed` (analytics_events table)

**Pass Threshold:** ≥60% (majority continue reading)

**Fail Threshold:** <40% (First Insight not compelling enough)

**Measurement Method:** Automated event tracking

**Owner:** UX Research Lead

**Replication:**
```bash
SELECT 
  COUNT(DISTINCT CASE WHEN event_name='detailed_synthesis_viewed' THEN session_id END) as detailed_views,
  COUNT(DISTINCT CASE WHEN event_name='first_insight_displayed' THEN session_id END) as first_insight_views,
  ROUND(
    100.0 * COUNT(DISTINCT CASE WHEN event_name='detailed_synthesis_viewed' THEN session_id END) /
    COUNT(DISTINCT CASE WHEN event_name='first_insight_displayed' THEN session_id END),
    2
  ) as continue_reading_rate_pct
FROM analytics_events;
```

**Confidence Score:** 0.92 (automated events, but scroll detection can have false positives)

---

### KPI-005: Persona Fit Score

**Definition:** Does the persona-specific tone actually register differently to different user types?

**Measurement:**
1. Detected persona vs. self-reported persona type
2. Tone preference survey ("Did the reading feel suited to you?" 1-5 scale)
3. Reading comprehension quiz (same cards, different personas)

**Formula:**
```
Persona Fit = 
  (persona_detection_accuracy * 0.4) +
  (tone_preference_avg * 0.4) +
  (comprehension_correctness * 0.2)
```

**Pass Threshold:** ≥0.75 (75% fit score)

**Fail Threshold:** <0.60 (persona system not working)

**Owner:** UX Research Lead

**Measurement Method:** Manual assessment (requires user interview/survey)

**Confidence Score:** 0.70 (partially subjective)

---

### KPI-006: Accessibility Pass Rate

**Definition:** Percentage of screens passing WCAG AA automated audit + manual accessibility testing.

**Criteria:**
- Touch targets ≥44×44 px
- Color contrast ≥4.5:1 (normal text), ≥3:1 (large text)
- Keyboard navigation complete (Tab order logical)
- Screen reader compatible (ARIA labels present)
- prefers-reduced-motion respected

**Formula:**
```
Accessibility Pass Rate = 
  (automated_audit_pass_percentage * 0.6) +
  (manual_test_pass_percentage * 0.4)
```

**Pass Threshold:** 100% (accessibility is binary: pass or fail)

**Fail Threshold:** Any single accessibility criterion fails

**Measurement Method:** axe-core + manual testing + keyboard navigation test

**Owner:** QA Lead + Accessibility Specialist

**Replication:**
```bash
# Run axe-core on each wireframe screen
npm run test:accessibility

# Verify keyboard navigation (Tab through all interactive elements)
# Verify screen reader (NVDA/JAWS on Windows, VoiceOver on macOS)
# Verify contrast ratio (WebAIM Color Contrast Checker)
```

**Confidence Score:** 0.98 (automated + manual verification)

---

### KPI-007: Analytics Event Integrity

**Definition:** Do all 12 core funnel events fire correctly? Are event payloads valid?

**Formula:**
```
Event Integrity Score = 
  (events_fired_correctly / total_events_expected) * 100
```

**Data Source:**
- Analytics events table
- Event validation against schemas

**Pass Threshold:** 100% event completeness (all 12 events fire)

**Fail Threshold:** <95% (missing or malformed events)

**Measurement Method:** Automated validation against event schema

**Owner:** Analytics Architect

**Replication:**
```bash
# Validate all events against schema
npm run validate:analytics-schema

# Check for missing events in funnel
SELECT event_name, COUNT(*) as count
FROM analytics_events
WHERE session_id IN (SELECT DISTINCT session_id FROM analytics_events WHERE event_name='landing_view')
GROUP BY event_name
ORDER BY event_name;
```

**Confidence Score:** 0.99 (deterministic validation)

---

### KPI-008: Drop-off Rate

**Definition:** At which screen do users abandon the flow?

**Formula:**
```
Drop-off Rate = 
  (Sessions that reach screen X but not screen X+1) / 
  (Sessions that reach screen X) * 100
```

**Data Source:**
- Sequential event tracking

**Pass Threshold:** <10% drop-off at any screen

**Fail Threshold:** >20% drop-off at any screen (indicates UX problem)

**Measurement Method:** Funnel analysis

**Owner:** Product Manager

**Replication:**
```bash
# For each screen in sequence
SELECT 
  LEAD(event_name) OVER (PARTITION BY session_id ORDER BY created_at) as next_event,
  COUNT(*) as count
FROM analytics_events
WHERE event_name='card_selection_started'
GROUP BY next_event;
```

---

### KPI-009: Error Recovery Rate

**Definition:** What percentage of users who encounter an error successfully recover and complete the flow?

**Formula:**
```
Recovery Rate = 
  (Sessions with error_logged then save_prompted) / 
  (Sessions with error_logged) * 100
```

**Pass Threshold:** >80% recovery (system resilient)

**Fail Threshold:** <60% recovery (errors block completion)

**Owner:** QA Lead

---

## DERIVED KPIs

### Completion Rate (Funnel Efficiency)

```sql
SELECT 
  DATE(created_at) as day,
  COUNT(DISTINCT session_id) as sessions_started,
  COUNT(DISTINCT CASE WHEN event_name='first_insight_displayed' THEN session_id END) as reached_insight,
  COUNT(DISTINCT CASE WHEN event_name='save_prompted' THEN session_id END) as core_flow_complete,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_name='save_prompted' THEN session_id END) / 
    COUNT(DISTINCT session_id), 2) as completion_rate_pct
FROM analytics_events
GROUP BY DATE(created_at);
```

**Pass Threshold:** ≥70% overall completion

**Fail Threshold:** <50% completion

---

### Persona-Specific Metrics

Each KPI should be calculated per persona:

```sql
SELECT 
  CASE 
    WHEN event_data->>'persona_type' = 'first_timer' THEN 'First Timer'
    WHEN event_data->>'persona_type' = 'regular' THEN 'Regular'
    -- etc.
  END as persona,
  AVG(CAST(next_event_data->>'score' AS DECIMAL)) as avg_helpfulness,
  COUNT(DISTINCT session_id) as sample_size
FROM analytics_events ae
LEFT JOIN analytics_events ae2 ON ae.session_id = ae2.session_id 
  AND ae2.event_name='helpfulness_submitted'
WHERE ae.event_name='first_insight_displayed'
GROUP BY event_data->>'persona_type';
```

**Expectation:** Different personas should show measurably different patterns.
- Anxious persona: longer reading time (reassurance)
- Skeptic persona: more likely to continue reading (deeper analysis)
- Decision-maker: faster navigation, higher helpfulness score

---

## KPI Versioning

**Version 1.0.0 (2026-07-22):**
- Initial registry for Aşama 2 wireframe validation
- 9 KPIs defined (2 primary + 7 secondary)
- All KPIs tied to Tarot reading module

**Version 1.1.0 (Planned):**
- Add Dream Analysis module KPIs
- Add Journal module KPIs
- Add cross-module KPIs (cohesion, consistency)

---

## Validation Gates Using KPIs

| Gate | KPIs Required | Pass Condition |
|------|---------------|----------------|
| **Timing Gate** | KPI-001, KPI-002 | Both ≤ targets (90s, 120s) |
| **Quality Gate** | KPI-003 | ≥2.0/3.0 average |
| **Engagement Gate** | KPI-004 | ≥60% continue reading |
| **Persona Gate** | KPI-005 | ≥0.75 fit score |
| **Accessibility Gate** | KPI-006 | 100% pass rate |
| **Analytics Gate** | KPI-007 | 100% event completeness |
| **Funnel Gate** | KPI-008 | <10% drop-off at any screen |
| **Recovery Gate** | KPI-009 | >80% error recovery |
| **Completion Gate** | Completion Rate | ≥70% overall |

All gates must pass for GATEKEEPER approval.

---

## No Assumptions Rule

**Every KPI measurement must include:**
1. ✅ Definition (what are we measuring?)
2. ✅ Formula (how do we calculate it?)
3. ✅ Data source (where does the data come from?)
4. ✅ Confidence score (how confident are we? 0.0-1.0)
5. ✅ Known biases (what could make this measurement wrong?)
6. ✅ Replication steps (can someone else reproduce this exactly?)

**Never:**
- ❌ Assume a KPI passed because "it looked good"
- ❌ Mark PASS without measurements
- ❌ Skip validation because "we're sure it works"
- ❌ Use estimated numbers instead of measured numbers

---

## Next Steps

1. Implement KPI calculation scripts (Python/SQL)
2. Create dashboards that display all KPIs in real-time
3. Set up automated alerts if KPI thresholds breached
4. Integrate KPI validation into CI/CD pipeline
5. Create per-persona KPI tracking
