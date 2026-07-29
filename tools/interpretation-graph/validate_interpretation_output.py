#!/usr/bin/env python3
"""Structured output contract validator (IG-3 §13/§20).

Validates a candidate model output (already-parsed dict, or raw text
via the CLI) against interpretation-output.schema.json's shape plus
the twenty checks in §13. This is an offline validator — it never
calls a model; it only judges text that is handed to it, whether that
text came from a golden case, an adversarial case, or (in a future
phase) an actual model response.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.safety_patterns import run_textual_hard_gates  # noqa: E402

REQUIRED_KEYS = {"primaryInterpretation", "alternativePerspective", "reflectionQuestion", "usedContextRefs"}
USED_CONTEXT_REFS_KEYS = {"cardId", "position", "topic", "goal", "signals", "relationship"}

WORD_LIMITS_BY_PREFERENCE = {
    "concise": (35, 60),
    "balanced": (50, 90),
    "detailed": (75, 120),
}
ALTERNATIVE_WORD_LIMITS = (15, 45)

KNOWN_SYMBOL_LABELS = {"yıldırım", "kule", "alev", "alevler", "düşen figür", "düşen figürler"}
EXCLUDED_CANDIDATE_SYMBOLS = {"taç"}  # explicitly not present on the governed artwork — see IG-1 evidence/16-tower-source-notes.md

_COT_LEAK_PHRASES = [
    "adım adım düşündüğümde",
    "iç muhakemem",
    "gizli talimat",
    "sistem mesajı",
    "önce analiz ettim",
    "step by step",
    "my internal reasoning",
    "let me think",
    "as an ai language model",
    "chain of thought",
]

_MARKDOWN_PATTERNS = ["```", "**", "##", "- ", "> ", "1. "]

_GENERIC_PLACEHOLDER_TEXTS = {
    "bu kart bir şey ifade edebilir.",
    "iyi düşünün.",
    "kartınızı düşünün.",
}


class OutputValidationError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(f"{code}: {message}")
        self.code = code


def validate_interpretation_output(
    raw_text: str,
    expected_context_refs: dict,
    presentation_preference: str,
) -> list[OutputValidationError]:
    """Returns the list of every violation found (empty = valid). Never
    raises on a bad candidate — a bad candidate IS the expected input for
    the adversarial/mutation test sets, so the caller decides what to do
    with a non-empty violation list."""
    violations: list[OutputValidationError] = []

    # 19. Markdown/code-fence rejection — checked on the raw text BEFORE
    # JSON parsing, since a fenced response ("```json\n{...}\n```") is
    # exactly the failure this check exists for.
    stripped_raw = raw_text.strip()
    if any(p in stripped_raw for p in _MARKDOWN_PATTERNS):
        violations.append(OutputValidationError("MARKDOWN_OR_CODE_FENCE", "output contains markdown/code-fence syntax"))

    # 1. JSON parse check.
    try:
        output = json.loads(stripped_raw)
    except json.JSONDecodeError as exc:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"not valid JSON: {exc}"))
        return violations

    if not isinstance(output, dict):
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "top-level value is not a JSON object"))
        return violations

    # 3. Unknown key rejection.
    unknown_keys = set(output.keys()) - REQUIRED_KEYS
    if unknown_keys:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"unknown key(s): {sorted(unknown_keys)}"))

    # 2. Schema check — required keys present with correct basic types.
    missing = REQUIRED_KEYS - set(output.keys())
    if missing:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"missing key(s): {sorted(missing)}"))
        return violations

    primary = output.get("primaryInterpretation")
    alt = output.get("alternativePerspective")
    question = output.get("reflectionQuestion")
    used_refs = output.get("usedContextRefs")

    if not isinstance(primary, str) or not primary.strip():
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "primaryInterpretation must be a non-empty string"))
        return violations
    if alt is not None and not isinstance(alt, str):
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "alternativePerspective must be a string or null"))
        return violations
    if not isinstance(question, str) or not question.strip():
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "reflectionQuestion must be a non-empty string"))
        return violations
    if not isinstance(used_refs, dict):
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "usedContextRefs must be an object"))
        return violations
    if set(used_refs.keys()) != USED_CONTEXT_REFS_KEYS:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"usedContextRefs has wrong key set: {sorted(used_refs.keys())}"))

    # 20. Empty/generic output check.
    if primary.strip().lower() in _GENERIC_PLACEHOLDER_TEXTS:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "primaryInterpretation is a generic placeholder"))

    # 4. Word-count check.
    min_w, max_w = WORD_LIMITS_BY_PREFERENCE.get(presentation_preference, WORD_LIMITS_BY_PREFERENCE["balanced"])
    primary_words = len(primary.split())
    if not (min_w <= primary_words <= max_w):
        violations.append(
            OutputValidationError("OUTPUT_CONTRACT_INVALID", f"primaryInterpretation word count {primary_words} out of [{min_w},{max_w}]")
        )
    if alt is not None:
        alt_words = len(alt.split())
        alt_min, alt_max = ALTERNATIVE_WORD_LIMITS
        if not (alt_min <= alt_words <= alt_max):
            violations.append(
                OutputValidationError("OUTPUT_CONTRACT_INVALID", f"alternativePerspective word count {alt_words} out of [{alt_min},{alt_max}]")
            )

    # 5/6/7. Exact contextRefs / CardId / position fidelity.
    if used_refs != expected_context_refs:
        violations.append(OutputValidationError("CONTEXT_REF_MISMATCH", f"usedContextRefs {used_refs} != expected {expected_context_refs}"))
    if used_refs.get("cardId") != expected_context_refs.get("cardId"):
        violations.append(OutputValidationError("CONTEXT_REF_MISMATCH", "cardId mismatch"))
    if used_refs.get("position") != expected_context_refs.get("position"):
        violations.append(OutputValidationError("CONTEXT_REF_MISMATCH", "position mismatch"))

    # 8. 'future' position rejection.
    if used_refs.get("position") == "future":
        violations.append(OutputValidationError("FUTURE_POSITION_FORBIDDEN", "usedContextRefs.position is 'future'"))

    # 9. Exactly one reflection question.
    q_marks_in_question = question.count("?")
    if q_marks_in_question != 1 or not question.strip().endswith("?"):
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"reflectionQuestion must contain exactly one trailing '?', found {q_marks_in_question}"))
    full_text = " ".join(filter(None, [primary, alt, question]))
    if full_text.count("?") != q_marks_in_question:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "a '?' appears outside reflectionQuestion"))

    # 10. At most one alternative (schema-shape already enforces single
    # string/null; also reject multi-hypothesis phrasing inside primary).
    multi_hypothesis_markers = ["bir başka olası yorum", "üçüncü bir olasılık", "ikinci bir olasılık"]
    marker_hits = sum(1 for m in multi_hypothesis_markers if m in primary.lower())
    if marker_hits > 1:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", "primaryInterpretation reads as multiple hypotheses"))

    # 12. Unconfirmed signal rejection — output may narrow, never widen.
    expected_signals = set(expected_context_refs.get("signals", []))
    output_signals = set(used_refs.get("signals", [])) if isinstance(used_refs.get("signals"), list) else set()
    if not output_signals.issubset(expected_signals):
        violations.append(OutputValidationError("UNCONFIRMED_SIGNAL", f"output signals {output_signals} not a subset of expected {expected_signals}"))

    # 13. Fabricated symbol check.
    lowered_full = full_text.lower()
    for excluded in EXCLUDED_CANDIDATE_SYMBOLS:
        if excluded in lowered_full:
            violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"references a symbol not on the governed artwork: '{excluded}'"))

    # 11/14/15/16/17. Hard safety gates (prophecy, command, diagnosis,
    # legal/financial/medical outcome, third-party mind-reading,
    # dependency encouragement, magical causality, etc.)
    is_direction = expected_context_refs.get("position") == "direction"
    gates = run_textual_hard_gates(full_text, is_direction_position=is_direction)
    if gates:
        violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"hard safety gate(s) violated: {gates}"))

    # 18. Chain-of-thought leak check.
    for phrase in _COT_LEAK_PHRASES:
        if phrase in lowered_full:
            violations.append(OutputValidationError("OUTPUT_CONTRACT_INVALID", f"chain-of-thought leak phrase found: '{phrase}'"))
            break

    return violations


def main(argv: list[str]) -> int:
    if len(argv) != 4:
        print("usage: validate_interpretation_output.py <output.json> <expected-context-refs.json> <presentation-preference>", file=sys.stderr)
        return 2
    raw_text = Path(argv[1]).read_text(encoding="utf-8")
    expected = json.loads(Path(argv[2]).read_text(encoding="utf-8"))
    preference = argv[3]
    violations = validate_interpretation_output(raw_text, expected, preference)
    if violations:
        for v in violations:
            print(f"INVALID: {v}")
        return 1
    print("VALID")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
