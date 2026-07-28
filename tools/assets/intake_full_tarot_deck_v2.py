#!/usr/bin/env python3
"""Validate and stage the Full Tarot Deck V2 source archive.

This tool performs binary intake only. It does not update card registries,
import assets into the UI, or grant FAZ 9 approval.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import shutil
import sys
import zipfile
from datetime import date
from pathlib import Path, PurePosixPath

from PIL import Image

EXPECTED_ARCHIVE_SHA256 = "580ae8f69759e060ac20e3df9dc68eae6fdf66e2f4ad97f3ef49fdef979eef9c"
EXPECTED_PNG_COUNT = 79
EXPECTED_MAJOR_COUNT_WITH_BACK = 23
EXPECTED_MINOR_COUNT = 56
EXPECTED_LOW_RES_KINGS = {
    "Minor_Arcana/Kings/Asa_Krali.png",
    "Minor_Arcana/Kings/Kilic_Krali.png",
    "Minor_Arcana/Kings/Kupa_Krali.png",
    "Minor_Arcana/Kings/Tilsim_Krali.png",
}
ALLOWED_NON_IMAGE_ENTRIES = {"README.txt", "manifest.json"}


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def safe_member_path(name: str) -> PurePosixPath:
    member = PurePosixPath(name)
    if member.is_absolute() or ".." in member.parts or not member.parts:
        raise ValueError(f"unsafe archive path: {name!r}")
    return member


def role_for(path: str) -> str:
    if path == "Major_Arcana/Card_Back.png":
        return "card_back"
    if path.startswith("Major_Arcana/"):
        return "major_arcana_card"
    return "minor_arcana_card"


def validate_archive(archive: Path) -> tuple[list[dict], dict[str, bytes]]:
    actual_archive_hash = sha256_file(archive)
    if actual_archive_hash != EXPECTED_ARCHIVE_SHA256:
        raise ValueError(
            "archive SHA-256 mismatch: "
            f"expected {EXPECTED_ARCHIVE_SHA256}, got {actual_archive_hash}"
        )

    assets: list[dict] = []
    payloads: dict[str, bytes] = {}

    with zipfile.ZipFile(archive) as bundle:
        file_names = [entry.filename for entry in bundle.infolist() if not entry.is_dir()]
        for name in file_names:
            safe_member_path(name)

        png_names = sorted(name for name in file_names if name.lower().endswith(".png"))
        non_image_names = set(file_names) - set(png_names)

        if len(png_names) != EXPECTED_PNG_COUNT:
            raise ValueError(f"expected 79 PNG files, found {len(png_names)}")
        if non_image_names != ALLOWED_NON_IMAGE_ENTRIES:
            raise ValueError(
                "unexpected non-image archive entries: "
                f"expected {sorted(ALLOWED_NON_IMAGE_ENTRIES)}, got {sorted(non_image_names)}"
            )

        major = [name for name in png_names if name.startswith("Major_Arcana/")]
        minor = [name for name in png_names if name.startswith("Minor_Arcana/")]
        unknown = sorted(set(png_names) - set(major) - set(minor))

        if unknown:
            raise ValueError(f"PNG files outside governed folders: {unknown}")
        if len(major) != EXPECTED_MAJOR_COUNT_WITH_BACK:
            raise ValueError(f"expected 23 Major/Card-Back PNG files, found {len(major)}")
        if len(minor) != EXPECTED_MINOR_COUNT:
            raise ValueError(f"expected 56 Minor Arcana PNG files, found {len(minor)}")

        low_res_paths: set[str] = set()
        for name in png_names:
            data = bundle.read(name)
            payloads[name] = data
            with Image.open(io.BytesIO(data)) as image:
                image.verify()
            with Image.open(io.BytesIO(data)) as image:
                width, height = image.size

            if (width, height) == (512, 768):
                low_res_paths.add(name)
            elif (width, height) != (1024, 1536):
                raise ValueError(f"unexpected dimensions for {name}: {width}x{height}")

            assets.append(
                {
                    "source_archive_path": name,
                    "target_path": f"assets/tarot-cards-v2/images/{name}",
                    "sha256": sha256_bytes(data),
                    "bytes": len(data),
                    "width": width,
                    "height": height,
                    "media_type": "image/png",
                    "role": role_for(name),
                    "creator": (
                        "Ümit Karakeleş using OpenAI ChatGPT image generation "
                        "under user-directed prompts"
                    ),
                    "license_id": "IE-AI-OUTPUT-PROPRIETARY-1.0",
                    "commercial_use": "permitted_subject_to_terms_and_applicable_law",
                    "evidence_location": (
                        "docs/evidence/FULL_DECK_V2_PROVENANCE_DECLARATION.md"
                    ),
                    "status": "checksum_verified_source",
                }
            )

        if low_res_paths != EXPECTED_LOW_RES_KINGS:
            raise ValueError(
                "512x768 source set differs from the four recorded King cards: "
                f"{sorted(low_res_paths)}"
            )

    summary = {
        "archive_sha256": actual_archive_hash,
        "png_count": len(assets),
        "major_arcana_and_back": len(major),
        "minor_arcana": len(minor),
        "dimensions_1024x1536": sum(
            1 for asset in assets if (asset["width"], asset["height"]) == (1024, 1536)
        ),
        "dimensions_512x768": sum(
            1 for asset in assets if (asset["width"], asset["height"]) == (512, 768)
        ),
    }
    return assets, payloads


def write_assets(payloads: dict[str, bytes], output_root: Path) -> None:
    if output_root.exists() and any(output_root.rglob("*")):
        raise ValueError(f"refusing to write into non-empty directory: {output_root}")

    for name, data in payloads.items():
        destination = output_root.joinpath(*PurePosixPath(name).parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(data)


def write_manifest(assets: list[dict], summary: dict, manifest_path: Path) -> None:
    manifest = {
        "schema_version": "1.0.0",
        "manifest_id": "insight-engine-full-tarot-deck-v2-provenance",
        "generated_on": date.today().isoformat(),
        "deck": {
            "name": "Insight Engine Tarot — Full Deck V2",
            "deck_cards": 78,
            "card_backs": 1,
            "image_assets_total": 79,
            "major_arcana_cards": 22,
            "minor_arcana_cards": 56,
            "orientation": "upright-only for MVP",
            "integration_status": "staging_only_not_integrated",
        },
        "source_archive": {
            "filename": "insight_engine_tarot_cards_bundle_FULL.zip",
            "sha256": summary["archive_sha256"],
            "repository_status": "archive_not_committed",
        },
        "rights_profile": {
            "license_id": "IE-AI-OUTPUT-PROPRIETARY-1.0",
            "rights_holder_record": (
                "Ümit Karakeleş, subject to applicable law and platform terms"
            ),
            "generation_service": "OpenAI ChatGPT image generation",
            "commercial_use": "permitted_subject_to_terms_and_applicable_law",
            "copyright_registrability": "jurisdiction_dependent_not_warranted",
            "output_uniqueness": "not_guaranteed",
            "canva_status": (
                "uploaded_user_content; final_licensed_content_audit_pending"
            ),
        },
        "intake_summary": summary,
        "assets": assets,
    }
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("archive", type=Path, help="Path to the supplied V2 ZIP")
    parser.add_argument(
        "--extract",
        action="store_true",
        help="Write the verified PNG files to the governed staging path",
    )
    parser.add_argument(
        "--output-root",
        type=Path,
        default=Path("assets/tarot-cards-v2/images"),
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        default=Path("assets/tarot-cards-v2/provenance-manifest.json"),
    )
    args = parser.parse_args()

    if not args.archive.is_file():
        print(f"FAIL: archive not found: {args.archive}", file=sys.stderr)
        return 1

    try:
        assets, payloads = validate_archive(args.archive)
        summary = {
            "archive_sha256": EXPECTED_ARCHIVE_SHA256,
            "png_count": len(assets),
            "major_arcana_and_back": sum(
                1 for asset in assets if asset["role"] in {"major_arcana_card", "card_back"}
            ),
            "minor_arcana": sum(
                1 for asset in assets if asset["role"] == "minor_arcana_card"
            ),
            "dimensions_1024x1536": sum(
                1 for asset in assets if (asset["width"], asset["height"]) == (1024, 1536)
            ),
            "dimensions_512x768": sum(
                1 for asset in assets if (asset["width"], asset["height"]) == (512, 768)
            ),
        }
        if args.extract:
            write_assets(payloads, args.output_root)
            write_manifest(assets, summary, args.manifest)
    except (OSError, ValueError, zipfile.BadZipFile) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        return 1

    print("PASS: source archive matches the locked Full Deck V2 identity.")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if not args.extract:
        print("Validation only: no files were written. Re-run with --extract to stage binaries and create the per-file manifest.")
    else:
        print(f"Staged assets: {args.output_root}")
        print(f"Wrote manifest: {args.manifest}")
        print("No UI integration was performed; FAZ 9 approval remains required.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
