"""Question assumption audit (IG-2 §17).

Scans every question/focus text the graph exposes for phrasing that
presupposes a specific negative state about the user rather than
neutrally inviting them to explore whether it's true. An explicit
signal being present does not exempt a question from this check —
the master prompt is explicit that even a confirmed signal should
still be asked about neutrally, not asserted back at the user.
"""
from __future__ import annotations

from .tr_normalize import tr_contains_phrase

ASSUMPTION_MARKERS: dict[str, list[str]] = {
    "tension-exists": ["gerginlik var mı", "gerilim var mı", "sessizce taşınan bir gerginlik"],
    "violation-exists": ["ihlal var", "sınır ihlali var", "istismar var"],
    "user-struggling": ["zorlandığınız", "zorlanıyorsunuz", "zorlandığınızı"],
    "user-afraid": ["korktuğunuz", "korkuyorsunuz", "korktuğunuzu"],
    "user-failing": ["başarısız olduğunuz", "başarısızsınız", "başarısız olduğunuzu"],
    "something-unsustainable": ["artık sürdürülemez", "sürdürülemez olduğunu"],
    "must-give-up": ["bırakmanız gerek", "bırakmalısınız", "vazgeçmelisiniz"],
    "past-trauma": ["travma yaşadığınız", "travma geçirdiğiniz", "travma yaşadığınızı"],
    "relationship-bad": ["kötü bir ilişki", "ilişkiniz kötü"],
    "user-controlling": ["kontrolcü olduğunuz", "kontrolcüsünüz", "kontrolcü birisiniz"],
}


def audit_text(text: str, source_path: str) -> list[dict]:
    """Returns a list of {sourcePath, category, matchedPhrase, text} for
    every assumption marker found in `text`. Empty list = clean."""
    findings = []
    for category, phrases in ASSUMPTION_MARKERS.items():
        for phrase in phrases:
            if tr_contains_phrase(text, phrase):
                findings.append(
                    {"sourcePath": source_path, "category": category, "matchedPhrase": phrase, "text": text}
                )
    return findings


def audit_card_node(card: dict) -> list[dict]:
    """Comprehensive scan: context followUpQuestion, signal
    reflectionQuestion, position reflectionQuestions, adaptive questions
    — every field IG-2 §17 names, not just the three already fixed."""
    findings: list[dict] = []
    for ctx_id, ctx in card["reflectionLayer"]["contexts"].items():
        findings.extend(audit_text(ctx["followUpQuestion"], f"contexts.{ctx_id}.followUpQuestion"))
        findings.extend(audit_text(ctx["focus"], f"contexts.{ctx_id}.focus"))
    for signal_id, lens in card["reflectionLayer"]["userSignalLenses"].items():
        findings.extend(audit_text(lens["reflectionQuestion"], f"userSignalLenses.{signal_id}.reflectionQuestion"))
        findings.extend(audit_text(lens["focus"], f"userSignalLenses.{signal_id}.focus"))
    for pos_id, pos in card["reflectionLayer"]["positions"].items():
        for i, q in enumerate(pos["reflectionQuestions"]):
            findings.extend(audit_text(q, f"positions.{pos_id}.reflectionQuestions[{i}]"))
    for q in card["reflectionLayer"]["adaptiveQuestionRefs"]:
        findings.extend(audit_text(q["question"], f"adaptiveQuestionRefs.{q['id']}.question"))
    return findings


def audit_golden_cases(golden_cases: list[dict]) -> list[dict]:
    findings: list[dict] = []
    for case in golden_cases:
        findings.extend(
            audit_text(case["output"]["reflectionQuestion"], f"goldenCases.{case['id']}.output.reflectionQuestion")
        )
    return findings
