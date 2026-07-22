# Red Team Playbook — Insight Engine Validation

**Version:** 1.0.0  
**Status:** Active  
**Mission:** Prove the Validation Lead wrong. Attack every assumption.

---

## RED TEAM CHARTER

The Red Team's purpose is **independent skepticism**.

We assume Validation Lead is biased toward PASS.

Our job:
- Test for measurement manipulation
- Expose confirmation bias
- Challenge statistical confidence
- Find hidden failure modes
- Verify reproducibility
- Question persona assumptions
- Audit AI safety claims
- Test edge cases

We produce **Red Team Findings** (never approval).

---

## ATTACK MATRIX

| Category | Severity | Attack | Proof Required | Expected Finding |
|----------|----------|--------|-----------------|------------------|
| **Measurement** | Critical | Clock skew in timing | Alternate timer, margin analysis | Time measurements ±5% outside margin |
| **Measurement** | Critical | Sample size too small | Statistical power analysis | N < 5 insufficient for >90% confidence |
| **Measurement** | Major | Selection bias in users | Demographic audit vs. target | Testers skew to X persona, not representative |
| **Analytics** | Critical | Missing events in funnel | Complete event log audit | Event drops or payloads malformed |
| **Analytics** | Major | Data validation gaps | Schema violation check | Events missing required fields |
| **Persona** | Critical | Persona detection fails silently | Cross-reference detected vs. actual | Detected persona wrong >30% of time |
| **Persona** | Major | Tone variants indistinguishable | A/B blind read test | Readers can't identify which tone |
| **Accessibility** | Critical | WCAG failure uncaught | Full audit with NVDA/JAWS | Automated audit missed issues |
| **Psychology** | Critical | Barnum effect | Specific vs. generic reading test | Generic text rated equally as personalized |
| **Psychology** | Major | Recency bias | Time-series analysis | Recent reading disproportionately rated |
| **AI Safety** | Critical | Prohibited phrases in output | Content scan of all readings | Kesin kehanet or health advice found |
| **AI Safety** | Major | AI hallucination | Claude consistency test | Same input → different outputs |
| **Performance** | Major | Timing includes network delay | Network-isolated test | Time 15% higher on slower connection |
| **Regression** | Critical | Baseline broken by change | Version comparison | Metrics regressed vs. previous version |

---

## ATTACK 1: MEASUREMENT MANIPULATION

**Goal:** Prove timing measurements are unreliable.

**Attack Surface:**
- Timestamp precision (server vs. client time)
- Network latency included in measurement
- Event ordering ambiguity
- Clock skew across systems

**Test Case:**
1. Run same session 10x on isolated network
2. Compare time_to_first_insight ±variance
3. If variance >5%, measurement unreliable

**Expected Finding:** "Timing variance ±8% depending on device performance; 90-sec target includes network uncertainty"

**Severity:** MAJOR (affects timing gates)

**Required Proof:**
- Stopwatch measurements on 5+ devices
- Network latency log
- Statistical confidence interval

**Mitigation if Found:**
- Increase target thresholds by variance margin
- Measure on controlled network
- Use percentile (p95) instead of average

---

## ATTACK 2: CONFIRMATION BIAS

**Goal:** Prove Validation Lead cherry-picked favorable results.

**Attack Surface:**
- Selected only 5 "good" testers from pool of 20
- Ignored high time-to-insight users
- Excluded persona types with low helpfulness
- Reported average instead of p95

**Test Case:**
1. Request raw data from all testers (not just sample of 5)
2. Analyze full distribution, not just mean
3. Calculate p50, p95, max
4. Check if "failed" sessions were included

**Expected Finding:** "P95 time to first insight = 105 sec (exceeds 90-sec target); sample of 5 excluded slowest user"

**Severity:** CRITICAL (invalidates entire validation)

**Required Proof:**
- Full raw data (not summary)
- Statistical analysis of distribution
- Demographic breakdown of testers

**Mitigation if Found:**
- Re-run with larger, representative sample
- Report p95, not just average
- Include all testers, no filtering

