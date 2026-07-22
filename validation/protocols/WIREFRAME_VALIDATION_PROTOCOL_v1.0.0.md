# Wireframe Validation Protocol v1.0.0

**Specification Version:** AŞAMA_2_WIREFRAME_SPEC.md v1.0.0  
**Protocol Version:** 1.0.0  
**Effective Date:** 2026-07-22  
**Executed By:** Validation Lead  
**Validated By:** Red Team  
**Approved By:** Gatekeeper

---

## PROTOCOL SCOPE

This protocol validates that wireframe designs meet Aşama 2 PASS criteria:
- ✅ Time to First Insight ≤90 sec (5 users)
- ✅ Core Flow Completion ≤120 sec (5 users)
- ✅ Accessibility WCAG AA 100%
- ✅ 12 Funnel events complete
- ✅ Persona variations documented
- ✅ No Magic test passed

---

## PHASE 1: PROTOCOL SETUP (Day 1)

### Checklist

- [ ] Create validation session ID: `VAL-2026-[8-CHAR-ID]`
- [ ] Clone specification version
- [ ] Prepare test environment
- [ ] Recruit 5 test users (1 per persona):
  - [ ] User 1: First-timer (new to tarot, curious)
  - [ ] User 2: Regular (previous tarot experience)
  - [ ] User 3: Anxious (mentions stress/worry)
  - [ ] User 4: Decision-maker (specific goal, time-bound)
  - [ ] User 5: Skeptic (asks "does this really work?")
- [ ] Set up stopwatch + screen recording
- [ ] Prepare analytics dashboard access
- [ ] Brief facilitator on observation protocol

### User Recruitment Template

```
Subject: Tarot Wireframe Testing (45 minutes, $50 incentive)

Hi [NAME],

We're testing a new tarot reading interface and need your feedback. 
No experience required.

Session will include:
- Brief intro to wireframe concept
- Your going through the flow (stopwatch: we measure your time)
- Short feedback survey
- Your preferred reading topic (relationship, career, mood, general)

Time: [DATE] [TIME]
Duration: 45 minutes
Compensation: $50 gift card

Can you make it?
```

### Test Environment Setup

```bash
# 1. Clone specification
git clone -b claude/tarot-ai-mvp-setup-h2fyf7 https://repo/tarot-ai
cd tarot-ai

# 2. Open analytics dashboard (local)
npm run dashboard:analytics

# 3. Prepare wireframe (Figma or SVG)
# Ensure all 9-10 screens clickable

# 4. Start event listener
npm run validate:analytics-events

# 5. Load analytics schema validator
npm run validate:schema -- validation/schemas/validation.schema.json
```

---

## PHASE 2: TIMING TEST (Day 2-3)

### Session Protocol

**Per user, repeat 5 times:**

1. **Landing Screen (0 sec start)**
   - [ ] User sees landing, hero, CTA "Başla"
   - [ ] START stopwatch
   - [ ] User clicks "Başla"
   - [ ] Event: `landing_view` fired
   - [ ] RECORD: Time to click = ___ sec

2. **Topic Selection (8 sec window)**
   - [ ] User sees 4 topic cards
   - [ ] User selects one (e.g., "relationship")
   - [ ] Event: `topic_selected` fired
   - [ ] RECORD: Time from landing = ___ sec (target: ≤8 sec)

3. **Merged Questions (25 sec window)**
   - [ ] User sees Question 1 of 3
   - [ ] User reads, chooses answer
   - [ ] Question 2 appears
   - [ ] User answers Q2
   - [ ] Question 3 appears
   - [ ] User answers Q3
   - [ ] Event: `questions_completed` fired
   - [ ] Inline spread recommendation appears
   - [ ] Event: `spread_inline_recommended` fired
   - [ ] RECORD: Questions time = ___ sec (target: ≤25 sec)

4. **Spread Confirmation (5 sec window)**
   - [ ] User sees "System recommends 3-card spread"
   - [ ] User clicks "Accept"
   - [ ] Event: `spread_confirmed` fired
   - [ ] RECORD: Time to decide = ___ sec (target: ≤5 sec)

