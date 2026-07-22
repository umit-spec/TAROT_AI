# Validation Operating System — Insight Engine

**Version:** 1.0.0  
**Status:** Production-Ready  
**Last Updated:** 2026-07-22

This is not documentation. This is infrastructure.

Every feature must pass validation before implementation.

---

## WHAT IS THIS?

A permanent governance system embedded in the repository that:

1. **Validates features** using deterministic protocols
2. **Challenges claims** with independent Red Team audits
3. **Makes binary decisions** via Gatekeeper (PASS/REVISE/FAIL/INSUFFICIENT_EVIDENCE)
4. **Prevents regressions** by tracking baseline metrics
5. **Scales across modules** (Tarot, Dream Analysis, Journal, etc.)

No feature bypasses validation.

No PR merges without Gatekeeper approval.

---

## ARCHITECTURE

```
Feature Specification
        ↓
Validation Lead
  ├─ Collects evidence
  ├─ Measures KPIs
  └─ Produces Validation Report
        ↓
Red Team (Independent)
  ├─ Attacks claims
  ├─ Finds failure modes
  └─ Produces Findings
        ↓
Gatekeeper
  ├─ Reviews evidence + findings
  ├─ Checks all 8 gates
  └─ Decides: PASS | REVISE | FAIL | INSUFFICIENT_EVIDENCE
        ↓
Implementation (if PASS)
  ├─ Code follows spec
  ├─ Tests added
  └─ Regression baseline established
        ↓
Release
```

---

## SUBSYSTEMS

### 1. Validation Lead (`validation/agents/validation_lead/`)

**Role:** Collect evidence, measure KPIs, calculate metrics

**Responsibilities:**
- Execute validation protocols
- Measure all 9 KPIs
- Gather raw data (never estimates)
- Calculate confidence scores
- Document methodology
- Produce Validation Report

**Output:** `validation/reports/VAL-XXXX-*/VALIDATION_EVIDENCE.json`

**Never:** Makes PASS/FAIL decisions (only produces evidence)

---

### 2. Red Team (`validation/agents/red_team/`)

**Role:** Prove Validation Lead wrong. Attack assumptions.

**Responsibilities:**
- Run 9 attack scenarios (measurement, persona, analytics, accessibility, psychology, hallucination, performance, edge cases, regression)
- Document findings with proof
- Categorize by severity (CRITICAL/MAJOR/MINOR)
- Recommend mitigations

**Attacks:**
- Measurement manipulation
- Confirmation bias
- Persona confusion
- Analytics gaps
- Barnum effect
- AI hallucination
- Accessibility failures
- Edge case crashes
- Regression detection

**Output:** `validation/reports/VAL-XXXX-*/RED_TEAM_FINDINGS.json`

**Never:** Makes approval decisions (only produces challenges)

---

### 3. Gatekeeper (`validation/agents/gatekeeper/`)

**Role:** Make binary decisions based on evidence.

**Responsibilities:**
- Review Validation Lead evidence
- Review Red Team findings
- Check 8 validation gates:
  1. Timing Gate (KPI-001, KPI-002)
  2. Quality Gate (KPI-003)
  3. Engagement Gate (KPI-004)
  4. Persona Gate (KPI-005)
  5. Accessibility Gate (KPI-006)
  6. Analytics Gate (KPI-007)
  7. Funnel Gate (KPI-008)
  8. Recovery Gate (KPI-009)
- Make final decision

**Decision Matrix:**
```
IF (all_gates_pass AND red_team_critical == 0):
  PASS
ELIF (critical findings OR accessibility fails):
  FAIL
ELIF (major findings > 1):
  REVISE
ELSE:
  INSUFFICIENT_EVIDENCE
```

**Output:** `validation/reports/VAL-XXXX-*/GATEKEEPER_DECISION.json`

---

## KPI ENGINE

### 9 Core KPIs

| KPI | Type | Target | Owner |
|-----|------|--------|-------|
| **KPI-001** | Time to First Insight | ≤90 sec | UX Research |
| **KPI-002** | Core Flow Completion | ≤120 sec | UX Research |
| **KPI-003** | Insight Quality Score | ≥2.0/3.0 | Product |
| **KPI-004** | Continue Reading Rate | ≥60% | UX Research |
| **KPI-005** | Persona Fit Score | ≥0.75 | UX Research |
| **KPI-006** | Accessibility Pass Rate | 100% | QA |
| **KPI-007** | Analytics Event Integrity | 100% | Analytics |
| **KPI-008** | Drop-off Rate | <10% per screen | Product |
| **KPI-009** | Error Recovery Rate | >80% | QA |