---

## ATTACK 3: PERSONA CONFUSION

**Goal:** Prove persona detection doesn't work; all readings feel generic.

**Attack Surface:**
- Persona detection algorithm incorrect
- Tone variants too subtle
- Reading generation identical regardless of persona
- Users perceive no difference

**Test Case 1: Blind Read Test**
1. Generate 5 readings from same cards
2. One per persona (first_timer, regular, anxious, decision_maker, skeptic)
3. Show to 10 independent readers (no context)
4. Can they identify the persona? (random guess = 20%)
5. Target: >60% identification accuracy

**Test Case 2: Persona Detection Audit**
1. Run intake questions with 10 testers
2. Compare system-detected persona vs. self-reported
3. Accuracy must be >80%

**Expected Finding:** "Persona detection 45% accurate; tone variants sound identical; generic reading regardless of persona"

**Severity:** CRITICAL (persona system core feature)

**Required Proof:**
- Blind read test results
- Persona detection accuracy log
- Text analysis of tone differences (TF-IDF, sentiment analysis)

**Mitigation if Found:**
- Redesign persona detection algorithm
- Rewrite reading templates per persona
- Include explicit persona cues in readings

---

## ATTACK 4: ANALYTICS INTEGRITY

**Goal:** Prove analytics events are missing, delayed, or malformed.

**Attack Surface:**
- Events fire out of order
- Timestamps inconsistent
- Payloads missing required fields
- Some users have incomplete funnel

**Test Case:**
1. Validate all sessions against event schema
2. Check that all 12 core events are present
3. Verify payload fields complete
4. Check for event order violations

**Query:**
```sql
-- Check for incomplete funnels
SELECT session_id, COUNT(DISTINCT event_name) as event_count
FROM analytics_events
WHERE event_name IN (
  'landing_view', 'topic_selected', 'questions_started', 'questions_completed',
  'spread_confirmed', 'cards_selected', 'shuffle_animation_played',
  'first_insight_displayed', 'detailed_synthesis_viewed',
  'helpfulness_submitted', 'save_prompted'
)
GROUP BY session_id
HAVING COUNT(DISTINCT event_name) < 11
ORDER BY event_count DESC;

-- Check for null payloads
SELECT event_name, COUNT(*) as null_payload_count
FROM analytics_events
WHERE event_data IS NULL OR event_data = '{}'
GROUP BY event_name;
```

**Expected Finding:** "1200 of 5000 sessions (24%) missing required events; helpfulness_submitted missing in 15% of cases"

**Severity:** CRITICAL (analytics gate fails)

**Required Proof:**
- Complete event audit log
- SQL query results
- Schema validation report

**Mitigation if Found:**
- Implement pre-save event validation (no save if events incomplete)
- Add monitoring alerts for missing events
- Re-run validation with complete event set

---

## ATTACK 5: BARNUM EFFECT

**Goal:** Prove reading feels "personal" only because of psychological priming, not because persona system works.

**Attack Surface:**
- Generic advice felt specific
- Users read own meaning into ambiguous text
- All personas rate reading equally high
- Helpfulness rating doesn't correlate with persona fit

**Test Case 1: Generic vs. Personalized**
1. Take 5 readings generated for persona X
2. Present to 10 users from different persona types
3. Ask: "How much did this reading apply to you?" (1-5)
4. If all rate equally high (≥3.5), Barnum effect present

**Test Case 2: Persona Correlation**
1. Compare helpfulness_score by persona
2. Expected: Anxious persona rates higher than skeptic
3. If all equal or inverted, persona system not working

**Expected Finding:** "All personas rate reading 3.5/5 equally; no correlation between persona and helpfulness"

**Severity:** MAJOR (persona value questionable)

**Required Proof:**
- Blind test results
- Helpfulness by persona breakdown
- Statistical test (Chi-square)

**Mitigation if Found:**
- Redesign reading generation with more explicit persona differentiation
- Add persona-specific keywords/framing
- Test with domain experts (experienced tarot readers)

---