5. **Card Selection (18 sec window)**
   - [ ] User sees deck (78 cards in grid)
   - [ ] User taps Position 1 card
   - [ ] User taps Position 2 card
   - [ ] User taps Position 3 card
   - [ ] "Reveal" button enabled
   - [ ] User clicks "Reveal"
   - [ ] Event: `cards_selected` fired
   - [ ] RECORD: Card selection time = ___ sec (target: ≤18 sec)

6. **Shuffle Animation (4 sec window)**
   - [ ] Cards shuffle/animate
   - [ ] Cards flip to reveal faces
   - [ ] Event: `shuffle_animation_played` fired
   - [ ] RECORD: Animation duration = ___ sec (target: 4 sec)

7. **First Insight Display (12 sec window + PRIMARY KPI)**
   - [ ] First Insight section appears with text (~50 words)
   - [ ] Event: `first_insight_displayed` fired
   - [ ] TIMESTAMP this moment
   - [ ] User reads silently
   - [ ] RECORD: `time_to_delivery_ms` = ___ ms
   - [ ] **CRITICAL**: This timestamp minus landing timestamp = Time to First Insight
   - [ ] **TARGET: ≤90 sec from landing to this point**
   - [ ] User has read time = ___ sec (user reads at natural pace)

8. **Detailed Synthesis (25 sec window, unmeasured)**
   - [ ] User scrolls or proceeds to full reading
   - [ ] Event: `detailed_synthesis_viewed` fired
   - [ ] User reads naturally (no time pressure)
   - [ ] RECORD: User notes on reading quality

9. **Helpfulness Rating (5 sec window)**
   - [ ] User sees "How helpful?" with 1-3 scale
   - [ ] User selects score (1/2/3)
   - [ ] Event: `helpfulness_submitted` fired
   - [ ] RECORD: Score, any notes

10. **Save Prompt (5 sec window, CORE FLOW ENDS)**
    - [ ] User sees "Save this reading?"
    - [ ] User clicks "Save" or "Maybe Later"
    - [ ] Event: `save_prompted` fired
    - [ ] STOP stopwatch
    - [ ] RECORD: Total time from landing = ___ sec
    - [ ] **TARGET: ≤120 sec core flow**

### Timing Data Collection Template

```csv
user_id,persona,topic,
landing_to_topic_sec,topic_to_questions_sec,
questions_time_sec,spread_decision_sec,
card_selection_sec,shuffle_sec,
first_insight_ms,
TOTAL_TIME_TO_FIRST_INSIGHT_SEC,
detailed_synthesis_sec,helpfulness_sec,save_sec,
TOTAL_CORE_FLOW_SEC,
helpfulness_score

USER_1,first_timer,relationship,
7,8,22,4,18,4,
82000,
82,28,3,5,
120,3
```

### Timing Analysis

**Post-test:**

```bash
# Calculate averages
python3 validation/scripts/calculate_timing_kpis.py \
  --data timing_results.csv \
  --output timing_analysis.json

# Expected output:
# {
#   "time_to_first_insight": {
#     "average_ms": 82000,
#     "max_ms": 97000,
#     "min_ms": 76000,
#     "stdev_ms": 8000,
#     "pass": true,
#     "confidence_score": 0.95
#   },
#   "core_flow_time": {
#     "average_ms": 115000,
#     "max_ms": 128000,
#     "pass": true
#   }
# }
```

---

## PHASE 3: CLARITY TEST (Day 2-3, concurrent)

**For each user after timing test:**

Ask:
1. "Did you understand what each screen was asking you to do?"
2. "Were the questions natural or did they feel like a test?"
3. "When you saw the spread recommendation, was it clear?"
4. "After seeing the reading, did it connect to your question?"

RECORD: Notes (subjective feedback)

**Success Criteria:**
- ✅ All users understood wireframe purpose
- ✅ Questions felt like conversation
- ✅ No confusion at any screen
- ✅ Reading felt relevant

---

## PHASE 4: ACCESSIBILITY AUDIT (Day 3-4)

### Automated Audit

```bash
npm run test:accessibility -- wireframes/

# Runs axe-core on all wireframe files
# Output: accessibility_report.json
# PASS if: 0 violations
```

