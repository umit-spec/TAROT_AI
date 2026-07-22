# Red Team Audit Charter v1.0

**Date Issued:** 2026-07-22  
**Effective Date:** 2026-07-22  
**Authority:** Validation Lead + Gatekeeper Framework  
**Validity:** Single audit cycle for Milestone 1 (Asset Ingestion)  
**Status:** 🔒 FROZEN — No modification permitted during audit

---

## 1. MISSION

### Amaç (Purpose)

Provide **independent, adversarial validation** of the Major Arcana asset ingestion pipeline before production integration. Red Team's role is not to improve—it is to **attempt to break** the system and report findings with confidence levels.

### Kapsam (Scope)

- **What:** Major Arcana asset extraction, validation, and governance framework
- **Where:** Repository branch `feat/major-arcana-asset-migration` (frozen state)
- **When:** Starting immediately after Charter issuance
- **Who:** Independent Red Team (cannot be Validation Lead or Gatekeeper)
- **Why:** Establish confidence in Validation OS framework for reuse across future visual packages

### Denetimin Sınırları (Boundaries)

- **In Scope:** Asset extraction, naming, translations, manifests, metadata, reproducibility, governance docs
- **Out of Scope:** Legal review (licensing), React integration testing, production deployment decisions
- **Not Permitted:** Code changes, manifest updates, documentation edits—Red Team produces evidence only

---

## 2. FROZEN SCOPE

### Test edilecek Branch

```
Repository: umit-spec/TAROT_AI
Branch: feat/major-arcana-asset-migration
Freeze Date: 2026-07-22
```

### Test edilecek Commit Aralığı

**Exact commit range for audit:**

```
024fee7..1cee644 (inclusive)
```

**Commits included:**

| Hash | Message | Impact |
|------|---------|--------|
| `024fee7` | fix(assets): correct canonical IDs, translations | 66 file renames + 3 manifests |
| `94cf4d1` | docs(validation): asset-specific gate profile | 9-gate audit framework |
| `58e0905` | docs(validation): provisional language rewrite | Validation report updated |
| `287e2d7` | docs(validation): test status clarification | Tests designed ≠ executed |
| `1cee644` | docs(validation): REVISE corrections completion | Final deliverable summary |

**No commits after 1cee644 may be audited or considered part of Milestone 1.**

### Kod Değişikliği Kuralı — "NO CODE CHANGES" RULE

🚫 **HARD STOP**

Red Team **MUST NOT**:
- ✋ Modify any source code files
- ✋ Rename or move assets
- ✋ Update manifests or registries
- ✋ Edit test files
- ✋ Alter validation reports

**Why:** Any code change shifts the testing ground. Red Team audit is only valid against frozen scope.

**Exception:** Only Validation Lead may commit fixes after Red Team reports findings.

### Değerlendirilecek Artefact Listesi (Evidence Package Location)

**Assets:**
- `assets/tarot-cards/00-fool.webp` through `21-world.webp` (22 web images)
- `assets/tarot-cards/00-fool-hq.webp` through `21-world-hq.webp` (22 HQ images)
- `assets/tarot-cards/{id}-metadata.json` (22 metadata files, all cards)

**Manifests & Registries:**
- `assets/tarot-cards/_extraction_manifest.json` (crop coords, checksums)
- `assets/tarot-cards/CARD_REGISTRY.json` (canonical card list)

**Tooling & Configuration:**
- `tools/assets/extract_major_arcana.py` (extraction script)
- `tools/assets/config/major_arcana_crops.json` (crop coordinates)
- `tools/assets/canonical_names.py` (naming authority + translations)

**Documentation:**
- `validation/reports/VAL-2026-ARCANA/VALIDATION_LEAD_EVIDENCE.md` (Validation Lead report)
- `validation/gates/GATE_PROFILE_ASSET_INGESTION_v1.0.0.md` (9-gate framework)
- `validation/evidence/assets/PROVENANCE_RECORD.md` (licensing status)
- `assets/tarot-cards/README.md` (asset usage guide)

**QA Evidence:**
- `validation/evidence/assets/major-arcana-contact-sheet.png` (visual proof of all 22 cards)

**Testing:**
- `tests/assets.test.js` (22 test cases designed; execution pending)

---

## 3. EVIDENCE PACKAGE

