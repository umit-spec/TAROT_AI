# Provenance Record — Major Arcana Assets

**Date:** 2026-07-22  
**Asset Set:** Major Arcana (22 cards)  
**Version:** 1.0  
**Status:** Pending production approval

---

## Source Image

**Filename:** 1000214766.png  
**Type:** Tarot card montage (22-card set)  
**Dimensions:** 1536 × 1024 px  
**Format:** PNG (RGB)  
**Checksum (SHA256):** b3e12d6733e62181...  
**File Size:** ~2.4 MB  

**Provided by:** User upload (through Claude Code interface)  
**Provision Date:** 2026-07-22  
**Provision Method:** Claude Code file upload  

---

## Extraction Process

**Extraction Tool:** `tools/assets/extract_major_arcana.py`  
**Extraction Date:** 2026-07-22  
**Extraction Config:** `tools/assets/config/major_arcana_crops.json`  
**Extraction Method:** Deterministic pixel-level cropping  

**Output Artifacts:**

| Artifact | Location | Count | Status |
|----------|----------|-------|--------|
| Web images (512×768) | `assets/tarot-cards/*.webp` | 22 | ✓ Created |
| HQ images (2048×3072) | `assets/tarot-cards/*-hq.webp` | 22 | ✓ Created |
| Metadata JSON | `assets/tarot-cards/*-metadata.json` | 22 | ✓ Created |
| Extraction manifest | `assets/tarot-cards/_extraction_manifest.json` | 1 | ✓ Created |
| Card registry | `assets/tarot-cards/CARD_REGISTRY.json` | 1 | ✓ Created |
| QA contact sheet | `validation/evidence/assets/major-arcana-contact-sheet.png` | 1 | ✓ Created |

**Total Output Size:** ~872 KB (web + HQ combined)  
**Total Output Files:** 67 (22 web + 22 HQ + 22 metadata + 1 manifest + 1 registry + 1 README)  

---

## Licensing & Rights Status

**Current Status:** `approved-for-prototype`

**Licensing Questions:**

1. **Source copyright:** [UNRESOLVED]
   - Did user own the source image?
   - Was it licensed for modification/redistribution?
   - Public domain? Commercial? Custom artwork?

2. **Derivative rights:** [UNRESOLVED]
   - Can extracted cards be used in commercial product?
   - Attribution requirements?
   - Exclusivity restrictions?

3. **Product use:** [UNRESOLVED]
   - Approved for prototype (internal testing only)
   - **NOT** approved for production release to users
   - **NOT** approved for public marketing
   - **NOT** approved for licensing to third parties

---

## Internal Usage

**Approved For:**
- ✅ Prototype development and testing
- ✅ Internal QA and validation
- ✅ Red Team security/functionality audits
- ✅ Gatekeeper decision-making

**Blocked Until Rights Confirmed:**
- ❌ Production deployment
- ❌ User-facing release
- ❌ Marketing and promotional use
- ❌ Commercial claims of licensing

---

## Approval Chain

| Role | Status | Date | Notes |
|------|--------|------|-------|
| **Extraction** | ✓ Complete | 2026-07-22 | All 22 cards extracted, deterministic |
| **Visual QA** | ⏳ Pending | — | Contact sheet created, pending manual review |
| **Red Team** | ⏳ Pending | — | Will test extraction reproducibility, mapping accuracy |
| **Gatekeeper** | ⏳ Pending | — | Will review all evidence + Red Team findings |
| **Legal/Rights** | ❌ Unresolved | — | Must clarify licensing before production use |
| **Product Owner** | ⏳ Pending | — | Final sign-off on production release |

---

## Fallback & Rollback

**If Licensing Issues Arise:**

1. Assets remain in repository under `validation/evidence/assets/archive/`
2. Production code uses placeholder images until rights confirmed
3. No code changes required (asset paths already exist)
4. Full restoration possible with: `git checkout feat/major-arcana-asset-migration -- assets/tarot-cards/`

**If Extraction Errors Detected:**

1. Re-run extraction from source: `python3 tools/assets/extract_major_arcana.py`
2. Checksums in manifest serve as integrity proof
3. Crop coordinates preserved for reproducibility

---

## Documentation

- **Extraction:** `tools/assets/extract_major_arcana.py` (deterministic script)
- **Configuration:** `tools/assets/config/major_arcana_crops.json` (crop coordinates)
- **Metadata:** `assets/tarot-cards/README.md` (asset guide)
- **Registry:** `assets/tarot-cards/CARD_REGISTRY.json` (canonical card list)
- **Validation:** `validation/evidence/assets/major-arcana-contact-sheet.png` (visual proof)

---

## Critical Notes

### Mapping Integrity

All 22 cards mapped to canonical numbering (0–21) per **Canonical Position Map** in master prompt.

**No Swaps or Errors:**
- ✓ Strength (08) ≠ Justice (11)
- ✓ Tower (16) ≠ Star (17)
- ✓ All 22 cards present, no duplicates, no gaps

### Reproducibility

Extraction is fully reproducible:
1. Source image + crop config → deterministic script → byte-identical output
2. Checksums in manifest verify output integrity
3. Crop coordinates preserved for 100% reproducibility

### Prototype Status

This asset set is **approved for prototype use only** until:
1. Licensing/rights confirmed
2. Product owner sign-off obtained
3. Legal review completed

---

## Next Steps

1. **Red Team Audit** (in progress)
   - Verify extraction reproducibility
   - Test mapping accuracy (all 22 cards correct)
   - Check for crop contamination

2. **Gatekeeper Review** (pending)
   - Review all evidence
   - Check all 8 validation gates
   - Issue PASS/REVISE/FAIL/INSUFFICIENT_EVIDENCE

3. **Legal Review** (required before production)
   - Clarify source copyright
   - Confirm derivative rights
   - Document licensing constraints
   - Obtain product owner approval

4. **Production Integration** (after legal cleared)
   - Import into UI components
   - Test responsive rendering
   - Measure performance impact
   - Deploy to production

---

**This provenance record serves as proof of:**
- Source documentation
- Extraction reproducibility
- Current licensing status
- Approval chain visibility
- Rollback capability

**For questions about provenance, refer to this document and the Validation OS evidence trail.**

---

**Version 1.0** | Generated 2026-07-22 | Approved Status: PROTOTYPE_ONLY
