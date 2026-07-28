#!/usr/bin/env python3
"""Deterministic production-derivative exporter for Full Tarot Deck V2.

Reads the canonical, governed PNG sources under
assets/tarot-cards-v2/images/ (never modified by this tool) and writes
fixed-dimension WebP derivatives under
assets/tarot-cards-v2/derivatives/webp/, mirroring the canonical
directory structure. Also writes a derivative manifest recording the
exact transform applied to every file so the export is auditable and
reproducible (docs/ASSET_LICENSING_DEBT_LOG_FULL_DECK_V2.md V2-D012).

Usage:
    python3 tools/assets/export_full_tarot_deck_v2.py

Run from the repository root (or the asset preparation worktree root).
Running it twice against the same sources must produce byte-identical
WebP output (verified separately, not by this script).
"""

from __future__ import annotations

import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, __version__ as PIL_VERSION

REPO_ROOT = Path(__file__).resolve().parents[2]
SOURCE_ROOT = REPO_ROOT / "assets" / "tarot-cards-v2" / "images"
OUTPUT_ROOT = REPO_ROOT / "assets" / "tarot-cards-v2" / "derivatives" / "webp"
MANIFEST_PATH = REPO_ROOT / "assets" / "tarot-cards-v2" / "derivatives" / "derivative-manifest.json"

TARGET_WIDTH = 512
TARGET_HEIGHT = 768
WEBP_QUALITY = 88
WEBP_METHOD = 6
RESAMPLING_NAME = "LANCZOS"
TOOL_VERSION = "1.0.0"


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def export_one(source_path: Path) -> dict:
    rel = source_path.relative_to(SOURCE_ROOT)
    output_path = OUTPUT_ROOT / rel.with_suffix(".webp")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    source_sha = sha256_of(source_path)
    source_bytes = source_path.stat().st_size

    with Image.open(source_path) as im:
        source_width, source_height = im.size
        # Deterministic: strip all metadata (EXIF/ICC/orientation) by
        # rebuilding a fresh RGB image from raw pixel data - re-opening
        # never carries an info dict forward.
        im = im.convert("RGB")

        if (source_width, source_height) == (TARGET_WIDTH, TARGET_HEIGHT):
            # Governed low-resolution King sources: never upscaled.
            out_im = im
        else:
            out_im = im.resize((TARGET_WIDTH, TARGET_HEIGHT), Image.LANCZOS)

        out_im.save(
            output_path,
            format="WEBP",
            quality=WEBP_QUALITY,
            method=WEBP_METHOD,
            lossless=False,
            exact=False,
        )

    output_sha = sha256_of(output_path)
    output_bytes = output_path.stat().st_size

    return {
        "canonical_source_path": str(source_path.relative_to(REPO_ROOT)),
        "canonical_source_sha256": source_sha,
        "output_path": str(output_path.relative_to(REPO_ROOT)),
        "output_sha256": output_sha,
        "source_width": source_width,
        "source_height": source_height,
        "output_width": TARGET_WIDTH,
        "output_height": TARGET_HEIGHT,
        "source_bytes": source_bytes,
        "output_bytes": output_bytes,
        "format": "WEBP",
        "quality": WEBP_QUALITY,
        "method": WEBP_METHOD,
        "resampling": RESAMPLING_NAME if (source_width, source_height) != (TARGET_WIDTH, TARGET_HEIGHT) else "none (already at target dimensions)",
        "colorspace": "RGB",
        "metadata_policy": "stripped (EXIF removed, no ICC profile embedded, orientation normalized via re-decode)",
        "converter": "Pillow",
        "converter_version": PIL_VERSION,
        "tool_version": TOOL_VERSION,
        "generated_at": None,  # filled in by caller for the whole run
    }


def main() -> int:
    if not SOURCE_ROOT.is_dir():
        print(f"FATAL: canonical source directory not found: {SOURCE_ROOT}", file=sys.stderr)
        return 1

    sources = sorted(SOURCE_ROOT.rglob("*.png"))
    if not sources:
        print("FATAL: no PNG sources found under canonical images/", file=sys.stderr)
        return 1

    generated_at = datetime.now(timezone.utc).isoformat()
    entries = []
    for source_path in sources:
        entry = export_one(source_path)
        entry["generated_at"] = generated_at
        entries.append(entry)

    output_hashes = [e["output_sha256"] for e in entries]
    duplicate_hashes = len(output_hashes) != len(set(output_hashes))

    total_source_bytes = sum(e["source_bytes"] for e in entries)
    total_output_bytes = sum(e["output_bytes"] for e in entries)
    dims = {}
    for e in entries:
        key = f"{e['source_width']}x{e['source_height']}"
        dims[key] = dims.get(key, 0) + 1

    manifest = {
        "schema_version": "1.0",
        "generated_at": generated_at,
        "tool": "tools/assets/export_full_tarot_deck_v2.py",
        "tool_version": TOOL_VERSION,
        "pillow_version": PIL_VERSION,
        "summary": {
            "expected": 79,
            "generated": len(entries),
            "missing": max(0, 79 - len(entries)),
            "extra": max(0, len(entries) - 79),
            "duplicate_output_hashes": duplicate_hashes,
            "total_source_bytes": total_source_bytes,
            "total_output_bytes": total_output_bytes,
            "compression_ratio": round(total_output_bytes / total_source_bytes, 4) if total_source_bytes else None,
            "source_dimension_distribution": dims,
            "output_width": TARGET_WIDTH,
            "output_height": TARGET_HEIGHT,
        },
        "entries": entries,
    }

    MANIFEST_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2, sort_keys=False)
        f.write("\n")

    print(f"Exported {len(entries)} derivatives to {OUTPUT_ROOT}")
    print(f"Manifest written to {MANIFEST_PATH}")
    print(f"Duplicate output hashes: {duplicate_hashes}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