All files listed in Section 2 are available for review. Red Team has **read-only access** to:

```bash
git show 1cee644:<any-file>
git log --oneline 024fee7..1cee644
git diff 024fee7 1cee644
```

**Data to Collect During Audit:**

For each test/gate, document:
- ✅ What was tested
- 📝 How it was tested (command/procedure)
- 📊 Results (PASS/FAIL/INCONCLUSIVE)
- 🔗 Evidence location (file path, screenshot, etc.)
- 📌 Confidence level (High/Medium/Low)
- 🚨 Severity (if failure: Critical/Major/Minor/Informational)

---

## 4. AUDIT PROCEDURES

### 9-Gate Framework

All gates defined in `validation/gates/GATE_PROFILE_ASSET_INGESTION_v1.0.0.md`.

**Pre-Approved Gates** (3 — Validation Lead verified):
1. ✅ Gate 1: Canonical Mapping (manifest verified, no duplicates/gaps)
2. ✅ Gate 6: Metadata Completeness (all 22 files complete)
3. ✅ Gate 7: Asset Registry (JSON structure valid)

**Gates Requiring Red Team Verification** (5):
1. ⏳ Gate 2: File Naming Consistency
2. ⏳ Gate 3: Extraction Reproducibility
3. ⏳ Gate 4: Crop Quality & Contamination
4. ⏳ Gate 5: Technical Specifications
5. ⏳ Gate 9: Code Quality & Documentation

**Blocked Gate** (1 — Not Red Team responsibility):
- ❌ Gate 8: Provenance & Licensing (awaiting legal review)

### Test Commands for Each Gate

#### Gate 2: File Naming Consistency

**Procedure:**
```bash
cd /home/user/TAROT_AI/assets/tarot-cards

# Count files by pattern
echo "Web images (should be 22):"
ls -1 [0-2][0-9]-*.webp | wc -l

echo "HQ images (should be 22):"
ls -1 [0-2][0-9]-*-hq.webp | wc -l

echo "Metadata files (should be 22):"
ls -1 [0-2][0-9]-*-metadata.json | wc -l

# Check for "the-" pattern (should find ZERO)
echo "Files with '-the-' pattern (should be 0):"
ls -1 *-the-* 2>/dev/null | wc -l

# Verify canonical format
echo "Sample canonical ID (should be '00-fool'):"
ls -1 00-*.webp | head -1 | cut -d. -f1
```

**Expected Results:**
- Web images: 22
- HQ images: 22
- Metadata files: 22
- Files with `-the-`: 0
- Sample ID: `00-fool` (not `00-the-fool`)

**Pass Criteria:** All counts correct, no `-the-` pattern found

---

#### Gate 3: Extraction Reproducibility

**Procedure:**
```bash
cd /home/user/TAROT_AI

# Locate source montage (should be in validation evidence)
SOURCE_IMAGE="validation/evidence/assets/1000214766.png"
CONFIG="tools/assets/config/major_arcana_crops.json"
OUTPUT_DIR="./temp_extraction_test"

# Run extraction
python3 tools/assets/extract_major_arcana.py \
  "$SOURCE_IMAGE" \
  "$CONFIG" \
  "$OUTPUT_DIR"

# Compare checksums against manifest
echo "Comparing output checksums..."
python3 << 'CHECKSUM_TEST'
import json
import hashlib
import os

# Load manifest
with open('assets/tarot-cards/_extraction_manifest.json') as f:
    manifest = json.load(f)

# Test web image checksums
print("Web image checksum verification:")
for card_id, card_data in manifest['cards'].items():
    filename = card_data['output']['web']['path'].split('/')[-1]
    test_file = f"./temp_extraction_test/{filename}"
    
    if os.path.exists(test_file):
        with open(test_file, 'rb') as f:
            actual_checksum = hashlib.sha256(f.read()).hexdigest()
        expected_checksum = card_data['output']['web']['checksum']
        
        match = "✓ MATCH" if actual_checksum == expected_checksum else "✗ MISMATCH"
        print(f"  {card_id}: {match}")
    else:
        print(f"  {card_id}: ✗ FILE NOT FOUND")

print("\nHQ image checksum verification:")
# Same for HQ images
CHECKSUM_TEST

# Cleanup
rm -rf "$OUTPUT_DIR"
```

