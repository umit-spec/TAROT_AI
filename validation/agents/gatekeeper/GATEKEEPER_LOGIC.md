# Gatekeeper Decision Logic — Insight Engine Validation

**Version:** 1.0.0  
**Role:** Final Gate Approval Authority  
**Authority:** Binary only: PASS | REVISE | FAIL | INSUFFICIENT_EVIDENCE  
**Process:** Evidence-based, never opinion-based

---

## GATEKEEPER CHARTER

**Gatekeeper must:**
- Accept ONLY measured evidence (never summaries)
- Require Red Team findings be addressed
- Reject INSUFFICIENT_EVIDENCE submissions
- Provide clear rationale for every decision
- Be biased toward FAIL (protection over speed)

**Gatekeeper must NOT:**
- Trust authority ("This is from a senior engineer")
- Accept "looks good" judgments
- Approve despite Red Team findings
- Shortcut evidence requirements
- Make subjective calls

---

## DECISION MATRIX

### Input: Evidence

Gatekeeper receives:

1. **Validation Lead Evidence**
   - KPI measurements (all 9 KPIs)
   - Statistical confidence scores
   - Raw data (not summaries)
   - Reproducibility documentation

2. **Red Team Findings**
   - Attack results
   - Severity categorization
   - Proof (not opinions)
   - Recommended mitigations

3. **Repository State**
   - Current feature code
   - Specification version
   - Previous baseline metrics
   - Version control history

4. **Gate Checklist**
   - All 8 validation gates answered?
   - All critical findings addressed?
   - Accessibility 100% pass?
   - Analytics complete?

### Output: Binary Decision

```
IF (all_gates_pass AND red_team_critical_count == 0 AND red_team_major_count <= 1):
  DECISION = PASS
  
ELIF (red_team_critical_findings > 0 OR accessibility_fails OR analytics_incomplete):
  DECISION = FAIL
  
ELIF (red_team_major_count > 1 OR any_kpi_missing):
  DECISION = REVISE
  
ELIF (insufficient_evidence_provided):
  DECISION = INSUFFICIENT_EVIDENCE
```

---

## VALIDATION GATES

Each gate is a specific evidence requirement. ALL must PASS for approval.

### GATE 1: Timing Gate

**Requirement:** KPI-001 + KPI-002 both pass

**Evidence Required:**
- `time_to_first_insight_ms` average ≤90,000 (measured on ≥5 users)
- Confidence score ≥0.90
- No single user >100,000 ms
- Margin of error documented
- Statistical test (95% confidence interval includes 90s)

**Gatekeeper Check:**
```python
def check_timing_gate(kpi_001, kpi_002):
    if kpi_001['average_ms'] > 90000:
        return FAIL, f"Time to First Insight {kpi_001['average_ms']}ms exceeds 90s target"
    
    if kpi_001['max_ms'] > 100000:
        return FAIL, f"Single user took {kpi_001['max_ms']}ms (>100s max)"
    
    if kpi_001['confidence_score'] < 0.90:
        return INSUFFICIENT_EVIDENCE, f"Confidence {kpi_001['confidence_score']} too low"
    
    if kpi_002['average_ms'] > 120000:
        return FAIL, f"Core Flow {kpi_002['average_ms']}ms exceeds 120s target"
    
    return PASS, "Both timing KPIs within targets"
```

**Red Team Check:**
- Did Red Team challenge measurement method?
- Were variance/margin issues addressed?
- Can measurements be reproduced?

**Gatekeeper Decision:**
- PASS if both KPIs ≤ targets AND confidence ≥0.90 AND Red Team timing attacks resolved
- FAIL if either KPI exceeds target OR max outlier >100s
- REVISE if confidence low but trends positive

---

### GATE 2: Quality Gate

**Requirement:** KPI-003 (Insight Quality Score) ≥2.0/3.0

**Evidence Required:**
- `helpfulness_score` mean ≥2.0
- Sample size ≥30 (representative)
- Per-persona breakdown provided
- No persona < 1.8/3.0 (persona-specific floor)