### Manual Accessibility Test

**Touch Targets (44×44 px minimum)**
- [ ] Landing "Başla" button: ___ × ___ px ✅
- [ ] Topic cards: each ___ × ___ px ✅
- [ ] Question answer buttons: ___ × ___ px ✅
- [ ] Card positions: each ___ × ___ px ✅
- [ ] Spread decision buttons: ___ × ___ px ✅
- [ ] Helpfulness rating buttons: ___ × ___ px ✅
- [ ] Save decision buttons: ___ × ___ px ✅

**One-Handed Mobile Test**
- [ ] Hold phone in right hand only (left thumb)
  - [ ] Can reach top buttons?
  - [ ] Can reach middle buttons?
  - [ ] Can reach bottom buttons?
- [ ] Hold phone in left hand only (right thumb)
  - [ ] Repeat test
- RECORD: Any hard-to-reach areas

**Color Contrast (axe-core + manual)**
```bash
npm run test:contrast

# Verify:
# - Text vs background ≥4.5:1
# - Large text (>18pt) ≥3:1
# - Icons ≥3:1
```

**Keyboard Navigation**
```bash
# On each screen, Tab through all interactive elements
# Record Tab order:

Landing:
  [ ] Logo → [1]
  [ ] CTA "Başla" → [2]
  [ ] Expected order: Logo, CTA
  
Topic Selection:
  [ ] Topic 1 → [1]
  [ ] Topic 2 → [2]
  [ ] Topic 3 → [3]
  [ ] Topic 4 → [4]
  [ ] Expected order: Left-to-right, top-to-bottom
```

**Screen Reader (NVDA on Windows, VoiceOver on macOS)**
```bash
# Verify:
# - Card names announced ("The Magician")
# - Button labels clear ("Accept spread recommendation")
# - Form fields labeled
# - Headings announced
```

### Accessibility Report

```json
{
  "automated_violations": 0,
  "manual_failures": 0,
  "touch_targets_pass": true,
  "one_handed_pass": true,
  "keyboard_pass": true,
  "screen_reader_pass": true,
  "wcag_aa_pass": true,
  "status": "PASS"
}
```

---

## PHASE 5: ANALYTICS VALIDATION (Day 4)

### Event Completeness Audit

```sql
-- For each test session, verify all 12 events
SELECT 
  session_id,
  COUNT(DISTINCT event_name) as event_count,
  GROUP_CONCAT(DISTINCT event_name) as events_fired
FROM analytics_events
WHERE session_id IN (SELECT DISTINCT session_id FROM test_sessions)
GROUP BY session_id
HAVING COUNT(DISTINCT event_name) = 12;

-- PASS if all test sessions have all 12 events
```

### Schema Validation

```bash
npm run validate:analytics-schema -- test_sessions.json

# Verify each event payload matches schema
# FAIL if any: null required fields, wrong types, missing properties
```

### Event Order Validation

```bash
# Verify events fire in correct order:
# landing_view → topic_selected → questions_started → 
# questions_completed → spread_confirmed → cards_selected → 
# shuffle_animation_played → first_insight_displayed → 
# detailed_synthesis_viewed → helpfulness_submitted → save_prompted

npm run validate:event-sequence -- test_sessions.json
```

### Analytics Report

```json
{
  "test_sessions": 5,
  "sessions_with_complete_funnel": 5,
  "completeness_pct": 100,
  "schema_violations": 0,
  "event_order_violations": 0,
  "null_payload_fields": 0,
  "analytics_gate": "PASS"
}
```

---

## PHASE 6: PERSONA VALIDATION (Day 4-5)

### Persona Detection Accuracy

```
For each test user:
- [ ] System detected persona: ___________
- [ ] User self-reported persona: ___________
- [ ] Match? YES / NO

Calculate: 5 matches / 5 users = 100% detection accuracy
Target: ≥80%
```

### Blind Read Test

