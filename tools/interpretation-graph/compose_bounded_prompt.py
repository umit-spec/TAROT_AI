#!/usr/bin/env python3
"""Deterministic, trust-boundary-separated prompt bundle composer.

The composer reuses ``compile_context_packet.py`` as the only bounded-context
selection source. It supports any canonical offline Interpretation Graph card
node and never interpolates the user's question into the system prompt or
bounded context.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from compile_context_packet import ContextCompilerError, CrisisShortCircuitError, compile_context_packet, load_graph  # noqa: E402
from lib.prompt_integrity import compute_bundle_hash, compute_context_hash, compute_question_hash, compute_template_hash  # noqa: E402
from lib.untrusted_input import UntrustedInputError, normalize_untrusted_question  # noqa: E402

PROMPT_COMPOSER_ROOT = REPO_ROOT / "data" / "interpretation-graph" / "prompt-composer"
TEMPLATE_PATH = PROMPT_COMPOSER_ROOT / "templates" / "interpretation-bounded-template.json"

VALID_PRESENTATION_PREFERENCES = {"concise", "balanced", "detailed"}
WORD_LIMITS_BY_PREFERENCE = {
    "concise": (35, 60),
    "balanced": (50, 90),
    "detailed": (75, 120),
}
ALTERNATIVE_WORD_LIMITS = (15, 45)

OUTPUT_CONTRACT_RULES = [
    "Yalnız geçerli JSON döndür; markdown, code fence, önsöz veya sonsöz yok.",
    "Tek ana hipotez (primaryInterpretation); en fazla bir alternatif (alternativePerspective).",
    "reflectionQuestion tam olarak bir '?' içeren tek bir soru olmalı.",
    "usedContextRefs, composer tarafından verilen contextRefs ile birebir eşleşmeli; yeni signal/topic/relationship eklenemez.",
    "Gelecek kesinliği, doğrudan emir, teşhis, üçüncü kişi zihin okuma, profesyonel (tıbbi/hukuki/finansal) sonuç, mistik nedensellik, bağımlılık teşviki veya uydurma sembol içeremez.",
    "Chain-of-thought, reasoning, analysis, thoughtProcess veya rationaleChain alanı yok.",
]


class ComposerError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(f"{code}: {message}")
        self.code = code


def _load_template() -> dict:
    return json.loads(TEMPLATE_PATH.read_text(encoding="utf-8"))


def _map_compiler_error(exc: ContextCompilerError) -> ComposerError:
    msg = str(exc)
    mapping = [
        ("unknown or mismatched cardId", "UNKNOWN_CARD_ID"),
        ("position 'future' is not accepted", "FUTURE_POSITION_FORBIDDEN"),
        ("unknown position", "UNKNOWN_POSITION"),
        ("unknown topic", "UNKNOWN_TOPIC"),
        ("unknown goal", "UNKNOWN_GOAL"),
        ("unknown signal", "UNKNOWN_SIGNAL"),
        ("has no lens for card", "UNKNOWN_SIGNAL"),
        ("invalid signal source", "UNCONFIRMED_SIGNAL"),
        ("invalid signal confidence", "UNCONFIRMED_SIGNAL"),
        ("duplicate signal", "DUPLICATE_SIGNAL"),
        ("at most", "TOO_MANY_SIGNALS"),
        ("unknown relationshipType", "UNKNOWN_RELATIONSHIP"),
        ("not in this card's relationshipTypeRefs", "UNKNOWN_RELATIONSHIP"),
        ("runtimeEnabled=false", "CONTEXT_PACKET_INVALID"),
    ]
    for needle, code in mapping:
        if needle in msg:
            return ComposerError(code, msg)
    return ComposerError("CONTEXT_PACKET_INVALID", msg)


def _build_bounded_context(packet: dict, graph: dict) -> dict:
    position_lens = packet["positionLens"]
    context = (
        {"focus": packet["contextLens"]["focus"], "avoid": packet["contextLens"]["avoid"]}
        if packet["contextLens"]
        else None
    )
    goal = (
        {"id": packet["goalLens"]["goal"], "description": packet["goalLens"]["description"]}
        if packet["goalLens"]
        else None
    )
    signals = [
        {
            "signalRef": signal["signalRef"],
            "focus": signal["focus"],
            "safeInterpretation": signal["safeInterpretation"],
            "prohibitedAssumptions": graph["card"]["reflectionLayer"]["userSignalLenses"][signal["signalRef"]]["prohibitedAssumptions"],
        }
        for signal in packet["signalLenses"]
    ]

    relationship = None
    if packet["relationshipLens"]:
        rel_id = packet["relationshipLens"]["id"]
        rel_entry = next(
            relation
            for relation in graph["relationshipTypes"]["relationshipTypes"]
            if relation["id"] == rel_id
        )
        relationship = {
            "id": rel_entry["id"],
            "definition": rel_entry["definition"],
            "sentenceTemplate": rel_entry["sentenceTemplate"],
            "avoidCertainty": rel_entry["avoidCertainty"],
        }

    safety_policy = [
        {"id": guardrail["id"], "rule": guardrail["rule"], "severity": guardrail["severity"]}
        for bucket in ("must", "mustNot")
        for guardrail in graph["guardrails"][bucket]
    ]

    return {
        "card": packet["card"],
        "position": {
            "focus": position_lens["focus"],
            "safeInterpretations": position_lens["safeInterpretations"][:2],
            "prohibitedInferences": position_lens["prohibitedInferences"],
        },
        "context": context,
        "goal": goal,
        "signals": signals,
        "relationship": relationship,
        "safetyPolicy": safety_policy,
    }


def _build_system_prompt(template: dict, position: str, safety_policy: list[dict]) -> str:
    sections = template["sections"]
    safety_bullets = "\n".join(
        f"- {guardrail['id']}: {guardrail['rule']}" for guardrail in safety_policy
    )
    parts = [
        sections["role"],
        sections["productBoundary"],
        sections["trustBoundary"],
        sections["interpretationRules"],
        sections["safetyRulesIntro"] + "\n" + safety_bullets,
        sections["positionRuleByPosition"][position],
        sections["outputContractIntro"],
        sections["silentValidation"],
    ]
    return "\n\n".join(parts)


def compose_bounded_prompt(raw_input: dict, graph: dict | None = None) -> dict:
    if raw_input.get("crisisFlag") is True:
        raise ComposerError(
            "CRISIS_SHORT_CIRCUIT",
            "crisisFlag=true — no prompt bundle may be composed",
        )

    presentation = raw_input.get("presentationPreference", "balanced")
    if presentation not in VALID_PRESENTATION_PREFERENCES:
        raise ComposerError(
            "INVALID_PRESENTATION_PREFERENCE",
            f"unknown presentationPreference: {presentation!r}",
        )

    try:
        normalized_question = normalize_untrusted_question(raw_input.get("userQuestion"))
    except UntrustedInputError as exc:
        raise ComposerError(exc.code, str(exc)) from exc

    card_id = raw_input.get("cardId")
    try:
        graph = graph or load_graph(card_id)
    except ContextCompilerError as exc:
        raise _map_compiler_error(exc) from exc

    compiler_input = {
        "cardId": card_id,
        "position": raw_input.get("position"),
        "topic": raw_input.get("topic"),
        "goal": raw_input.get("goal"),
        "explicitSignals": raw_input.get("explicitSignals") or [],
        "relationshipType": raw_input.get("relationshipType"),
    }
    try:
        packet = compile_context_packet(compiler_input, graph)
    except CrisisShortCircuitError as exc:
        raise ComposerError("CRISIS_SHORT_CIRCUIT", str(exc)) from exc
    except ContextCompilerError as exc:
        raise _map_compiler_error(exc) from exc

    bounded_context = _build_bounded_context(packet, graph)
    template = _load_template()
    system_prompt = _build_system_prompt(
        template,
        packet["positionLens"]["position"],
        bounded_context["safetyPolicy"],
    )
    task = template["taskDescriptionTemplate"].format(
        presentationPreference=presentation
    )

    min_words, max_words = WORD_LIMITS_BY_PREFERENCE[presentation]
    alt_min, alt_max = ALTERNATIVE_WORD_LIMITS
    output_contract = {
        "requiredKeys": [
            "primaryInterpretation",
            "alternativePerspective",
            "reflectionQuestion",
            "usedContextRefs",
        ],
        "wordLimits": {
            "primaryInterpretationMinWords": min_words,
            "primaryInterpretationMaxWords": max_words,
            "alternativePerspectiveMinWords": alt_min,
            "alternativePerspectiveMaxWords": alt_max,
        },
        "rules": OUTPUT_CONTRACT_RULES,
    }

    context_refs = {
        "position": packet["positionLens"]["position"],
        "topic": (packet["contextLens"] or {}).get("topic"),
        "goal": (packet["goalLens"] or {}).get("goal"),
        "signals": [signal["signalRef"] for signal in packet["signalLenses"]],
        "relationship": (packet["relationshipLens"] or {}).get("id"),
        "guardrails": packet["applicableGuardrails"],
    }

    context_hash = compute_context_hash(bounded_context)
    question_hash = compute_question_hash(normalized_question.text)
    template_hash = compute_template_hash(template["templateVersion"], system_prompt)

    bundle = {
        "schemaVersion": "1.0.0",
        "templateVersion": template["templateVersion"],
        "cardId": packet["card"]["id"],
        "position": packet["positionLens"]["position"],
        "systemPrompt": system_prompt,
        "userMessage": {
            "task": task,
            "boundedContext": bounded_context,
            "untrustedUserQuestion": {
                "text": normalized_question.text,
                "treatAsInstructions": False,
            },
        },
        "outputContract": output_contract,
        "contextRefs": context_refs,
        "integrity": {
            "contextHash": context_hash,
            "questionHash": question_hash,
            "templateHash": template_hash,
            "bundleHash": "",
        },
        "provenance": {
            "runtimeEnabled": False,
            "offlineEvaluationOnly": True,
            "liveModelValidated": False,
        },
    }
    bundle["integrity"]["bundleHash"] = compute_bundle_hash(bundle)
    return bundle


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: compose_bounded_prompt.py <input.json>", file=sys.stderr)
        return 2
    raw = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
    try:
        bundle = compose_bounded_prompt(raw)
    except ComposerError as exc:
        print(f"ERROR {exc.code}: {exc}", file=sys.stderr)
        return 1
    print(json.dumps(bundle, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