## ATTACK 6: AI HALLUCINATION

**Goal:** Prove Claude is inventing meanings, not using deterministic card meanings.

**Attack Surface:**
- Same cards produce different readings on different days
- Prohibited phrases slip through despite system prompt
- Reading contradicts stored card meaning
- AI generates interpretation not in knowledge base

**Test Case:**
1. Feed Claude same 3 cards + context 10x
2. Generate 10 readings
3. Check for output consistency
4. Verify against Layer 1 (deterministic) meanings
5. Scan for prohibited phrases

**Query:**
```bash
# Check for prohibited phrases in all readings
grep -ri "kesin kehânet\|definitivly will\|medical advice\|legal opinion" readings/

# Compare Layer 1 meaning vs. Layer 3 output
SELECT card_id, base_meaning, ai_generated_text
FROM readings
WHERE ai_generated_text NOT LIKE CONCAT('%', base_meaning, '%');
```

**Expected Finding:** "7 of 10 readings contradict stored card meanings; 3 readings contain 'kesin kehânet' (certain prediction) language"

**Severity:** CRITICAL (AI safety gate fails)

**Required Proof:**
- Consistency test results
- Prohibited phrase scan
- Meaning comparison audit

**Mitigation if Found:**
- Add retrieval-augmented generation (RAG) to Layer 3
- Enforce card meaning inclusion in Claude system prompt
- Add post-generation validation against meanings
- Implement phrase filtering (string match before output)

---

## ATTACK 7: ACCESSIBILITY GAPS

**Goal:** Prove accessibility audit missed real WCAG violations.

**Attack Surface:**
- Automated tools (axe-core) miss manual issues
- Color contrast fails in real-world conditions
- Keyboard navigation has edge cases
- Screen reader announces wrong labels

**Test Case:**
1. Run full WCAG AA audit with NVDA (Windows)
2. Run with JAWS (alternate screen reader)
3. Manual keyboard navigation test
4. Check color contrast with tools + real eyes

**Expected Finding:** "Save button contrast 2.8:1 (fails 4.5:1 requirement); Tab order loops infinitely on card selection screen"

**Severity:** CRITICAL (accessibility gate = binary pass/fail)

**Required Proof:**
- NVDA audit transcript
- Keyboard navigation test log
- Color contrast measurements
- Photos of real contrast issues

**Mitigation if Found:**
- Redesign failing elements
- Re-run full accessibility suite
- Get accessibility specialist sign-off

---

## ATTACK 8: REGRESSION DETECTION

**Goal:** Prove current version broke a previous KPI.

**Attack Surface:**
- Timing got slower vs. v0.9
- Helpfulness dropped
- Drop-off rate increased
- New bugs introduced

**Test Case:**
1. Get baseline metrics from previous release
2. Run same test on current version
3. Compare KPI by KPI
4. Identify regressions

**Expected Finding:** "Time to First Insight regressed from 78s (v0.9) to 95s (v1.0); +22% slower due to new animation"

**Severity:** CRITICAL (indicates quality degradation)

**Required Proof:**
- Previous baseline metrics
- Current test results
- Diff analysis per KPI

**Mitigation if Found:**
- Identify what changed (code diff)
- Optimize or revert
- Re-test

---

## ATTACK 9: EDGE CASE FAILURES

**Goal:** Prove validation only tested happy path; edge cases break.

**Attack Surface:**
- Very fast users (sub-30 sec total)
- Very slow users (>3 min total)
- Network failures mid-session
- Card selection misclicks
- Multiple rapid taps
- Long reading text causing overflow

**Test Case:**
1. Force timeout scenarios (network down at each step)
2. Rapid-tap card selection (100 taps/sec)
3. Extremely slow network (2G)
4. Large text rendering (browser zoom 200%)
5. Mobile on 3G connection

**Expected Finding:** "Network timeout during card selection leaves session orphaned; no recovery path; user can't proceed"

**Severity:** MAJOR (error recovery gate fails)