```
Generate 5 readings (same 3 cards, 5 different personas).
Show to 10 independent readers (no persona labels).

"Which persona type do you think this reading is for?"
Options: A) First-timer, B) Regular, C) Anxious, D) Decision-maker, E) Skeptic

Expected: ≥60% correct identification
Random chance: 20%

If <25% accuracy → persona system not working
```

### Tone Preference Survey

After reading, ask each user:
"Did this reading's tone feel suited to you?"
1 = Not at all
5 = Perfectly suited

Target: ≥4.0/5.0 average per persona

---

## PHASE 7: "NO MAGIC" TEST (Day 5)

**For each screen, ask: "If this disappeared, would UX break?"**

| Screen | Essential? | Reason | Remove? |
|--------|------------|--------|---------|
| Landing | YES | Value prop needed | NO |
| Topic Selection | YES | Determines context | NO |
| Questions | YES | Persona detection | NO |
| Card Selection | YES | Ritual matters | NO |
| Shuffle | MAYBE | Nice-to-have | CONSIDER |
| First Insight | YES | Primary KPI | NO |
| Detailed Synthesis | YES | Full reading | NO |
| Helpfulness | YES | Metrics needed | NO |
| Save Prompt | YES | Conversion funnel | NO |
| Premium Modal | MAYBE | Post-session upsell | DEFERRED |

**PASS if:** All core screens (9) justified; Shuffle + Premium optional.

---

## PHASE 8: RED TEAM AUDIT (Day 6)

**Red Team runs independent attacks:**

- [ ] Timing measurements reproducible?
- [ ] Persona detection actually works?
- [ ] Barnum effect present?
- [ ] Analytics complete?
- [ ] Accessibility passes real-world test?
- [ ] Edge cases handled?

Red Team produces: RED_TEAM_FINDINGS.json

---

## PHASE 9: GATEKEEPER DECISION (Day 7)

Gatekeeper receives:
1. Validation Lead evidence (all phases 1-8)
2. Red Team findings
3. Analytics report
4. Accessibility report

Gatekeeper decides: PASS | REVISE | FAIL | INSUFFICIENT_EVIDENCE

---

## VALIDATION SESSION ARCHIVE

All evidence archived:

```
validation/reports/
└── VAL-2026-ABC12345/
    ├── VALIDATION_SESSION.md (this protocol instance)
    ├── timing_results.csv
    ├── timing_analysis.json
    ├── accessibility_report.json
    ├── analytics_events.json (all events from test)
    ├── clarity_feedback.md
    ├── persona_detection_audit.md
    ├── blind_read_results.md
    ├── red_team_findings.json
    ├── GATEKEEPER_DECISION.json
    └── archive_metadata.json
```

---

## Success Criteria

**Validation Lead PASS if:**
- ✅ Time to First Insight ≤90 sec average
- ✅ Core Flow ≤120 sec average
- ✅ Accessibility 100%
- ✅ Analytics 12/12 events
- ✅ Clarity test passed (users understood)
- ✅ Persona validation ≥0.75
- ✅ No Magic test passed

**Red Team PASS if:**
- ✅ No critical findings
- ✅ ≤1 major finding (manageable)
- ✅ All attacks survived scrutiny

**Gatekeeper PASS if:**
- ✅ Both Validation Lead + Red Team pass
- ✅ All gates met
- ✅ Evidence complete

---

## Failure Path

If any measure FAILS:
1. Document failure reason
2. Redesign affected screen/flow
3. Re-run protocol
4. No shortcuts, no waiving

Timeline: +3-5 days per redesign cycle

---

## CI/CD Integration

```yaml
# .github/workflows/wireframe-validation.yml
name: Wireframe Validation Gate

on: pull_request

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate Analytics Schema
        run: npm run validate:schema -- validation/schemas/validation.schema.json
      
      - name: Accessibility Audit
        run: npm run test:accessibility -- wireframes/
      
      - name: Event Completeness Check
        run: npm run validate:analytics-events
      
      - name: Timing KPI Validation
        run: npm run validate:kpi -- kpi/KPI_REGISTRY.md
      
      - name: Generate Validation Report
        run: npm run report:validation
```

This protocol is deterministic, reproducible, and evidence-driven.

No shortcuts. No assumptions. Only measurements.
