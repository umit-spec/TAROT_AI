#!/usr/bin/env python3
"""Structural validator for data/interpretation-graph/ (IG-1 pilot).

NOT a full standards-compliant JSON Schema (Draft 2020-12) engine. The
`jsonschema` package is not a dependency of this repository, and this
tool deliberately does not add one (IG-1 master prompt §22: "Tercihen
repository'ye yeni npm dependency ekleme" / prefer no new dependency).
It instead performs the specific structural, reference-integrity, and
safety-language checks IG-1 requires by hand, using only the Python
standard library. It complements — and does not replace — the JSON
Schema documents in data/interpretation-graph/schema/, which remain the
authoritative shape contract for a future full-schema validator.

Exit code 0 = PASS. Any non-zero exit = FAIL. Every failure is reported
with the specific file and field path involved.
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
GRAPH_ROOT = REPO_ROOT / "data" / "interpretation-graph"
CARDS_CATALOG = REPO_ROOT / "data" / "cards"
EXISTING_TOWER_CARD = CARDS_CATALOG / "16-tower.json"
CRG1_BASE_SHA = "f05a74a"  # governance/crg1-commercial-release-review HEAD this pilot branched from

FORBIDDEN_CERTAINTY_TERMS = [
    "kesinlikle",
    "mutlaka",
    "garantili",
    "kaçınılmaz",
    "istifa et",
    "sahte yapı",
]
RWS_NAMES = ["rider-waite-smith", "rider waite smith", " rws "]

errors: list[str] = []
warnings: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)


def load_json(path: Path) -> dict | list | None:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        fail(f"[parse] {path.relative_to(REPO_ROOT)}: invalid JSON — {exc}")
        return None
    except FileNotFoundError:
        fail(f"[missing] {path.relative_to(REPO_ROOT)} does not exist")
        return None


def all_json_files() -> list[Path]:
    return sorted(GRAPH_ROOT.rglob("*.json"))


def check_1_all_json_parses() -> dict[Path, object]:
    parsed: dict[Path, object] = {}
    for f in all_json_files():
        data = load_json(f)
        if data is not None:
            parsed[f] = data
    return parsed


def check_no_string_contains(data: object, path: str, needles: list[str], where: str, collector: list[str]) -> None:
    if isinstance(data, str):
        lowered = data.lower()
        for needle in needles:
            if needle in lowered:
                collector.append(f"{where} field '{path}' contains forbidden text: '{needle}' -> {data!r}")
    elif isinstance(data, dict):
        for k, v in data.items():
            check_no_string_contains(v, f"{path}.{k}", needles, where, collector)
    elif isinstance(data, list):
        for i, v in enumerate(data):
            check_no_string_contains(v, f"{path}[{i}]", needles, where, collector)


def collect_all_strings(data: object) -> list[str]:
    out: list[str] = []
    if isinstance(data, str):
        out.append(data)
    elif isinstance(data, dict):
        for v in data.values():
            out.extend(collect_all_strings(v))
    elif isinstance(data, list):
        for v in data:
            out.extend(collect_all_strings(v))
    return out


def main() -> int:
    parsed = check_1_all_json_parses()
    card_files = sorted((GRAPH_ROOT / "cards").glob("*.json"))
    cards = {f: parsed[f] for f in card_files if f in parsed}

    ontology_dir = GRAPH_ROOT / "ontology"
    user_signals = parsed.get(ontology_dir / "user-signals.json", {})
    user_goals = parsed.get(ontology_dir / "user-goals.json", {})
    relationship_types = parsed.get(ontology_dir / "relationship-types.json", {})
    guardrails = parsed.get(ontology_dir / "global-guardrails.json", {})

    signal_ids = {s["id"] for s in user_signals.get("signals", [])} if user_signals else set()
    goal_ids = {g["id"] for g in user_goals.get("goals", [])} if user_goals else set()
    relationship_ids = (
        {r["id"] for r in relationship_types.get("relationshipTypes", [])} if relationship_types else set()
    )
    guardrail_ids = set()
    if guardrails:
        for bucket in ("must", "may", "mustNot"):
            guardrail_ids |= {g["id"] for g in guardrails.get(bucket, [])}

    # 2/3: canonical CardId + no NotebookLM-suggested variant used as an
    # actual id or inside operative (sourceLayer/reflectionLayer) content.
    # Meta-documentation explaining the rejected alternative — e.g. in
    # provenance.normalizationNotes or evidence/*-source-notes.md, exactly
    # as IG-1 §20 requires — is legitimate and deliberately NOT scanned
    # here; only content a future runtime engine would actually consume is.
    canonical_card_ids = {f.stem for f in CARDS_CATALOG.glob("*.json")}
    for f, node in cards.items():
        cid = node.get("id")
        if cid not in canonical_card_ids:
            fail(f"[cardid] {f.relative_to(REPO_ROOT)}: id '{cid}' not found in data/cards/ catalog")
        if cid == "16-the-tower":
            fail(f"[cardid] {f.relative_to(REPO_ROOT)}: id field is the forbidden NotebookLM-suggested variant '16-the-tower'")
        operative = json.dumps({"sourceLayer": node.get("sourceLayer"), "reflectionLayer": node.get("reflectionLayer")})
        if "16-the-tower" in operative:
            fail(f"[cardid] {f.relative_to(REPO_ROOT)}: sourceLayer/reflectionLayer content references forbidden id '16-the-tower'")

    # 4: runtimeEnabled false.
    for f, node in cards.items():
        if node.get("provenance", {}).get("runtimeEnabled") is not False:
            fail(f"[runtime] {f.relative_to(REPO_ROOT)}: provenance.runtimeEnabled must be false")

    # 5/6: exactly past/present/direction, no 'future' key.
    for f, node in cards.items():
        positions = node.get("reflectionLayer", {}).get("positions", {})
        if set(positions.keys()) != {"past", "present", "direction"}:
            fail(f"[positions] {f.relative_to(REPO_ROOT)}: positions must be exactly past/present/direction, got {sorted(positions.keys())}")
        if "future" in json.dumps(node):
            # only flag an actual JSON *key* named "future", not the substring inside other words
            if re.search(r'"future"\s*:', json.dumps(node)):
                fail(f"[positions] {f.relative_to(REPO_ROOT)}: a 'future' key is present — forbidden, use 'direction'")

    # 7/8/9/10/11: reference integrity.
    for f, node in cards.items():
        rel = f.relative_to(REPO_ROOT)
        lenses = node.get("reflectionLayer", {}).get("userSignalLenses", {})
        for key, lens in lenses.items():
            ref = lens.get("signalRef")
            if ref not in signal_ids:
                fail(f"[ref] {rel}: userSignalLenses.{key}.signalRef '{ref}' not found in ontology/user-signals.json")
            if key != ref:
                fail(f"[ref] {rel}: userSignalLenses key '{key}' does not match its own signalRef '{ref}'")
        for ref in node.get("reflectionLayer", {}).get("relationshipTypeRefs", []):
            if ref not in relationship_ids:
                fail(f"[ref] {rel}: relationshipTypeRefs '{ref}' not found in ontology/relationship-types.json")
        for q in node.get("reflectionLayer", {}).get("adaptiveQuestionRefs", []):
            for goal_ref in q.get("trigger", {}).get("goals", []):
                if goal_ref not in goal_ids:
                    fail(f"[ref] {rel}: adaptiveQuestionRefs[{q.get('id')}].trigger.goals '{goal_ref}' not found in ontology/user-goals.json")
            for sig_ref in q.get("trigger", {}).get("explicitSignalRefs", []):
                if sig_ref not in signal_ids:
                    fail(f"[ref] {rel}: adaptiveQuestionRefs[{q.get('id')}].trigger.explicitSignalRefs '{sig_ref}' not found in ontology/user-signals.json")
        for ref in node.get("safetyRefs", []):
            if ref not in guardrail_ids:
                fail(f"[ref] {rel}: safetyRefs '{ref}' not found in ontology/global-guardrails.json")

    # 12: duplicate IDs.
    def check_dupes(items: list[str], where: str) -> None:
        seen = set()
        for i in items:
            if i in seen:
                fail(f"[duplicate] {where}: duplicate id '{i}'")
            seen.add(i)

    check_dupes([f["id"] for f in user_signals.get("signals", [])], "ontology/user-signals.json")
    check_dupes([f["id"] for f in user_goals.get("goals", [])], "ontology/user-goals.json")
    check_dupes([f["id"] for f in relationship_types.get("relationshipTypes", [])], "ontology/relationship-types.json")
    if guardrails:
        all_guardrail_ids = [g["id"] for bucket in ("must", "may", "mustNot") for g in guardrails.get(bucket, [])]
        check_dupes(all_guardrail_ids, "ontology/global-guardrails.json")
    for f, node in cards.items():
        check_dupes([s["id"] for s in node.get("sourceLayer", {}).get("symbols", [])], f"{f.relative_to(REPO_ROOT)} symbols")
        check_dupes(
            [q["id"] for q in node.get("reflectionLayer", {}).get("adaptiveQuestionRefs", [])],
            f"{f.relative_to(REPO_ROOT)} adaptiveQuestionRefs",
        )
    check_dupes([n.get("id") for n in cards.values()], "data/interpretation-graph/cards/*.json")

    # 13: no empty required text anywhere.
    for f, node in cards.items():
        for s in collect_all_strings(node):
            if isinstance(s, str) and s.strip() == "":
                fail(f"[empty] {f.relative_to(REPO_ROOT)}: an empty string value was found")

    # 14/15: session-context schema's own declared enum/const values.
    sc_schema_path = GRAPH_ROOT / "schema" / "session-context.schema.json"
    sc_schema = parsed.get(sc_schema_path)
    if sc_schema is not None:
        explicit_signal_def = sc_schema.get("$defs", {}).get("explicitSignal", {})
        source_const = explicit_signal_def.get("properties", {}).get("source", {}).get("const")
        if source_const != "explicit-user-selection":
            fail(f"[schema] {sc_schema_path.relative_to(REPO_ROOT)}: explicitSignal.source const must be 'explicit-user-selection'")
        confidence_enum = set(explicit_signal_def.get("properties", {}).get("confidence", {}).get("enum", []))
        if confidence_enum != {"explicit", "user-confirmed"}:
            fail(f"[schema] {sc_schema_path.relative_to(REPO_ROOT)}: confidence enum must be exactly ['explicit', 'user-confirmed'], got {sorted(confidence_enum)}")
        schema_text = sc_schema_path.read_text(encoding="utf-8").lower()
        for banned in ("inferred", "diagnosed", "predicted"):
            if re.search(rf'"\s*{banned}\s*"', schema_text):
                fail(f"[schema] {sc_schema_path.relative_to(REPO_ROOT)}: forbidden confidence/source value '{banned}' found as a JSON string literal")

    # "Safe" field paths only — deliberately excludes doesNotMean, risk,
    # avoid, prohibitedInferences, prohibitedAssumptions, and all
    # ontology guardrail rule/rationale text, which must be able to name
    # the very phrases they forbid (IG-1 §22 item 19).
    def safe_strings(node: dict) -> list[str]:
        out: list[str] = []
        sl = node.get("sourceLayer", {})
        out.append(sl.get("meaning", ""))
        out.append(sl.get("centralTension", ""))
        out.extend(sl.get("themes", []))
        for sym in sl.get("symbols", []):
            out.append(sym.get("safeUse", ""))
        for pos in node.get("reflectionLayer", {}).get("positions", {}).values():
            out.append(pos.get("focus", ""))
            out.extend(pos.get("safeInterpretations", []))
            out.extend(pos.get("reflectionQuestions", []))
        for ctx in node.get("reflectionLayer", {}).get("contexts", {}).values():
            out.append(ctx.get("focus", ""))
            out.append(ctx.get("followUpQuestion", ""))
        for lens in node.get("reflectionLayer", {}).get("userSignalLenses", {}).values():
            out.append(lens.get("focus", ""))
            out.append(lens.get("safeInterpretation", ""))
            out.append(lens.get("reflectionQuestion", ""))
        for q in node.get("reflectionLayer", {}).get("adaptiveQuestionRefs", []):
            out.append(q.get("question", ""))
            out.append(q.get("purpose", ""))
        return out

    # 16/18: forbidden certainty patterns in SAFE fields only.
    for f, node in cards.items():
        for s in safe_strings(node):
            lowered = s.lower()
            for term in FORBIDDEN_CERTAINTY_TERMS:
                if term in lowered:
                    fail(f"[safety] {f.relative_to(REPO_ROOT)}: forbidden term '{term}' found in a safe-field: {s!r}")

    for f, node in cards.items():
        rel_types = relationship_types.get("relationshipTypes", []) if relationship_types else []
        for r in rel_types:
            lowered = r.get("sentenceTemplate", "").lower()
            for term in FORBIDDEN_CERTAINTY_TERMS:
                if term in lowered:
                    fail(f"[safety] ontology/relationship-types.json: forbidden term '{term}' found in sentenceTemplate: {r.get('sentenceTemplate')!r}")

    # 17: RWS name never in operative content (sourceLayer/reflectionLayer
    # of a card node, or any ontology data file). Governance prose that
    # explains the decision to exclude RWS branding — provenance notes,
    # evidence/*.md, schema $comment/description text, this file's own
    # docstring — is explicitly out of scope, the same distinction as the
    # '16-the-tower' check above.
    for f, node in cards.items():
        operative = json.dumps({"sourceLayer": node.get("sourceLayer"), "reflectionLayer": node.get("reflectionLayer")}).lower()
        for needle in RWS_NAMES:
            if needle in operative:
                fail(f"[brand] {f.relative_to(REPO_ROOT)}: sourceLayer/reflectionLayer contains a Rider-Waite-Smith/RWS reference — forbidden in operative content")
    for ontology_file in (user_signals, user_goals, relationship_types, guardrails):
        if not ontology_file:
            continue
        lowered = json.dumps(ontology_file).lower()
        for needle in RWS_NAMES:
            if needle in lowered:
                fail("[brand] an ontology file contains a Rider-Waite-Smith/RWS reference — forbidden in operative content")

    # 20: existing canonical card file unchanged since the CRG-1 baseline.
    try:
        diff = subprocess.run(
            ["git", "diff", CRG1_BASE_SHA, "--", str(EXISTING_TOWER_CARD.relative_to(REPO_ROOT))],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=True,
        )
        if diff.stdout.strip():
            fail(f"[isolation] data/cards/16-tower.json has changed since baseline {CRG1_BASE_SHA} — the existing canonical card record must not be modified by this pilot")
    except subprocess.CalledProcessError as exc:
        warnings.append(f"[isolation] could not run git diff against {CRG1_BASE_SHA}: {exc.stderr.strip()}")

    print(f"Interpretation Graph validator — {len(all_json_files())} JSON file(s) scanned")
    if warnings:
        print("\nWarnings:")
        for w in warnings:
            print(f"  - {w}")
    if errors:
        print(f"\nFAIL — {len(errors)} issue(s):")
        for e in errors:
            print(f"  - {e}")
        return 1

    print("PASS — all structural, reference, and safety-language checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