**Registry:** `validation/kpi/KPI_REGISTRY.md`

Every KPI has:
- Definition
- Formula
- Data source
- Pass/fail thresholds
- Confidence score
- Known biases
- Replication steps

---

## PROTOCOLS

Each validation phase follows a deterministic protocol.

### Wireframe Validation Protocol v1.0.0

**Path:** `validation/protocols/WIREFRAME_VALIDATION_PROTOCOL_v1.0.0.md`

**Phases:**
1. Setup (Day 1)
2. Timing Test (Days 2-3)
3. Clarity Test (Days 2-3)
4. Accessibility Audit (Days 3-4)
5. Analytics Validation (Day 4)
6. Persona Validation (Days 4-5)
7. "No Magic" Test (Day 5)
8. Red Team Audit (Day 6)
9. Gatekeeper Decision (Day 7)

**Output:** Complete evidence archive

### Future Protocols

- Prototype Validation v1.0.0 (planned)
- Production Validation v1.0.0 (planned)
- Regression Validation v1.0.0 (planned)

---

## SCHEMAS

### Validation Schema (`validation/schemas/validation.schema.json`)

Canonical structure for all validation reports:
- Validation ID
- Feature
- Specification version
- Validation Lead evidence
- Red Team findings
- Gatekeeper decision
- KPI summary
- Archive location

### Evidence Schema (`validation/schemas/evidence.schema.json`)

Structure for individual evidence items:
- Evidence ID
- Validation session ID
- Evidence type (timing, interaction, accessibility, analytics, etc.)
- Measured value (never estimates)
- Measurement method
- Confidence score (0.0-1.0)
- Replication instructions
- Potential biases

---

## GOVERNANCE

### Validation Gates

**No PR merges without:**
1. Schema validation ✓
2. KPI registry complete ✓
3. Red Team playbook ready ✓
4. Gatekeeper logic defined ✓
5. Protocols versioned ✓
6. Documentation complete ✓
7. Clean repository state ✓
8. Reproducibility documented ✓

**GitHub Actions:** `.github/workflows/validation-gates.yml`

All gates must pass automatically. Manual approval alone is insufficient.

---

## WORKFLOWS

### Feature Validation Workflow

```yaml
1. Feature Specification Complete
   ↓
2. Validation Lead Executes Protocol
   ├─ Recruit 5 test users (1 per persona)
   ├─ Measure all 9 KPIs
   ├─ Collect raw evidence
   ├─ Calculate statistics
   └─ Produce Validation Evidence
   
3. Red Team Audits Claims (parallel)
   ├─ Run 9 attack scenarios
   ├─ Challenge assumptions
   ├─ Document findings
   └─ Produce Red Team Findings
   
4. Gatekeeper Reviews Evidence
   ├─ Check all 8 gates
   ├─ Assess Red Team findings
   ├─ Evaluate risk
   └─ Make binary decision
   
5. Archive & Decision
   ├─ Store in validation/reports/VAL-XXXX-*/
   ├─ Generate final report
   ├─ Update regression baseline
   └─ Signal implementation team
```

---

## USING VALIDATION OS

### As a Feature Developer

1. **Specification Complete**
   - You've spec'd the feature (wireframe, user flows, KPIs)
   - You've submitted to Validation Lead

2. **Wait for Validation**
   - Validation Lead tests wireframe (7 days typical)
   - Red Team audits claims (parallel)
   - Gatekeeper reviews evidence

3. **PASS?** → Implement
   - Follow code from specification
   - Tests cover all KPI measurement points
   - PR references validation session ID

4. **REVISE?** → Redesign
   - Validation Lead tells you what to fix
   - You redesign
   - Resubmit for validation

5. **FAIL?** → Start over
   - Feature blocked
   - Root cause analysis required
   - Complete redesign needed

---

### As QA / Validation Lead

1. **Read the protocol** for your feature type
   - Wireframe: `validation/protocols/WIREFRAME_VALIDATION_PROTOCOL_v1.0.0.md`
   - Prototype: `validation/protocols/PROTOTYPE_VALIDATION_PROTOCOL_v1.0.0.md` (WIP)