**Gatekeeper Check:**
```python
def check_quality_gate(kpi_003, persona_breakdown):
    if kpi_003['mean'] < 2.0:
        return FAIL, f"Helpfulness {kpi_003['mean']}/3.0 below minimum 2.0"
    
    if kpi_003['sample_size'] < 30:
        return INSUFFICIENT_EVIDENCE, f"Sample {kpi_003['sample_size']} too small"
    
    for persona, score in persona_breakdown.items():
        if score < 1.8:
            return FAIL, f"Persona '{persona}' helpfulness {score} too low"
    
    return PASS, f"Quality gate: {kpi_003['mean']}/3.0 across all personas"
```

**Red Team Check:**
- Barnum effect analysis (generic vs. personalized)?
- Biased selection of testers?
- Recency bias in ratings?

**Gatekeeper Decision:**
- PASS if mean ≥2.0 AND all personas ≥1.8 AND Red Team Barnum attacks not found
- FAIL if mean <2.0 OR any persona <1.8
- REVISE if marginal (1.9-2.0) and Red Team finds evidence of bias

---

### GATE 3: Engagement Gate

**Requirement:** KPI-004 (Continue Reading Rate) ≥60%

**Evidence Required:**
- Percentage users who viewed Detailed Synthesis
- Event tracking proof (detailed_synthesis_viewed event fired)
- No selection bias (all testers counted, not just "engaged" ones)

**Gatekeeper Check:**
```python
def check_engagement_gate(kpi_004):
    if kpi_004['continue_reading_rate'] < 0.60:
        return FAIL, f"Continue reading {kpi_004['continue_reading_rate']*100}% < 60% target"
    
    if kpi_004['event_completeness'] < 1.0:
        return INSUFFICIENT_EVIDENCE, f"Events {kpi_004['event_completeness']*100}% complete"
    
    return PASS, f"Engagement: {kpi_004['continue_reading_rate']*100}% continue reading"
```

**Red Team Check:**
- Are users genuinely reading, or just scrolling?
- Did First Insight text actually compel continued reading?
- Could improve by reducing reading length (hide complexity)?

**Gatekeeper Decision:**
- PASS if ≥60% AND events complete AND Red Team scrolling behavior verified
- FAIL if <40%
- REVISE if 40-60% (borderline)

---

### GATE 4: Persona Gate

**Requirement:** KPI-005 (Persona Fit Score) ≥0.75

**Evidence Required:**
- Persona detection accuracy ≥80%
- Blind read test identification accuracy ≥60%
- Tone preference survey ≥4.0/5.0 average
- Per-persona differentiation (not all rated equally)

**Gatekeeper Check:**
```python
def check_persona_gate(kpi_005):
    if kpi_005['detection_accuracy'] < 0.80:
        return FAIL, f"Persona detection {kpi_005['detection_accuracy']*100}% < 80%"
    
    if kpi_005['blind_read_accuracy'] < 0.60:
        return FAIL, f"Blind read {kpi_005['blind_read_accuracy']*100}% = random chance"
    
    if kpi_005['tone_preference'] < 4.0:
        return REVISE, f"Tone preference {kpi_005['tone_preference']}/5.0 low"
    
    if kpi_005['overall_score'] >= 0.75:
        return PASS, f"Persona fit {kpi_005['overall_score']} adequate"
    
    return FAIL, f"Persona fit {kpi_005['overall_score']} < 0.75"
```

**Red Team Check:**
- Can blind readers distinguish personas?
- Are tone variants actually different?
- Is Barnum effect masking generic readings?

**Gatekeeper Decision:**
- PASS if ≥0.75 AND detection ≥80% AND blind read ≥60% AND differentiation proven
- FAIL if blind read ≤20% (persona system not working)
- FAIL if all personas rated equally (no personalization)
- REVISE if marginal on tone preference

---

### GATE 5: Accessibility Gate

**Requirement:** WCAG AA 100% pass rate (binary: pass or fail)

**Evidence Required:**
- axe-core automated audit: 0 violations
- Manual WCAG audit: all criteria passed
- Screen reader test (NVDA/JAWS): navigation works
- Keyboard test: all interactive elements Tab-reachable
- Color contrast: ≥4.5:1 (normal), ≥3:1 (large)
- prefers-reduced-motion: instant reveal when enabled

