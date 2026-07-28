#!/usr/bin/env python3
"""Thin CLI bridge over lib/safety_patterns.py, so the TS test suite
(src/__tests__/unit/interpretation-graph-evaluation.test.ts) can
black-box test the real Python hard-gate detectors via subprocess
instead of re-implementing the same phrase lists a second time in
JavaScript — one source of truth for what counts as unsafe text.

Usage: check_hard_gates_cli.py <text> [--direction]
Prints a JSON array of violated hard-gate IDs (possibly empty) to stdout.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.safety_patterns import run_textual_hard_gates  # noqa: E402


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: check_hard_gates_cli.py <text> [--direction]", file=sys.stderr)
        return 2
    text = argv[1]
    is_direction = "--direction" in argv[2:]
    violated = run_textual_hard_gates(text, is_direction_position=is_direction)
    print(json.dumps(violated, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