**Pass Criteria:**
- All 22 web image checksums match manifest
- All 22 HQ image checksums match manifest
- Zero file not found errors
- Zero checksum mismatches

---

#### Gate 4: Crop Quality & Contamination

**Procedure:**
```bash
# Visual inspection via contact sheet
cd /home/user/TAROT_AI

# Open contact sheet
echo "Opening QA contact sheet..."
# (open validation/evidence/assets/major-arcana-contact-sheet.png in image viewer)

# Sample 5 random cards and check:
# 1. Card edges are clean (no montage background bleeding)
# 2. Card orientation is correct (portrait, not rotated)
# 3. No visible artifacts from adjacent cards
# 4. Title/number areas are complete

# For pixel-level verification (optional):
python3 << 'CROP_TEST'
from PIL import Image
import json

# Load manifest for crop coordinates
with open('assets/tarot-cards/_extraction_manifest.json') as f:
    manifest = json.load(f)

# Sample cards to check: 00-fool, 08-strength, 15-devil, 17-star, 21-world
samples = ['00-fool', '08-strength', '15-devil', '17-star', '21-world']

for card_id in samples:
    if card_id in manifest['cards']:
        crop = manifest['cards'][card_id]['crop']
        
        # Verify crop is within source bounds (1536 × 1024)
        valid = (
            crop['x'] >= 0 and 
            crop['x'] + crop['width'] <= 1536 and
            crop['y'] >= 0 and 
            crop['y'] + crop['height'] <= 1024
        )
        
        status = "✓ VALID" if valid else "✗ OUT OF BOUNDS"
        print(f"{card_id}: crop({crop['x']}, {crop['y']}, {crop['width']}×{crop['height']}) {status}")
CROP_TEST
```

**Pass Criteria:**
- All 5 sampled cards visually clean (no contamination)
- No crop coordinates exceed source montage bounds (1536×1024)
- All crops have reasonable aspect ratios (portrait)

---

#### Gate 5: Technical Specifications

**Procedure:**
```bash
cd /home/user/TAROT_AI/assets/tarot-cards

# Check web image dimensions and file sizes
echo "Web image specification check:"
python3 << 'WEB_SPEC'
import json
import os

with open('_extraction_manifest.json') as f:
    manifest = json.load(f)

pass_count = 0
for card_id, card_data in manifest['cards'].items():
    filename = card_data['output']['web']['path'].split('/')[-1]
    filepath = f"./{filename}"
    
    if os.path.exists(filepath):
        # Check file size
        size = os.path.getsize(filepath)
        size_valid = 5000 <= size <= 50000  # 5KB - 50KB
        
        # Expected dimensions
        expected_w, expected_h = 512, 768
        actual_w, actual_h = card_data['output']['web']['dimensions']
        dims_valid = actual_w == expected_w and actual_h == expected_h
        
        # Check WebP magic bytes
        with open(filepath, 'rb') as f:
            magic = f.read(12)
        
        webp_valid = magic[0:4] == b'RIFF' and magic[8:12] == b'WEBP'
        
        status = "✓" if (size_valid and dims_valid and webp_valid) else "✗"
        print(f"{status} {card_id}: {actual_w}×{actual_h}, {size}B, WebP: {webp_valid}")
        
        if size_valid and dims_valid and webp_valid:
            pass_count += 1

print(f"\nTotal web images passing specs: {pass_count}/22")
WEB_SPEC

# Check HQ images similarly
echo "HQ image specification check (dimensions only):"
python3 << 'HQ_SPEC'
import json
import os

with open('_extraction_manifest.json') as f:
    manifest = json.load(f)

pass_count = 0
for card_id, card_data in manifest['cards'].items():
    filename = card_data['output']['hq']['path'].split('/')[-1]
    filepath = f"./{filename}"
    
    if os.path.exists(filepath):
        actual_w, actual_h = card_data['output']['hq']['dimensions']
        expected_w, expected_h = 2048, 3072
        dims_valid = actual_w == expected_w and actual_h == expected_h
        
        status = "✓" if dims_valid else "✗"
        print(f"{status} {card_id}: {actual_w}×{actual_h}")
        
        if dims_valid:
            pass_count += 1

print(f"\nTotal HQ images passing specs: {pass_count}/22")
HQ_SPEC
```

