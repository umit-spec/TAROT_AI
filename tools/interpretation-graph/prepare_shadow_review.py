#!/usr/bin/env python3
"""Build a usable blinded human-review packet from an IG-4 run.

The model/case category, request ID, automatic validation result and original
case ID are hidden from the reviewer. The reviewer still receives the minimum
context required to judge the answer: card, position, topic, goal, confirmed
signals and the synthetic question. The unblind map is written separately.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import random
import sys
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATASET = (
    REPO_ROOT
    / "data"
    / "interpretation-graph"
    / "shadow-evaluation"
    / "two-card-shadow-cases.json"
)


class ReviewPacketError(Exception):
    pass


def _load(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def build_packet(results: list[dict[str, Any]], dataset: dict[str, Any], run_id: str) -> tuple[list[dict[str, Any]], dict[str, str]]:
    cases = {case["id"]: case for case in dataset.get("cases", [])}
    reviewable: list[tuple[dict[str, Any], dict[str, Any]]] = []
    for result in results:
        case_id = result.get("caseId")
        output = result.get("output")
        if not isinstance(case_id, str) or not isinstance(output, dict):
            continue
        case = cases.get(case_id)
        if not case:
            raise ReviewPacketError(f"result references unknown caseId: {case_id}")
        reviewable.append((result, case))

    seed = int(hashlib.sha256(run_id.encode("utf-8")).hexdigest()[:16], 16)
    rng = random.Random(seed)
    rng.shuffle(reviewable)

    packet: list[dict[str, Any]] = []
    unblind: dict[str, str] = {}
    for index, (result, case) in enumerate(reviewable, start=1):
        blind_id = f"shadow-review-{index:03d}"
        unblind[blind_id] = case["id"]
        input_data = case["input"]
        packet.append(
            {
                "blindId": blind_id,
                "reviewContext": {
                    "cardId": input_data["cardId"],
                    "position": input_data["position"],
                    "topic": input_data["topic"],
                    "goal": input_data["goal"],
                    "confirmedSignals": [
                        signal["signalId"] for signal in input_data.get("explicitSignals", [])
                    ],
                    "relationshipType": input_data.get("relationshipType"),
                    "syntheticQuestion": input_data["userQuestion"],
                },
                "output": result["output"],
                "rubric": {
                    "scale": "1=unacceptable, 2=weak, 3=usable-with-revision, 4=strong, 5=excellent",
                    "cardGrounding": None,
                    "positionFidelity": None,
                    "nonPredictiveSafety": None,
                    "assumptionDiscipline": None,
                    "usefulness": None,
                    "notes": "",
                },
            }
        )
    return packet, unblind


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build IG-4 blinded human-review packet")
    parser.add_argument("--run-dir", type=Path, required=True)
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    args = parser.parse_args(argv)

    results_path = args.run_dir / "results.json"
    summary_path = args.run_dir / "summary.json"
    if not results_path.exists() or not summary_path.exists():
        print("REVIEW_PACKET_ERROR: run directory must contain results.json and summary.json", file=sys.stderr)
        return 1

    try:
        results = _load(results_path)
        summary = _load(summary_path)
        dataset = _load(args.dataset)
        if not isinstance(results, list):
            raise ReviewPacketError("results.json must contain an array")
        run_id = summary.get("runId")
        if not isinstance(run_id, str) or not run_id:
            raise ReviewPacketError("summary.json has no runId")
        packet, unblind = build_packet(results, dataset, run_id)
    except (json.JSONDecodeError, OSError, ReviewPacketError) as exc:
        print(f"REVIEW_PACKET_ERROR: {exc}", file=sys.stderr)
        return 1

    (args.run_dir / "review-packet.json").write_text(
        json.dumps(packet, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (args.run_dir / "unblind-map.json").write_text(
        json.dumps(unblind, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps({"reviewItems": len(packet), "runId": run_id}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
