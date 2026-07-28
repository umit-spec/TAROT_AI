#!/usr/bin/env python3
"""Thin CLI bridge over lib/tr_normalize.py for the TS test suite.

Usage:
  tr_normalize_cli.py contains-word <text> <word>
  tr_normalize_cli.py contains-diagnosis-tani <text>
  tr_normalize_cli.py normalize-position <text>

Prints 'true'/'false' (contains-*) or the normalized string
(normalize-position) to stdout.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from lib.tr_normalize import contains_diagnosis_tani, normalize_position_token, tr_contains_word  # noqa: E402


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        print("usage: see module docstring", file=sys.stderr)
        return 2
    cmd = argv[1]
    if cmd == "contains-word" and len(argv) == 4:
        print("true" if tr_contains_word(argv[2], argv[3]) else "false")
        return 0
    if cmd == "contains-diagnosis-tani" and len(argv) == 3:
        print("true" if contains_diagnosis_tani(argv[2]) else "false")
        return 0
    if cmd == "normalize-position" and len(argv) == 3:
        print(normalize_position_token(argv[2]))
        return 0
    print("bad arguments", file=sys.stderr)
    return 2


if __name__ == "__main__":
    sys.exit(main(sys.argv))