**Pass Criteria:**
- All 22 web images: 512×768, 5-50KB, valid WebP
- All 22 HQ images: 2048×3072, valid WebP
- Zero format/dimension mismatches

---

#### Gate 9: Code Quality & Documentation

**Procedure:**
```bash
cd /home/user/TAROT_AI

# Check extraction script exists and is readable
echo "Extraction script check:"
test -f tools/assets/extract_major_arcana.py && echo "✓ Script exists" || echo "✗ Script missing"
test -r tools/assets/extract_major_arcana.py && echo "✓ Readable" || echo "✗ Not readable"

# Check crop config exists and is valid JSON
echo "Crop configuration check:"
test -f tools/assets/config/major_arcana_crops.json && echo "✓ Config exists" || echo "✗ Config missing"
python3 -m json.tool tools/assets/config/major_arcana_crops.json > /dev/null && echo "✓ Valid JSON" || echo "✗ Invalid JSON"

# Count crop entries (should be 22)
echo "Crop entries (should be 22):"
python3 << 'CROP_COUNT'
import json
with open('tools/assets/config/major_arcana_crops.json') as f:
    config = json.load(f)
count = len(config.get('cards', {}))
print(f"  Found: {count}")
CROP_COUNT

# Verify manifest includes coordinates
echo "Manifest coordinate preservation:"
python3 << 'MANIFEST_CHECK'
import json
with open('assets/tarot-cards/_extraction_manifest.json') as f:
    manifest = json.load(f)

coords_count = 0
for card_id, card_data in manifest['cards'].items():
    if 'crop' in card_data and all(k in card_data['crop'] for k in ['x', 'y', 'width', 'height']):
        coords_count += 1

print(f"  Cards with preserved crop coordinates: {coords_count}/22")
MANIFEST_CHECK

# Check documentation
echo "Documentation check:"
test -f assets/tarot-cards/README.md && echo "✓ Asset README exists" || echo "✗ Missing"
test -f tools/assets/canonical_names.py && echo "✓ Canonical authority exists" || echo "✗ Missing"
```

**Pass Criteria:**
- Extraction script exists and is readable
- Crop config exists and is valid JSON
- Config contains exactly 22 crop entries
- Manifest includes crop coordinates for all 22 cards
- Documentation files exist

---

## 5. ATTACK SCENARIOS

Red Team should attempt the following attacks and document results:

### 1. Canonical Swap Attack

**Objective:** Can we swap cards 08 (Strength) and 11 (Justice)?

**Attack Method:**
```bash
# Attempt to find evidence of swap
python3 << 'SWAP_TEST'
import json

with open('assets/tarot-cards/_extraction_manifest.json') as f:
    manifest = json.load(f)

strength = None
justice = None

for card_id, card_data in manifest['cards'].items():
    if card_id == '08-strength':
        strength = card_data['canonical_number']
    elif card_id == '11-justice':
        justice = card_data['canonical_number']

print(f"Strength canonical number: {strength} (expected: 8)")
print(f"Justice canonical number: {justice} (expected: 11)")

if strength == 8 and justice == 11:
    print("✓ PASS: No swap detected")
else:
    print("✗ FAIL: Swap detected!")
SWAP_TEST
```

**Success (Red Team FAILURE):** Numbers cannot be swapped without detection.

---

### 2. Crop Contamination Attack

**Objective:** Can we find unintended pixels from neighboring cards?

**Attack Method:**
```bash
# Visual inspection + optional pixel analysis
# For each sampled card:
# 1. Open the web image
# 2. Check edges for color bleeding from montage background
# 3. Verify card content is clean, not truncated
# 4. Check for partial pixels from adjacent cards

# Optional: Pixel-level color analysis
python3 << 'CONTAMINATION_TEST'
from PIL import Image
import json

# Load 5 sample cards and check edge pixels
samples = ['00-fool', '08-strength', '11-justice', '17-star', '21-world']

for card_id in samples:
    web_path = f"assets/tarot-cards/{card_id}.webp"
    try:
        img = Image.open(web_path)
        
        # Check if black padding (object-fit: contain) is used correctly
        # Sample corners for unexpected colors
        corners = {
            'top-left': img.getpixel((5, 5)),
            'top-right': img.getpixel((img.width-5, 5)),
            'bottom-left': img.getpixel((5, img.height-5)),
            'bottom-right': img.getpixel((img.width-5, img.height-5)),
        }
        
        print(f"{card_id}: corners {corners}")
    except Exception as e:
        print(f"{card_id}: Error - {e}")
CONTAMINATION_TEST
```

