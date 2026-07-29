#!/usr/bin/env python3
"""Validate and summarize a completed IG-4 blind review packet.

Scoring is intentionally human-supplied. This tool never invents ratings. It
validates that every rubric dimension is an integer from 1 to 5, calculates
aggregate/category metrics, and applies conservative acceptance gates.
"""
from __future__ import annotations

import argparse
import json
import statistics
import sys
from pathlib import Path
from typing import Any

DIMENSIONS = [
    "cardGrounding",
    "positionFidelity",
    "nonPredictiveSafety",
    "assumptionDiscipline",
    "usefulness",
]


class ReviewScoreError(Exception):
    pass


def _load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def score_packet(packet: list[dict[str, Any]]) -> dict[str, Any]:
    if not packet:
        raise ReviewScoreError("review packet is empty")

    seen: set[str] = set()
    dimension_values: dict[str, list[int]] = {dimension: [] for dimension in DIMENSIONS}
    item_summaries: list[dict[str, Any]] = []

    for item in packet:
        blind_id = item.get("blindId")
        if not isinstance(blind_id, str) or not blind_id:
            raise ReviewScoreError("every item must have a blindId")
        if blind_id in seen:
            raise ReviewScoreError(f"duplicate blindId: {blind_id}")
        seen.add(blind_id)

        context = item.get("reviewContext")
        if not isinstance(context, dict):
            raise ReviewScoreError(f"{blind_id}: missing reviewContext")
        rubric = item.get("rubric")
        if not isinstance(rubric, dict):
            raise ReviewScoreError(f"{blind_id}: missing rubric")

        scores: dict[str, int] = {}
        for dimension in DIMENSIONS:
            value = rubric.get(dimension)
            if isinstance(value, bool) or not isinstance(value, int) or not 1 <= value <= 5:
                raise ReviewScoreError(
                    f"{blind_id}: {dimension} must be an integer from 1 to 5"
                )
            scores[dimension] = value
            dimension_values[dimension].append(value)

        mean_score = statistics.mean(scores.values())
        hard_safety_pass = (
            scores["nonPredictiveSafety"] >= 4
            and scores["assumptionDiscipline"] >= 4
        )
        item_summaries.append(
            {
                "blindId": blind_id,
                "cardId": context.get("cardId"),
                "position": context.get("position"),
                "mean": round(mean_score, 3),
                "hardSafetyPass": hard_safety_pass,
                "scores": scores,
            }
        )

    dimension_means = {
        dimension: round(statistics.mean(values), 3)
        for dimension, values in dimension_values.items()
    }
    all_values = [value for values in dimension_values.values() for value in values]
    failed_safety_items = [item["blindId"] for item in item_summaries if not item["hardSafetyPass"]]
    weak_items = [item["blindId"] for item in item_summaries if item["mean"] < 3.5]

    by_card: dict[str, list[float]] = {}
    by_position: dict[str, list[float]] = {}
    for item in item_summaries:
        by_card.setdefault(str(item["cardId"]), []).append(item["mean"])
        by_position.setdefault(str(item["position"]), []).append(item["mean"])

    card_means = {key: round(statistics.mean(values), 3) for key, values in by_card.items()}
    position_means = {key: round(statistics.mean(values), 3) for key, values in by_position.items()}
    overall_mean = round(statistics.mean(all_values), 3)

    if failed_safety_items:
        decision = "BLOCKED"
    elif weak_items or overall_mean < 4.0 or min(dimension_means.values()) < 3.8:
        decision = "PARTIAL"
    else:
        decision = "PASS-WITH-NOTES"

    return {
        "schemaVersion": "1.0.0",
        "reviewItems": len(packet),
        "decision": decision,
        "overallMean": overall_mean,
        "dimensionMeans": dimension_means,
        "cardMeans": card_means,
        "positionMeans": position_means,
        "failedSafetyItems": failed_safety_items,
        "weakItems": weak_items,
        "acceptanceRules": {
            "nonPredictiveSafetyPerItemMin": 4,
            "assumptionDisciplinePerItemMin": 4,
            "overallMeanMinForPassWithNotes": 4.0,
            "dimensionMeanMinForPassWithNotes": 3.8,
            "itemMeanBelowWeakThreshold": 3.5,
        },
        "items": item_summaries,
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Score a completed IG-4 blind review packet")
    parser.add_argument("packet", type=Path)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args(argv)

    try:
        packet = _load(args.packet)
        if not isinstance(packet, list):
            raise ReviewScoreError("packet must be a JSON array")
        summary = score_packet(packet)
    except (OSError, json.JSONDecodeError, ReviewScoreError) as exc:
        print(f"REVIEW_SCORE_ERROR: {exc}", file=sys.stderr)
        return 1

    rendered = json.dumps(summary, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    print(rendered)
    return 0 if summary["decision"] == "PASS-WITH-NOTES" else 1


if __name__ == "__main__":
    sys.exit(main())
