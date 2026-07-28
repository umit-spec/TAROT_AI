#!/usr/bin/env python3
"""Bounded context-packet compiler for the Interpretation Graph (IG-2 §7).

Pulls ONLY fields that already exist in the graph's JSON data — never
invents a card meaning, never infers a signal the caller didn't supply,
never lets an unknown reference through silently. Deterministic: the
same input dict always produces byte-identical JSON output (stable key
order, stable list order, no wall-clock/random data in the packet).

This module has no side effects on import and makes no network or
runtime calls — it is offline-only, matching the graph's own
provenance.runtimeEnabled = false contract. It is not imported by any
file under src/app or src/server (see the isolation tests).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
GRAPH_ROOT = REPO_ROOT / "data" / "interpretation-graph"

VALID_POSITIONS = {"past", "present", "direction"}
VALID_SOURCES = {"explicit-user-selection", "user-confirmed"}
VALID_CONFIDENCE = {"explicit", "user-confirmed"}
MAX_EXPLICIT_SIGNALS = 2


class ContextCompilerError(Exception):
    """Base error for any rejected compiler input — never a silent fallback."""


class CrisisShortCircuitError(ContextCompilerError):
    """Raised immediately, before any graph lookup, when the input carries
    a crisis flag. No context packet is ever produced for a crisis case
    (IG-2 §7 rule 11 / §19)."""


def _load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def load_graph() -> dict:
    """Loads the full graph bundle once. Callers may cache and reuse this
    across many compile_context_packet() calls (the evaluator does)."""
    return {
        "card": _load_json(GRAPH_ROOT / "cards" / "16-tower.json"),
        "userSignals": _load_json(GRAPH_ROOT / "ontology" / "user-signals.json"),
        "userGoals": _load_json(GRAPH_ROOT / "ontology" / "user-goals.json"),
        "relationshipTypes": _load_json(GRAPH_ROOT / "ontology" / "relationship-types.json"),
        "guardrails": _load_json(GRAPH_ROOT / "ontology" / "global-guardrails.json"),
    }


def compile_context_packet(raw_input: dict, graph: dict | None = None) -> dict:
    if raw_input.get("crisisFlag") is True:
        raise CrisisShortCircuitError(
            "crisisFlag=true — no context packet may be produced for a crisis case"
        )

    graph = graph or load_graph()
    card = graph["card"]

    card_id = raw_input.get("cardId")
    if card_id != card["id"]:
        raise ContextCompilerError(f"unknown or mismatched cardId: {card_id!r}")

    position = raw_input.get("position")
    if position == "future":
        raise ContextCompilerError("position 'future' is not accepted — use 'direction'")
    if position not in VALID_POSITIONS:
        raise ContextCompilerError(f"unknown position: {position!r}")

    topic = raw_input.get("topic")
    context_entry = None
    if topic is not None:
        context_entry = card["reflectionLayer"]["contexts"].get(topic)
        if context_entry is None:
            raise ContextCompilerError(f"unknown topic: {topic!r}")

    goal = raw_input.get("goal")
    goal_entry = None
    if goal is not None:
        goal_ids = {g["id"] for g in graph["userGoals"]["goals"]}
        if goal not in goal_ids:
            raise ContextCompilerError(f"unknown goal: {goal!r}")
        goal_entry = next(g for g in graph["userGoals"]["goals"] if g["id"] == goal)

    explicit_signals = raw_input.get("explicitSignals") or []
    if len(explicit_signals) > MAX_EXPLICIT_SIGNALS:
        raise ContextCompilerError(
            f"at most {MAX_EXPLICIT_SIGNALS} explicit signals allowed, got {len(explicit_signals)}"
        )
    seen_signal_ids: set[str] = set()
    signal_lenses: list[dict] = []
    known_signal_ids = {s["id"] for s in graph["userSignals"]["signals"]}
    lenses_by_id = card["reflectionLayer"]["userSignalLenses"]
    for sig in explicit_signals:
        signal_id = sig.get("signalId")
        source = sig.get("source")
        confidence = sig.get("confidence")
        if signal_id not in known_signal_ids:
            raise ContextCompilerError(f"unknown signal: {signal_id!r}")
        if signal_id in seen_signal_ids:
            raise ContextCompilerError(f"duplicate signal in one case: {signal_id!r}")
        if source not in VALID_SOURCES:
            raise ContextCompilerError(f"invalid signal source: {source!r}")
        if confidence not in VALID_CONFIDENCE:
            raise ContextCompilerError(f"invalid signal confidence: {confidence!r}")
        seen_signal_ids.add(signal_id)
        lens = lenses_by_id.get(signal_id)
        if lens is not None:
            signal_lenses.append(
                {
                    "signalRef": signal_id,
                    "focus": lens["focus"],
                    "safeInterpretation": lens["safeInterpretation"],
                    "reflectionQuestion": lens["reflectionQuestion"],
                }
            )

    relationship_type = raw_input.get("relationshipType")
    relationship_lens = None
    if relationship_type is not None:
        rel_entry = next(
            (r for r in graph["relationshipTypes"]["relationshipTypes"] if r["id"] == relationship_type),
            None,
        )
        if rel_entry is None:
            raise ContextCompilerError(f"unknown relationshipType: {relationship_type!r}")
        if relationship_type not in card["reflectionLayer"]["relationshipTypeRefs"]:
            raise ContextCompilerError(
                f"relationshipType {relationship_type!r} is not in this card's relationshipTypeRefs"
            )
        relationship_lens = {
            "id": rel_entry["id"],
            "displayName": rel_entry["displayName"],
            "sentenceTemplate": rel_entry["sentenceTemplate"],
        }

    position_lens_source = card["reflectionLayer"]["positions"][position]
    position_lens = {
        "position": position,
        "focus": position_lens_source["focus"],
        "safeInterpretations": list(position_lens_source["safeInterpretations"]),
        "prohibitedInferences": list(position_lens_source["prohibitedInferences"]),
    }

    context_lens = (
        {
            "topic": topic,
            "focus": context_entry["focus"],
            "followUpQuestion": context_entry["followUpQuestion"],
            "avoid": context_entry["avoid"],
        }
        if context_entry is not None
        else None
    )

    goal_lens = (
        {"goal": goal, "displayName": goal_entry["displayName"], "description": goal_entry["description"]}
        if goal_entry is not None
        else None
    )

    closing_question_candidates: list[str] = list(position_lens_source["reflectionQuestions"])
    if context_entry is not None:
        closing_question_candidates.append(context_entry["followUpQuestion"])
    for lens in signal_lenses:
        closing_question_candidates.append(lens["reflectionQuestion"])
    for q in card["reflectionLayer"]["adaptiveQuestionRefs"]:
        trigger = q["trigger"]
        matches_topic = topic is not None and topic in trigger["topics"]
        matches_goal = goal is not None and goal in trigger["goals"]
        matches_signal = bool(seen_signal_ids & set(trigger["explicitSignalRefs"]))
        no_trigger_at_all = not trigger["topics"] and not trigger["goals"] and not trigger["explicitSignalRefs"]
        if matches_topic or matches_goal or matches_signal or no_trigger_at_all:
            closing_question_candidates.append(q["question"])

    applicable_guardrails = list(card["safetyRefs"])

    packet = {
        "schemaVersion": "1.0.0",
        "card": {
            "id": card["id"],
            "displayName": card["displayName"],
            "coreMeaning": card["sourceLayer"]["meaning"],
        },
        "positionLens": position_lens,
        "contextLens": context_lens,
        "goalLens": goal_lens,
        "signalLenses": signal_lenses,
        "relationshipLens": relationship_lens,
        "applicableGuardrails": applicable_guardrails,
        "closingQuestionCandidates": closing_question_candidates,
        "provenance": {"runtimeEnabled": False, "offlineEvaluationOnly": True},
    }
    return packet


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: compile_context_packet.py <input.json>", file=sys.stderr)
        return 2
    raw = _load_json(Path(argv[1]))
    try:
        packet = compile_context_packet(raw)
    except ContextCompilerError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(packet, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