**Success (Red Team FAILURE):** No contamination or unexpected pixels detected.

---

### 3. Manifest Drift Attack

**Objective:** Do manifest IDs match actual filenames?

**Attack Method:**
```bash
cd /home/user/TAROT_AI/assets/tarot-cards

python3 << 'DRIFT_TEST'
import json
import os

with open('_extraction_manifest.json') as f:
    manifest = json.load(f)

print("Checking manifest ↔ filesystem drift:")
mismatches = 0

for card_id in manifest['cards']:
    web_file = f"{card_id}.webp"
    hq_file = f"{card_id}-hq.webp"
    meta_file = f"{card_id}-metadata.json"
    
    web_exists = os.path.exists(web_file)
    hq_exists = os.path.exists(hq_file)
    meta_exists = os.path.exists(meta_file)
    
    if web_exists and hq_exists and meta_exists:
        print(f"✓ {card_id}: all files present")
    else:
        print(f"✗ {card_id}: MISSING - web:{web_exists} hq:{hq_exists} meta:{meta_exists}")
        mismatches += 1

print(f"\nTotal drift issues: {mismatches}")
DRIFT_TEST
```

**Success (Red Team FAILURE):** Zero drift issues, manifest matches filesystem exactly.

---

### 4. Checksum Mismatch Attack

**Objective:** Do actual file checksums match manifest?

**Attack Method:** (See Gate 3 reproducibility test)

**Success (Red Team FAILURE):** All checksums match manifest exactly.

---

### 5. Metadata Corruption Attack

**Objective:** Is metadata valid JSON? Do all 22 cards have complete metadata?

**Attack Method:**
```bash
cd /home/user/TAROT_AI/assets/tarot-cards

python3 << 'METADATA_TEST'
import json
import os

print("Metadata integrity check:")
valid_count = 0

for i in range(22):
    card_num = f"{i:02d}"
    # Find metadata file (name varies, check all)
    meta_files = [f for f in os.listdir('.') if f.startswith(card_num) and f.endswith('-metadata.json')]
    
    if not meta_files:
        print(f"✗ Card {card_num}: NO METADATA FILE")
        continue
    
    meta_file = meta_files[0]
    
    try:
        with open(meta_file) as f:
            data = json.load(f)
        
        # Verify required fields
        required = ['id', 'name', 'number', 'arcana', 'assets', 'provenance']
        missing = [k for k in required if k not in data]
        
        if not missing:
            print(f"✓ {meta_file}: valid & complete")
            valid_count += 1
        else:
            print(f"✗ {meta_file}: missing {missing}")
    except json.JSONDecodeError as e:
        print(f"✗ {meta_file}: invalid JSON - {e}")
    except Exception as e:
        print(f"✗ {meta_file}: error - {e}")

print(f"\nValid metadata files: {valid_count}/22")
METADATA_TEST
```

**Success (Red Team FAILURE):** All 22 metadata files valid and complete.

---

### 6. Missing Card Attack

**Objective:** Are all 22 cards present? No duplicates? No gaps?

**Attack Method:**
```bash
python3 << 'CARD_COUNT_TEST'
import json
import os

with open('assets/tarot-cards/_extraction_manifest.json') as f:
    manifest = json.load(f)

card_ids = set(manifest['cards'].keys())
card_numbers = [manifest['cards'][cid]['canonical_number'] for cid in card_ids]

print(f"Total cards in manifest: {len(card_ids)}")
print(f"Expected: 22")

# Check for gaps
expected_numbers = set(range(0, 22))
actual_numbers = set(card_numbers)

gaps = expected_numbers - actual_numbers
if gaps:
    print(f"✗ GAPS FOUND: {sorted(gaps)}")
else:
    print(f"✓ No gaps: all numbers 0-21 present")

# Check for duplicates
if len(card_numbers) != len(set(card_numbers)):
    print(f"✗ DUPLICATES FOUND")
else:
    print(f"✓ No duplicates")
CARD_COUNT_TEST
```

**Success (Red Team FAILURE):** Exactly 22 cards, no gaps, no duplicates.

---