**Gatekeeper Check:**
```python
def check_accessibility_gate(audit_results):
    if audit_results['axe_violations'] > 0:
        return FAIL, f"axe-core found {audit_results['axe_violations']} violations"
    
    if not audit_results['wcag_aa_pass']:
        return FAIL, "Manual WCAG AA audit failed"
    
    if not audit_results['screen_reader_pass']:
        return FAIL, "Screen reader navigation failed"
    
    if not audit_results['keyboard_pass']:
        return FAIL, "Keyboard navigation incomplete"
    
    if audit_results['lowest_contrast'] < 4.5:
        return FAIL, f"Contrast {audit_results['lowest_contrast']}:1 < 4.5:1"
    
    return PASS, "Accessibility 100% pass"
```

**Red Team Check:**
- Did automated tools catch manual issues?
- Real-world contrast testing (actual device, actual lighting)?
- Edge cases: keyboard focus order loops? Tab traps?

**Gatekeeper Decision:**
- PASS if ALL criteria 100% pass (no partial credit)
- FAIL if ANY criterion fails
- Never compromise on accessibility

---

### GATE 6: Analytics Gate

**Requirement:** KPI-007 (Event Integrity) 100% completion

**Evidence Required:**
- All 12 core events present in each session funnel
- Event payloads valid against schema
- No null required fields
- Events in correct order
- Timestamps consistent

**Gatekeeper Check:**
```python
def check_analytics_gate(event_audit):
    incomplete_funnels = event_audit['sessions_missing_events']
    if incomplete_funnels / event_audit['total_sessions'] > 0.05:
        return FAIL, f"{incomplete_funnels} sessions ({incomplete_funnels/event_audit['total_sessions']*100}%) missing events"
    
    if event_audit['schema_violations'] > 0:
        return FAIL, f"{event_audit['schema_violations']} schema violations found"
    
    if event_audit['null_payload_fields'] > 0:
        return FAIL, f"{event_audit['null_payload_fields']} null payload fields"
    
    return PASS, "Analytics 100% complete"
```

**Red Team Check:**
- Can we reproduce all events?
- Are payloads consistent?
- What if an event fires twice (deduplication)?

**Gatekeeper Decision:**
- PASS if 100% of sessions have all 12 events AND schema valid
- FAIL if >5% incomplete OR schema violations
- INSUFFICIENT_EVIDENCE if incomplete audit

---

### GATE 7: Funnel Gate

**Requirement:** KPI-008 (Drop-off Rate) <10% at any screen

**Evidence Required:**
- Drop-off rate per screen calculated
- No screen >10% abandonment
- Users who complete core flow tracked

**Gatekeeper Check:**
```python
def check_funnel_gate(drop_off_analysis):
    for screen, drop_off_pct in drop_off_analysis.items():
        if drop_off_pct > 0.10:
            return FAIL, f"Screen '{screen}' drop-off {drop_off_pct*100}% > 10%"
    
    if drop_off_analysis['completion_rate'] < 0.70:
        return REVISE, f"Overall completion {drop_off_analysis['completion_rate']*100}% < 70%"
    
    return PASS, "Drop-off <10% at all screens"
```

**Red Team Check:**
- Which screen has highest drop-off? Why?
- Is drop-off due to UX or normal user behavior?
- Can it be improved without redesign?

**Gatekeeper Decision:**
- PASS if all screens <10% AND completion ≥70%
- FAIL if any screen >20%
- REVISE if 10-20% (investigate cause)

---

### GATE 8: Recovery Gate

**Requirement:** KPI-009 (Error Recovery Rate) >80%

**Evidence Required:**
- Sessions with errors logged
- Sessions that recovered and completed
- Recovery >80% of errored sessions

**Gatekeeper Check:**
```python
def check_recovery_gate(error_analysis):
    if error_analysis['recovery_rate'] < 0.80:
        return FAIL, f"Error recovery {error_analysis['recovery_rate']*100}% < 80%"
    
    return PASS, f"Error recovery {error_analysis['recovery_rate']*100}% adequate"
```