2. **Execute phases** in order
   - Setup (Day 1)
   - Timing (Days 2-3)
   - Clarity (Days 2-3)
   - Accessibility (Days 3-4)
   - Analytics (Day 4)
   - Personas (Days 4-5)
   - No Magic (Day 5)

3. **Collect evidence**
   - All measurements (never estimates)
   - Raw data (CSV, JSON, logs)
   - Confidence scores
   - Replication instructions

4. **Generate report**
   - Use `validation/reports/template-validation-report.json`
   - Validate against `validation/schemas/validation.schema.json`
   - Archive in `validation/reports/VAL-XXXX-*/`

5. **Submit to Red Team**
   - Provide all evidence
   - Answer Red Team questions
   - Be prepared for challenges

---

### As Red Team

1. **Receive validation evidence**
   - Validation Lead provides all measurements
   - You assume everything is potentially wrong

2. **Execute attack playbook** (`validation/agents/red_team/RED_TEAM_PLAYBOOK.md`)
   - Measurement attacks (clock skew, sampling bias)
   - Persona attacks (detection fails, tone indistinguishable)
   - Analytics attacks (events missing, payloads invalid)
   - Accessibility attacks (automated audit misses issues)
   - Psychology attacks (Barnum effect)
   - Performance attacks (edge cases crash)
   - Regression attacks (metrics degraded)

3. **Document findings**
   - Use `validation/agents/red_team/RED_TEAM_FINDINGS.json`
   - Provide proof (not opinions)
   - Categorize by severity
   - Recommend mitigations

4. **Never approve**
   - You only produce findings
   - Gatekeeper makes final call

---

### As Gatekeeper

1. **Receive evidence**
   - Validation Lead evidence
   - Red Team findings
   - All raw data

2. **Check 8 gates**
   - Timing (KPI-001, KPI-002)
   - Quality (KPI-003)
   - Engagement (KPI-004)
   - Persona (KPI-005)
   - Accessibility (KPI-006)
   - Analytics (KPI-007)
   - Funnel (KPI-008)
   - Recovery (KPI-009)

3. **Use decision matrix** (`validation/agents/gatekeeper/GATEKEEPER_LOGIC.md`)
   - PASS: All gates pass + Red Team critical = 0
   - REVISE: Major findings but fixable
   - FAIL: Critical findings or gate failures
   - INSUFFICIENT_EVIDENCE: Missing data

4. **Produce decision**
   - Use `validation/agents/gatekeeper/GATEKEEPER_DECISION.json`
   - Provide rationale (not opinions)
   - List gates passed/failed
   - Detail required remediations

---

## FILE STRUCTURE

```
validation/
├── README.md (this file)
├── agents/
│   ├── validation_lead/
│   │   ├── VALIDATION_LEAD.md
│   │   └── scripts/
│   │       ├── measure_kpis.py
│   │       ├── calculate_timing.py
│   │       └── generate_report.py
│   ├── red_team/
│   │   ├── RED_TEAM_PLAYBOOK.md
│   │   └── attacks/
│   │       ├── measurement_attacks.py
│   │       ├── persona_attacks.py
│   │       ├── analytics_attacks.py
│   │       └── accessibility_attacks.py
│   └── gatekeeper/
│       ├── GATEKEEPER_LOGIC.md
│       └── scripts/
│           ├── check_gates.py
│           └── make_decision.py
├── protocols/
│   ├── WIREFRAME_VALIDATION_PROTOCOL_v1.0.0.md
│   ├── PROTOTYPE_VALIDATION_PROTOCOL_v1.0.0.md (planned)
│   └── PRODUCTION_VALIDATION_PROTOCOL_v1.0.0.md (planned)
├── schemas/
│   ├── validation.schema.json
│   ├── evidence.schema.json
│   └── kpi.schema.json (planned)
├── kpi/
│   ├── KPI_REGISTRY.md
│   └── scripts/
│       ├── calculate_kpi_001.py
│       ├── calculate_kpi_002.py
│       └── ... (one per KPI)
├── reports/
│   ├── templates/
│   │   ├── template-validation-report.json
│   │   ├── template-red-team-findings.json
│   │   └── template-gatekeeper-decision.json
│   └── VAL-XXXX-*/
│       ├── VALIDATION_EVIDENCE.json
│       ├── RED_TEAM_FINDINGS.json
│       ├── GATEKEEPER_DECISION.json
│       ├── timing_results.csv
│       ├── accessibility_report.json
│       └── archive_metadata.json
├── checklists/
│   ├── VALIDATION_LEAD_CHECKLIST.md
│   ├── RED_TEAM_CHECKLIST.md
│   └── GATEKEEPER_CHECKLIST.md
├── dashboards/
│   ├── kpi_dashboard.html
│   ├── funnel_dashboard.html
│   └── regression_dashboard.html
├── gates/
│   ├── GATE_DEFINITIONS.md
│   └── gate_checks.json
└── evidence/
    └── archive (all raw test data)

governance/
├── GOVERNANCE_MODEL.md
├── architecture/
│   ├── VALIDATION_OS_ARCHITECTURE.md
│   └── validation-os-diagram.svg
└── policies/
    ├── EVIDENCE_POLICY.md
    ├── NO_ASSUMPTIONS_POLICY.md
    └── REPRODUCIBILITY_POLICY.md
```