### 7. Wrong Resolution Claim Attack

**Objective:** Is HQ resolution correctly documented as interpolated, not native?

**Attack Method:**
```bash
# Check documentation
grep -i "interpolat" validation/reports/VAL-2026-ARCANA/VALIDATION_LEAD_EVIDENCE.md && \
    echo "✓ Interpolation mentioned" || \
    echo "✗ NO MENTION of interpolation"

# Verify HQ dimensions are documented as 2048×3072
grep "2048" assets/tarot-cards/README.md && \
    echo "✓ HQ dimensions documented"
```

**Success (Red Team FAILURE):** Interpolated nature is clearly documented, not hidden.

---

### 8. Missing Translation Lock

**Objective:** Are Turkish translations locked? Can they be accidentally changed?

**Attack Method:**
```bash
python3 << 'TRANSLATION_TEST'
import json

# Check canonical_names.py exists
try:
    with open('tools/assets/canonical_names.py') as f:
        content = f.read()
    
    # Verify all 5 corrected translations are present
    corrections = {
        'Büyücü': 'Magician (should not be Simyacı)',
        'Âşıklar': 'Lovers (should not be Sevgili)',
        'Ermiş': 'Hermit (should not be Eremit)',
        'Denge': 'Temperance (should not be İtemlendirme)',
        'Yargı': 'Judgement (should not be Kıyamet)',
    }
    
    for tr, desc in corrections.items():
        if tr in content:
            print(f"✓ {desc}")
        else:
            print(f"✗ MISSING: {desc}")
    
    # Verify validation tests
    if 'assert' in content and 'CARDS' in content:
        print("✓ Validation tests embedded")
    else:
        print("✗ No validation tests found")
        
except FileNotFoundError:
    print("✗ canonical_names.py NOT FOUND")
TRANSLATION_TEST
```

**Success (Red Team FAILURE):** All 5 translations locked, validation tests present.

---

## 6. REPORTING RULES

### Binary Outcomes per Gate

After testing each of the 5 gates, Red Team must report **exactly one** of these outcomes:

#### ✅ PASS

**Meaning:** Gate tested successfully. No critical findings. Asset meets acceptance criteria.

**Example:**
```
Gate 3: Extraction Reproducibility
Status: PASS
Evidence: 22/22 web checksums match, 22/22 HQ checksums match
Confidence: HIGH
```

---

#### 🔄 REVISE

**Meaning:** Gate tests revealed issues that must be **fixed before production**. Not a hard blocker, but requires Validation Lead to commit fixes.

**Example:**
```
Gate 2: File Naming Consistency
Status: REVISE
Finding: Found 3 files with '-the-' pattern: 01-the-magician.webp, etc.
Required Action: Rename files to canonical format
Confidence: HIGH
Severity: MAJOR (manifest references broken)
```

---

#### ❌ FAIL

**Meaning:** Gate test discovered **critical blocker**. Asset cannot proceed to Gatekeeper without major rework.

**Example:**
```
Gate 4: Crop Contamination
Status: FAIL
Finding: Card 08-strength contains pixels from adjacent card
Impact: Visual corruption detected in 3/5 sampled cards
Required Action: Re-extract from source montage
Confidence: HIGH
Severity: CRITICAL (asset quality compromised)
```

---

#### ❓ INSUFFICIENT_EVIDENCE

**Meaning:** Gate test could not reach a conclusion. More investigation needed.

**Example:**
```
Gate 5: Technical Specs
Status: INSUFFICIENT_EVIDENCE
Finding: HQ image opening succeeded, but library cannot parse dimensions automatically
Recommended: Manual visual inspection of pixel dimensions
Confidence: MEDIUM
```

---

### Final Gate Report Template

**Per Gate**, submit:

```markdown
## Gate [N]: [Gate Name]

**Status:** [PASS | REVISE | FAIL | INSUFFICIENT_EVIDENCE]

**Test Method:** [What exactly was tested?]

**Results:** [What did the test find?]

**Evidence Location:** [File path, screenshot, command output]

**Confidence:** [HIGH | MEDIUM | LOW]

**Severity (if not PASS):** [CRITICAL | MAJOR | MINOR | INFORMATIONAL]

**Recommended Action:** [What should Validation Lead or Gatekeeper do?]

**Notes:** [Any edge cases, assumptions, or additional context]
```

