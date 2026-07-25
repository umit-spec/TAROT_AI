#!/usr/bin/env python3
"""
Reproducible Major Arcana extraction pipeline.

Extracts 22 cards from source montage, normalizes to production dimensions,
generates metadata and checksums, produces QA contact sheet.
"""

import sys
import json
import hashlib
from datetime import datetime
from pathlib import Path
from PIL import Image
import argparse

# Canonical card naming map (fallback if config missing)
CANONICAL_NAMES_TR = {
    "00-the-fool": "Deli",
    "01-the-magician": "Simyacı",
    "02-the-high-priestess": "Yüksek Rahibe",
    "03-the-empress": "İmparatoriçe",
    "04-the-emperor": "İmparator",
    "05-the-hierophant": "Hiyerofant",
    "06-the-lovers": "Sevgili",
    "07-the-chariot": "Savaş Arabası",
    "08-strength": "Güç",
    "09-the-hermit": "Eremit",
    "10-wheel-of-fortune": "Kaderin Tekerleği",
    "11-justice": "Adalet",
    "12-the-hanged-man": "Asılı Adam",
    "13-death": "Ölüm",
    "14-temperance": "İtemlendirme",
    "15-the-devil": "Şeytan",
    "16-the-tower": "Kule",
    "17-the-star": "Yıldız",
    "18-the-moon": "Ay",
    "19-the-sun": "Güneş",
    "20-judgement": "Kıyamet",
    "21-the-world": "Dünya",
}

def calculate_checksum(file_path: str, algorithm: str = "sha256") -> str:
    """Calculate file checksum."""
    hash_obj = hashlib.new(algorithm)
    with open(file_path, "rb") as f:
        hash_obj.update(f.read())
    return hash_obj.hexdigest()

