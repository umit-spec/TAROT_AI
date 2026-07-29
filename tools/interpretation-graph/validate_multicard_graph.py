#!/usr/bin/env python3
"""Exact-shape and cross-card validator for Interpretation Graph card nodes.

Complements the original IG-1 structural validator without changing its frozen
behavior. Standard-library only; exit 0 means every card node passes.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
GRAPH_ROOT = REPO_ROOT / "data" / "interpretation-graph"
CARDS_ROOT = GRAPH_ROOT / "cards"
CATALOG_ROOT = REPO_ROOT / "data" / "cards"
sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.assumption_audit import audit_card_node  # noqa: E402

EXPECTED_ROOT_KEYS = {
    "schemaVersion", "id", "displayName", "englishName", "arcanaNumber",
    "arcana", "sourceLayer", "reflectionLayer", "safetyRefs", "provenance",
}
EXPECTED_SOURCE_KEYS = {"themes", "meaning", "centralTension", "doesNotMean", "symbols"}
EXPECTED_REFLECTION_KEYS = {
    "positions", "contexts", "userSignalLenses", "adaptiveQuestionRefs", "relationshipTypeRefs"
}
EXPECTED_PROVENANCE_KEYS = {
    "status", "sourceNotesPath", "normalizationNotes", "runtimeEnabled", "reviewRequiredBeforeRuntime"
}
EXPECTED_POSITION_KEYS = {"focus", "safeInterpretations", "reflectionQuestions", "prohibitedInferences"}
EXPECTED_CONTEXT_KEYS = {"focus", "followUpQuestion", "avoid"}
EXPECTED_SIGNAL_KEYS = {"signalRef", "focus", "safeInterpretation", "reflectionQuestion", "prohibitedAssumptions"}
EXPECTED_SYMBOL_KEYS = {"id", "label", "meaning", "safeUse", "risk"}
EXPECTED_QUESTION_KEYS = {"id", "question", "purpose", "trigger", "collectsOneSignalOnly", "optional"}
EXPECTED_TRIGGER_KEYS = {"topics", "goals", "explicitSignalRefs"}
EXPECTED_POSITIONS = {"past", "present", "direction"}
EXPECTED_CONTEXTS = {"career", "relationship", "decision", "family", "boundaries", "self-awareness", "uncertainty", "change"}
OLD_SIGNAL_IDS = {
    "financialSecurity", "wrongDecisionFear", "controlNeed", "changeFear", "burnout",
    "intoleranceToUncertainty", "lossFear", "failureFear", "boundaryInability", "oldOrderAttachment",
}
INVENTED_GUARDRAIL_IDS = {
    "no-certain-prophecy", "no-coercive-authority", "no-medical-legal-financial-diagnosis",
    "no-third-party-mind-reading", "no-dependency-encouragement", "no-fabricated-symbols",
}
FORBIDDEN_OPERATIVE_TERMS = [
    "rider-waite-smith", "rider waite smith", "manifestation", "tezahür",
    "as above, so below", "mercury", "civa rasyonelliği",
]


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    errors: list[str] = []

    signal_data = load_json(GRAPH_ROOT / "ontology" / "user-signals.json")
    goal_data = load_json(GRAPH_ROOT / "ontology" / "user-goals.json")
    relationship_data = load_json(GRAPH_ROOT / "ontology" / "relationship-types.json")
    guardrail_data = load_json(GRAPH_ROOT / "ontology" / "global-guardrails.json")
    signal_ids = {item["id"] for item in signal_data["signals"]}
    goal_ids = {item["id"] for item in goal_data["goals"]}
    relationship_ids = {item["id"] for item in relationship_data["relationshipTypes"]}
    guardrail_ids = {
        item["id"]
        for bucket in ("must", "may", "mustNot")
        for item in guardrail_data[bucket]
    }

    seen_card_ids: set[str] = set()
    card_files = sorted(CARDS_ROOT.glob("*.json"))
    if len(card_files) < 2:
        errors.append(f"expected at least two card nodes, found {len(card_files)}")

    for path in card_files:
        rel = path.relative_to(REPO_ROOT)
        try:
            node = load_json(path)
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{rel}: invalid JSON: {exc}")
            continue

        def exact_keys(value: dict, expected: set[str], field: str) -> None:
            actual = set(value.keys()) if isinstance(value, dict) else set()
            if actual != expected:
                errors.append(f"{rel}:{field} keys {sorted(actual)} != {sorted(expected)}")

        exact_keys(node, EXPECTED_ROOT_KEYS, "root")
        if node.get("schemaVersion") != "1.0.0":
            errors.append(f"{rel}: schemaVersion must be 1.0.0")
        card_id = node.get("id")
        if not isinstance(card_id, str) or not re.fullmatch(r"\d{2}-[a-z-]+", card_id):
            errors.append(f"{rel}: invalid id {card_id!r}")
            continue
        if card_id in seen_card_ids:
            errors.append(f"{rel}: duplicate card id {card_id}")
        seen_card_ids.add(card_id)

        catalog_path = CATALOG_ROOT / f"{card_id}.json"
        if not catalog_path.exists():
            errors.append(f"{rel}: catalog record missing: {catalog_path.relative_to(REPO_ROOT)}")
        else:
            catalog = load_json(catalog_path)
            expected_identity = (
                catalog.get("cardId"), catalog.get("name_tr"), catalog.get("name_en"),
                catalog.get("number"), catalog.get("arcana"),
            )
            actual_identity = (
                node.get("id"), node.get("displayName"), node.get("englishName"),
                node.get("arcanaNumber"), node.get("arcana"),
            )
            if actual_identity != expected_identity:
                errors.append(f"{rel}: identity mismatch {actual_identity!r} != catalog {expected_identity!r}")

        source = node.get("sourceLayer", {})
        exact_keys(source, EXPECTED_SOURCE_KEYS, "sourceLayer")
        if not source.get("themes") or not all(isinstance(x, str) and x.strip() for x in source.get("themes", [])):
            errors.append(f"{rel}: sourceLayer.themes must contain non-empty strings")
        if not isinstance(source.get("symbols"), list) or len(source.get("symbols", [])) < 1:
            errors.append(f"{rel}: sourceLayer.symbols must contain at least one governed symbol")
        for index, symbol in enumerate(source.get("symbols", [])):
            exact_keys(symbol, EXPECTED_SYMBOL_KEYS, f"sourceLayer.symbols[{index}]")

        reflection = node.get("reflectionLayer", {})
        exact_keys(reflection, EXPECTED_REFLECTION_KEYS, "reflectionLayer")
        positions = reflection.get("positions", {})
        if set(positions.keys()) != EXPECTED_POSITIONS:
            errors.append(f"{rel}: positions must be exactly {sorted(EXPECTED_POSITIONS)}")
        for key, value in positions.items():
            exact_keys(value, EXPECTED_POSITION_KEYS, f"positions.{key}")
            if len(value.get("safeInterpretations", [])) < 2 or len(value.get("reflectionQuestions", [])) < 2 or len(value.get("prohibitedInferences", [])) < 2:
                errors.append(f"{rel}: positions.{key} requires at least two interpretations/questions/prohibitions")

        contexts = reflection.get("contexts", {})
        if set(contexts.keys()) != EXPECTED_CONTEXTS:
            errors.append(f"{rel}: contexts {sorted(contexts.keys())} != {sorted(EXPECTED_CONTEXTS)}")
        for key, value in contexts.items():
            exact_keys(value, EXPECTED_CONTEXT_KEYS, f"contexts.{key}")

        lenses = reflection.get("userSignalLenses", {})
        if set(lenses.keys()) != signal_ids:
            errors.append(f"{rel}: signal lens ids do not exactly match ontology")
        for key, value in lenses.items():
            exact_keys(value, EXPECTED_SIGNAL_KEYS, f"userSignalLenses.{key}")
            if value.get("signalRef") != key:
                errors.append(f"{rel}: signal lens key/ref mismatch for {key}")
            if not value.get("prohibitedAssumptions"):
                errors.append(f"{rel}: {key} has no prohibitedAssumptions")

        for index, question in enumerate(reflection.get("adaptiveQuestionRefs", [])):
            exact_keys(question, EXPECTED_QUESTION_KEYS, f"adaptiveQuestionRefs[{index}]")
            exact_keys(question.get("trigger", {}), EXPECTED_TRIGGER_KEYS, f"adaptiveQuestionRefs[{index}].trigger")
            if question.get("collectsOneSignalOnly") is not True or question.get("optional") is not True:
                errors.append(f"{rel}: adaptive question flags must both be true")
            trigger = question.get("trigger", {})
            if not set(trigger.get("topics", [])).issubset(EXPECTED_CONTEXTS):
                errors.append(f"{rel}: adaptive question has unknown topic")
            if not set(trigger.get("goals", [])).issubset(goal_ids):
                errors.append(f"{rel}: adaptive question has unknown goal")
            if not set(trigger.get("explicitSignalRefs", [])).issubset(signal_ids):
                errors.append(f"{rel}: adaptive question has unknown signal")

        relationship_refs = reflection.get("relationshipTypeRefs", [])
        if len(relationship_refs) != len(set(relationship_refs)) or not set(relationship_refs).issubset(relationship_ids):
            errors.append(f"{rel}: invalid or duplicate relationshipTypeRefs")

        safety_refs = node.get("safetyRefs", [])
        if len(safety_refs) != len(set(safety_refs)) or not set(safety_refs).issubset(guardrail_ids):
            errors.append(f"{rel}: invalid or duplicate safetyRefs")
        if set(safety_refs) & INVENTED_GUARDRAIL_IDS:
            errors.append(f"{rel}: NotebookLM-invented guardrail id present")

        provenance = node.get("provenance", {})
        exact_keys(provenance, EXPECTED_PROVENANCE_KEYS, "provenance")
        if provenance.get("runtimeEnabled") is not False or provenance.get("reviewRequiredBeforeRuntime") is not True:
            errors.append(f"{rel}: provenance runtime/review flags invalid")
        evidence_path = REPO_ROOT / str(provenance.get("sourceNotesPath", ""))
        if not evidence_path.is_file():
            errors.append(f"{rel}: evidence file missing: {provenance.get('sourceNotesPath')}")

        serialized = json.dumps(node, ensure_ascii=False).lower()
        if re.search(r'"future"\s*:', serialized):
            errors.append(f"{rel}: future key is forbidden")
        if any(old_id in serialized for old_id in OLD_SIGNAL_IDS):
            errors.append(f"{rel}: old camelCase signal id present")

        operative = json.dumps(
            {"sourceLayer": source, "reflectionLayer": reflection},
            ensure_ascii=False,
        ).lower()
        for term in FORBIDDEN_OPERATIVE_TERMS:
            if term in operative:
                errors.append(f"{rel}: forbidden operative term {term!r}")

        findings = audit_card_node(node)
        if findings:
            errors.append(f"{rel}: assumption audit findings: {findings}")

    if errors:
        print(f"MULTICARD GRAPH VALIDATOR: FAIL ({len(errors)} issue(s))")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"MULTICARD GRAPH VALIDATOR: PASS ({len(card_files)} card node(s))")
    return 0


if __name__ == "__main__":
    sys.exit(main())