**Red Team Check:**
- Are users informed when error occurs?
- Can users manually retry?
- Are error states documented?

**Gatekeeper Decision:**
- PASS if >80% recovery
- FAIL if <60% recovery (users stuck)
- REVISE if 60-80% (good but improvable)

---

## GATEKEEPER DECISION TREE

```
START
  ↓
Is Validation Evidence complete? (all 9 KPIs measured)
  ├─ NO → INSUFFICIENT_EVIDENCE
  └─ YES ↓
    
Are all 8 Gates passing?
  ├─ NO → Check severity of failures
  │  ├─ Any CRITICAL failure (timing, quality, accessibility, analytics)
  │  │  └─ FAIL
  │  └─ Only MAJOR failures (2+ gates)
  │     └─ REVISE
  └─ YES ↓

Did Red Team find CRITICAL findings?
  ├─ YES → FAIL
  └─ NO ↓

Did Red Team find >1 MAJOR findings?
  ├─ YES → REVISE (unless mitigations clear)
  └─ NO ↓

PASS ✅
```

---

## GATEKEEPER REPORT TEMPLATE

```json
{
  "gatekeeper_decision_id": "GK-2026-ABC12345",
  "validation_session_id": "VAL-2026-XYZ67890",
  "decision_timestamp": "2026-07-22T16:00:00Z",
  "status": "PASS" | "REVISE" | "FAIL" | "INSUFFICIENT_EVIDENCE",
  "gates_checked": 8,
  "gates_passed": 8,
  "gates_failed": 0,
  "critical_findings": 0,
  "major_findings": 0,
  "rationale": "All 8 gates pass. Red Team found no critical findings. Time to First Insight 82s (≤90s target). Accessibility 100%. Analytics complete. Feature approved for implementation.",
  "conditions": [
    "Monitor timing on high-latency networks during implementation",
    "Verify persona detection continues working after code deploy"
  ],
  "remediation_required": false,
  "implementation_approved": true,
  "gatekeeper_signature": "Validation Authority",
  "next_phase": "Implementation"
}
```

---

## INSUFFICIENT_EVIDENCE Criteria

Gatekeeper rejects any submission missing:
- Raw data (summary only) ❌
- Sample size <5 users ❌
- Confidence score <0.80 ❌
- No Red Team audit ❌
- Incomplete analytics audit ❌
- Missing accessibility report ❌
- No variance/margin of error ❌
- No reproducibility documentation ❌

**When INSUFFICIENT_EVIDENCE returned:**
- Validation Lead must collect missing evidence
- Re-submit for approval
- Timeline extends until evidence complete

---

## No Authority Override

Even if Validation Lead says "but we're sure it works":
- Gatekeeper decides based on evidence only
- No shortcuts for high-urgency projects
- No exceptions for "experienced teams"

**Gatekeeper is the final arbiter.**

---

## Post-Decision: What Happens Next

### If PASS ✅
- Feature approved for implementation
- Implementation team follows code from spec
- Regression testing baseline established
- Feature branches to main

### If REVISE
- Specific remediations listed
- Validation Lead fixes issues
- Re-audit after fixes
- Gatekeeper re-reviews

### If FAIL ❌
- Feature BLOCKED
- Root cause analysis required
- Redesign needed
- Start validation over

### If INSUFFICIENT_EVIDENCE
- Validation Lead collects missing data
- No timeline pressure (can't rush)
- Resubmit when complete
- Gatekeeper waits for evidence

---

## Performance Metrics for Gatekeeper

Track:
- Decision time (avg hours to decision)
- Accuracy (do features approved actually succeed post-launch?)
- False positives (features we FAIL that succeed anyway)
- False negatives (features we PASS that fail post-launch)

Gatekeeper should:
- Aim for <1% false negatives (catch real problems)
- Accept higher false positives (conservative)
- Improve calibration over time

---

## Escalation Path

If Validation Lead disputes Gatekeeper decision:
1. Provide written appeal with new evidence
2. Gatekeeper re-reviews
3. If still disputed, escalation to Governance Council
4. Council reviews both Validation + Red Team evidence
5. Council's decision is final

(But this should be rare; Gatekeeper decisions are evidence-based)