---

## GETTING STARTED

### For Validation Lead

1. Read: `validation/protocols/WIREFRAME_VALIDATION_PROTOCOL_v1.0.0.md`
2. Check: `validation/kpi/KPI_REGISTRY.md`
3. Execute: Protocol phases (7 days)
4. Archive: Results in `validation/reports/VAL-XXXX-*/`

### For Red Team

1. Read: `validation/agents/red_team/RED_TEAM_PLAYBOOK.md`
2. Receive: Validation Lead evidence
3. Attack: 9 scenarios from playbook
4. Document: Findings in schema

### For Gatekeeper

1. Read: `validation/agents/gatekeeper/GATEKEEPER_LOGIC.md`
2. Receive: Evidence + Findings
3. Check: 8 gates
4. Decide: PASS | REVISE | FAIL | INSUFFICIENT_EVIDENCE

### For Developers

1. Wait for Gatekeeper PASS
2. Implementation team writes code from spec
3. Tests cover KPI measurement points
4. PR references `VAL-XXXX-*/GATEKEEPER_DECISION.json`
5. Regression baseline established
6. Deploy when tests pass + CI passes

---

## VERSIONING

All validation components are versioned:

- Protocols: `WIREFRAME_VALIDATION_PROTOCOL_v1.0.0.md`
- KPI Registry: `v1.0.0` (in document header)
- Playbooks: `v1.0.0` (in document header)
- Schemas: Fixed (validation.schema.json, evidence.schema.json)

When changes needed:
- Update version (1.0.0 → 1.1.0)
- Archive old version
- Update all references

---

## SCALING TO NEW MODULES

When adding Dream Analysis, Journal, or other Insight Engine modules:

1. Copy wireframe protocol (adapt as needed)
2. Define module-specific KPIs
3. Create Red Team attack playbook for module
4. Add module to Gatekeeper decision matrix
5. Register in validation/gates/

Same validation OS works for all modules.

---

## POLICIES

**No Assumptions:** Every measurement has confidence score + bias documentation

**Evidence Only:** No "looks good" judgments. Only measurements.

**Reproducibility:** Every test must be repeatable step-by-step.

**Immutability:** Once evidence archived, never changes. Only new validation sessions.

**Transparency:** All evidence public within organization.

---

## CONTINUOUS IMPROVEMENT

Red Team findings feed into:
- Protocol refinements (better test scenarios)
- KPI adjustments (more accurate targets)
- Gatekeeper calibration (better decision matrix)
- Product roadmap (recurring issues)

## NEXT STEPS

1. ✅ Validation OS core infrastructure complete
2. ⏳ Scripts for automated KPI calculation (Python)
3. ⏳ GitHub Actions integration fully operational
4. ⏳ Regression baseline system setup
5. ⏳ Dashboard for real-time KPI tracking

---

## SUPPORT

Questions about validation?

- Validation Lead concerns → `validation/agents/validation_lead/`
- Red Team methodology → `validation/agents/red_team/RED_TEAM_PLAYBOOK.md`
- Gatekeeper decision logic → `validation/agents/gatekeeper/GATEKEEPER_LOGIC.md`
- KPI definitions → `validation/kpi/KPI_REGISTRY.md`

All policy questions → `governance/GOVERNANCE_MODEL.md`

---

**This is not documentation. This is operating procedure.**

Every feature. Every validation. No exceptions.