---

## 7. ESCALATION PATH

### Critical Finding (FAIL outcome)

**Discovery → Validation Lead → Gatekeeper Stalled**

If Red Team finds a **CRITICAL** or **BLOCKING** issue:

1. **Immediately notify Validation Lead** (do not wait for full report)
2. Provide **detailed evidence** (screenshot, command output, reproduction steps)
3. Validation Lead decides: **Fix before Gatekeeper** or **Escalate as blocker**
4. If fixed: New commit created, entire Gate 2-5 re-tested
5. If blocker: Gatekeeper sees evidence, decides: **REVISE** or **FAIL**

---

### Major Finding (REVISE outcome)

**Discovery → Validation Lead → Fix Commit → Red Team Re-Verify**

1. Red Team reports REVISE with detailed findings
2. Validation Lead commits fix
3. Red Team verifies fix resolves the finding
4. If resolved: Gate marked PASS in final report
5. If not resolved: Escalate to Gatekeeper as blocking issue

---

### Minor/Informational Findings (Documentation)

**No escalation required.** Documented in final report for Gatekeeper awareness.

---

### Contact & Escalation Chain

- **Validation Lead:** [To be assigned]
- **Red Team Lead:** [To be assigned]
- **Gatekeeper:** [To be assigned]

**Communication Protocol:**
- Critical findings: Immediate async notification (email/message)
- Regular findings: Daily summary in Red Team report
- Final report: Submitted to Gatekeeper when all 5 gates tested

---

## CRITICAL PRINCIPLE: ROLE SEPARATION

### 🛑 Red Team NEVER Modifies Repository

**Red Team authority:**
- ✅ Test code and artifacts
- ✅ Produce evidence and findings
- ✅ Report outcomes (PASS/REVISE/FAIL/INSUFFICIENT_EVIDENCE)
- ✅ Recommend actions

**Red Team prohibitions:**
- ❌ Commit code changes
- ❌ Update manifests
- ❌ Rename files
- ❌ Edit documentation (except findings report)

**Why:** If Red Team modifies code, the audit loses its independence. Findings become self-serving rather than objective.

---

### 🔧 Validation Lead Receives Findings

**Validation Lead authority:**
- ✅ Receives Red Team findings
- ✅ Classifies severity
- ✅ Decides: fix or escalate
- ✅ Commits fixes (creates new commit)
- ✅ Requests Red Team re-test (optional)

**Validation Lead prohibition:**
- ❌ Cannot change Red Team's findings
- ❌ Cannot declare findings "invalid"
- ❌ Must provide Gatekeeper with all findings (even minor)

---

### ⚖️ Gatekeeper Makes Final Decision

**Gatekeeper authority:**
- ✅ Reviews Red Team findings
- ✅ Evaluates Validation Lead fixes
- ✅ Issues binary decision: **PASS** or **FAIL** (not REVISE)
- ✅ Approves or blocks production

**Gatekeeper decision matrix:**
- All 5 gates PASS + legal cleared → **PASS** (proceed to integration)
- Any gate FAIL + unfixed → **FAIL** (return to development)
- Mixed REVISE + major severity → **REVISE** (fixes required, re-audit)

---

## AUDIT SUCCESS CRITERIA

Red Team audit is **complete and successful** when:

✅ All 5 gates tested with documented results  
✅ Attack scenarios attempted and documented  
✅ All findings classified (PASS/REVISE/FAIL/INSUFFICIENT_EVIDENCE)  
✅ Evidence provided for each finding  
✅ No code modifications by Red Team  
✅ Final report submitted to Gatekeeper  

**Red Team is NOT responsible for:**
- Production deployment decisions ❌
- Legal/licensing review ❌
- React integration testing ❌
- Performance optimization ❌

---

## CHARTER AUTHORITY & MODIFICATIONS

**Issued By:** Validation Lead (Principal Frontend Engineer)  
**Approved By:** Gatekeeper Framework  
**Effective Immediately:** 2026-07-22  

**This Charter is FROZEN.** Modifications require joint approval from Validation Lead + Gatekeeper.

**Next Review:** After Red Team completes audit (expected: 2026-07-25)

---

**Red Team Audit Charter v1.0**  
**Status: 🔒 FROZEN — AUDIT READY**  
**Last Updated:** 2026-07-22