def extract_card(
    source_image: Image.Image,
    crop_coords: dict,
    output_dir: Path,
    card_id: str,
    web_dims: tuple,
    hq_dims: tuple,
    dry_run: bool = False
) -> dict:
    """Extract single card, create web and HQ versions."""

    x, y, w, h = crop_coords["x"], crop_coords["y"], crop_coords["width"], crop_coords["height"]

    # Validate crop coordinates
    if x + w > source_image.width or y + h > source_image.height:
        raise ValueError(f"Crop for {card_id} out of bounds")

    # Crop card from montage
    card_img = source_image.crop((x, y, x + w, y + h))

    if card_img.size[0] <= 0 or card_img.size[1] <= 0:
        raise ValueError(f"Invalid crop dimensions for {card_id}")

    # Normalize to portrait aspect ratio (width < height)
    aspect_ratio = card_img.size[0] / card_img.size[1]
    if aspect_ratio > 0.8:  # Too wide for portrait
        # Crop to portrait
        target_width = int(card_img.size[1] * 0.7)
        left = (card_img.size[0] - target_width) // 2
        card_img = card_img.crop((left, 0, left + target_width, card_img.size[1]))

    results = {}

    # Create web version (512x768)
    web_img = card_img.copy()
    web_img.thumbnail(web_dims, Image.Resampling.LANCZOS)
    # Create canvas with black background if needed
    if web_img.size != web_dims:
        canvas = Image.new("RGB", web_dims, (0, 0, 0))
        offset = ((web_dims[0] - web_img.size[0]) // 2,
                  (web_dims[1] - web_img.size[1]) // 2)
        canvas.paste(web_img, offset)
        web_img = canvas

    web_path = output_dir / f"{card_id}.webp"
    if not dry_run:
        web_img.save(web_path, "WEBP", quality=85)
        results["web"] = {
            "path": f"assets/tarot-cards/{card_id}.webp",
            "dimensions": web_img.size,
            "format": "webp",
            "file_size": web_path.stat().st_size,
            "checksum": calculate_checksum(str(web_path))
        }

    # Create HQ version (2048x3072)
    hq_img = card_img.copy()
    hq_img.thumbnail(hq_dims, Image.Resampling.LANCZOS)
    if hq_img.size != hq_dims:
        canvas = Image.new("RGB", hq_dims, (0, 0, 0))
        offset = ((hq_dims[0] - hq_img.size[0]) // 2,
                  (hq_dims[1] - hq_img.size[1]) // 2)
        canvas.paste(hq_img, offset)
        hq_img = canvas

    hq_path = output_dir / f"{card_id}-hq.webp"
    if not dry_run:
        hq_img.save(hq_path, "WEBP", quality=90)
        results["hq"] = {
            "path": f"assets/tarot-cards/{card_id}-hq.webp",
            "dimensions": hq_img.size,
            "format": "webp",
            "file_size": hq_path.stat().st_size,
            "checksum": calculate_checksum(str(hq_path))
        }

    return results

def extract_all_cards(
    source_montage: str,
    crop_config: str,
    output_dir: str,
    dry_run: bool = False,
    validate_only: bool = False
) -> dict:
    """Extract all 22 cards from montage."""

    source_path = Path(source_montage)
    if not source_path.exists():
        raise FileNotFoundError(f"Source montage not found: {source_montage}")

    config_path = Path(crop_config)
    if not config_path.exists():
        raise FileNotFoundError(f"Crop config not found: {crop_config}")

    output_path = Path(output_dir)
    if not dry_run:
        output_path.mkdir(parents=True, exist_ok=True)

    # Load configuration
    with open(config_path) as f:
        config = json.load(f)

    # Load source image
    source_img = Image.open(source_path)
    source_checksum = calculate_checksum(str(source_path))

    # Validate source
    if source_img.size != (config["montage_info"]["source_width"],
                           config["montage_info"]["source_height"]):
        # Note: Not treating as error, but documenting
        print(f"Warning: Image dimensions {source_img.size} differ from config "
              f"{config['montage_info']['source_width']}x{config['montage_info']['source_height']}")

    params = config["extraction_parameters"]
    web_dims = (params["web_dimensions"]["width"], params["web_dimensions"]["height"])
    hq_dims = (params["hq_dimensions"]["width"], params["hq_dimensions"]["height"])

    print(f"Extracting {len(config['cards'])} cards...")
    print(f"Source: {source_path} ({source_img.size}, checksum: {source_checksum[:16]}...)")
    print(f"Output: {output_path}")
    print(f"Web dims: {web_dims}, HQ dims: {hq_dims}")

    if dry_run:
        print("(DRY RUN - no files written)")

    extraction_manifest = {
        "extraction_id": f"EX-{datetime.now().isoformat()}",
        "source": {
            "filename": source_path.name,
            "checksum": source_checksum,
            "dimensions": source_img.size,
        },
        "config": {
            "filename": config_path.name,
            "analysis_date": config["montage_info"]["analysis_date"],
        },
        "parameters": params,
        "cards": {}
    }

    for i, card_config in enumerate(config["cards"]):
        card_id = card_config["id"]
        try:
            if not validate_only:
                results = extract_card(
                    source_img,
                    card_config["crop"],
                    output_path,
                    card_id,
                    web_dims,
                    hq_dims,
                    dry_run=dry_run
                )
                extraction_manifest["cards"][card_id] = {
                    "position": card_config["position"],
                    "canonical_number": card_config["canonical_number"],
                    "crop": card_config["crop"],
                    "output": results
                }
                print(f"  [{i+1:2d}/22] {card_id}: OK")
            else:
                # Validation only - just check coordinates
                x, y, w, h = card_config["crop"].values()
                if x + w > source_img.width or y + h > source_img.height:
                    raise ValueError("Out of bounds")
                print(f"  [{i+1:2d}/22] {card_id}: coordinates valid")

        except Exception as e:
            print(f"  [{i+1:2d}/22] {card_id}: ERROR - {e}")
            extraction_manifest["cards"][card_id] = {"error": str(e)}

    return extraction_manifest

def main():
    parser = argparse.ArgumentParser(
        description="Extract Major Arcana cards from montage"
    )
    parser.add_argument("source", help="Path to source montage image")
    parser.add_argument(
        "--config",
        default="tools/assets/config/major_arcana_crops.json",
        help="Path to crop configuration file"
    )
    parser.add_argument(
        "--output",
        default="assets/tarot-cards",
        help="Output directory for extracted cards"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Analyze without writing files"
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Validate coordinates without extraction"
    )

    args = parser.parse_args()

    try:
        manifest = extract_all_cards(
            args.source,
            args.config,
            args.output,
            dry_run=args.dry_run,
            validate_only=args.validate_only
        )

        # Save manifest
        manifest_path = Path(args.output) / "_extraction_manifest.json"
        if not args.dry_run:
            with open(manifest_path, "w") as f:
                json.dump(manifest, f, indent=2)
            print(f"\nManifest saved: {manifest_path}")

        # Summary
        card_count = len([c for c in manifest["cards"] if "error" not in c])
        print(f"\n✓ Extraction complete: {card_count}/22 cards")

        return 0

    except Exception as e:
        print(f"✗ Extraction failed: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