**Required Proof:**
- Reproduction steps
- Error logs
- Session state at failure
- Recovery verification (can user continue?)

**Mitigation if Found:**
- Add resilience (retry logic, session recovery)
- Handle errors gracefully (show message, not crash)
- Test error paths explicitly

---

## ATTACK SEVERITY LEVELS

**CRITICAL** (Blocks PASS)
- Timing measurements invalid
- Persona system doesn't work
- Analytics incomplete
- AI safety compromised
- Accessibility fails

**MAJOR** (Requires mitigation)
- Barnum effect dominating results
- Edge cases crash
- Performance regressed
- Recovery rate low

**MINOR** (Nice-to-have fix)
- Polish issues
- Messaging unclear
- Design tweaks

---

## RED TEAM WORKFLOW

1. **Audit Request Received**
   - Validation Lead provides: evidence, KPI results, sample data

2. **Attack Planning** (2 hours)
   - Select 3-5 attacks from matrix based on feature
   - Design test cases per attack
   - Prepare test environment

3. **Attack Execution** (4-6 hours)
   - Run each test case
   - Document findings with proof
   - Collect raw data (logs, measurements)

4. **Findings Report** (1-2 hours)
   - Compile RED_TEAM_FINDINGS.json
   - Categorize by severity
   - Recommend mitigations

5. **Gatekeeper Review**
   - Red Team findings + Validation evidence → Gate decision

---

## RED TEAM REPORTING TEMPLATE

```json
{
  "red_team_audit_id": "RED-2026-ABC12345",
  "validation_session_id": "VAL-2026-XYZ67890",
  "audit_date": "2026-07-22T14:30:00Z",
  "team_lead": "Security & Validation Skeptic",
  "attacks_executed": 5,
  "findings": [
    {
      "finding_id": "RED-2026-001",
      "category": "measurement",
      "severity": "major",
      "title": "Timing Variance Exceeds Reported Margin",
      "description": "Time to First Insight varies ±12% across runs; Validation Lead reported ±3%",
      "evidence": [
        "5 independent runs: 78s, 89s, 92s, 85s, 88s",
        "Coefficient of variation: 0.08 (8%)",
        "Network latency log shows ±40ms variance"
      ],
      "mitigation_required": true,
      "recommended_action": "Increase target from 90s to 100s; re-baseline"
    },
    {
      "finding_id": "RED-2026-002",
      "category": "persona",
      "severity": "critical",
      "title": "Persona Detection Fails Silently",
      "description": "System assigns personas, but blind read test shows 22% identification (= random chance)",
      "evidence": [
        "Blind read test: 10 readers, 5 personae = 22% accuracy (random = 20%)",
        "Persona confusion matrix: 45% misclassified",
        "Text analysis: tone variants <0.3 cosine distance (too similar)"
      ],
      "mitigation_required": true,
      "recommended_action": "Redesign persona detection; increase tone differentiation in templates"
    }
  ],
  "critical_findings": 1,
  "major_findings": 2,
  "minor_findings": 0,
  "pass_recommendation": "FAIL",
  "remediation_estimate": "3-5 days to fix critical issues"
}
```

---

## NO SACRED COWS

The Red Team trusts NOTHING:
- ❌ "Validation Lead is experienced" → We still audit
- ❌ "The test ran smoothly" → We test for edge cases
- ❌ "Users said it felt personal" → We check for Barnum effect
- ❌ "Analytics looked good" → We validate schema completeness
- ❌ "It worked in QA" → We test on real networks, real devices

**Every claim requires proof.**

---

## Escalation Path

If Red Team finds CRITICAL finding:
1. Stop all other work
2. Notify Gatekeeper immediately
3. Validate finding (is it reproducible?)
4. Provide to Validation Lead for remediation
5. Re-audit after fix

If Validation Lead disputes finding:
- Red Team provides complete proof package
- Gatekeeper decides based on evidence, not authority

---

## Next: Red Team Attack Templates

Each attack above will have:
- Detailed test script (Python/SQL)
- Automated measurement collection
- Report generation template
- Severity calibration matrix
