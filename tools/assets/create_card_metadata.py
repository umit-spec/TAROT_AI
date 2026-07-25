#!/usr/bin/env python3
"""
Create metadata JSON files for each card.
"""

import json
from pathlib import Path
from datetime import datetime

CARD_METADATA = {
    "00-the-fool": {
        "name_en": "The Fool",
        "name_tr": "Deli",
        "number": 0,
        "arcana": "major"
    },
    "01-the-magician": {
        "name_en": "The Magician",
        "name_tr": "Simyacı",
        "number": 1,
        "arcana": "major"
    },
    "02-the-high-priestess": {
        "name_en": "The High Priestess",
        "name_tr": "Yüksek Rahibe",
        "number": 2,
        "arcana": "major"
    },
    "03-the-empress": {
        "name_en": "The Empress",
        "name_tr": "İmparatoriçe",
        "number": 3,
        "arcana": "major"
    },
    "04-the-emperor": {
        "name_en": "The Emperor",
        "name_tr": "İmparator",
        "number": 4,
        "arcana": "major"
    },
    "05-the-hierophant": {
        "name_en": "The Hierophant",
        "name_tr": "Hiyerofant",
        "number": 5,
        "arcana": "major"
    },
    "06-the-lovers": {
        "name_en": "The Lovers",
        "name_tr": "Sevgili",
        "number": 6,
        "arcana": "major"
    },
    "07-the-chariot": {
        "name_en": "The Chariot",
        "name_tr": "Savaş Arabası",
        "number": 7,
        "arcana": "major"
    },
    "08-strength": {
        "name_en": "Strength",
        "name_tr": "Güç",
        "number": 8,
        "arcana": "major"
    },
    "09-the-hermit": {
        "name_en": "The Hermit",
        "name_tr": "Eremit",
        "number": 9,
        "arcana": "major"
    },
    "10-wheel-of-fortune": {
        "name_en": "Wheel of Fortune",
        "name_tr": "Kaderin Tekerleği",
        "number": 10,
        "arcana": "major"
    },
    "11-justice": {
        "name_en": "Justice",
        "name_tr": "Adalet",
        "number": 11,
        "arcana": "major"
    },
    "12-the-hanged-man": {
        "name_en": "The Hanged Man",
        "name_tr": "Asılı Adam",
        "number": 12,
        "arcana": "major"
    },
    "13-death": {
        "name_en": "Death",
        "name_tr": "Ölüm",
        "number": 13,
        "arcana": "major"
    },
    "14-temperance": {
        "name_en": "Temperance",
        "name_tr": "İtemlendirme",
        "number": 14,
        "arcana": "major"
    },
    "15-the-devil": {
        "name_en": "The Devil",
        "name_tr": "Şeytan",
        "number": 15,
        "arcana": "major"
    },
    "16-the-tower": {
        "name_en": "The Tower",
        "name_tr": "Kule",
        "number": 16,
        "arcana": "major"
    },
    "17-the-star": {
        "name_en": "The Star",
        "name_tr": "Yıldız",
        "number": 17,
        "arcana": "major"
    },
    "18-the-moon": {
        "name_en": "The Moon",
        "name_tr": "Ay",
        "number": 18,
        "arcana": "major"
    },
    "19-the-sun": {
        "name_en": "The Sun",
        "name_tr": "Güneş",
        "number": 19,
        "arcana": "major"
    },
    "20-judgement": {
        "name_en": "Judgement",
        "name_tr": "Kıyamet",
        "number": 20,
        "arcana": "major"
    },
    "21-the-world": {
        "name_en": "The World",
        "name_tr": "Dünya",
        "number": 21,
        "arcana": "major"
    }
}

def create_metadata_files(asset_dir: str):
    """Create metadata JSON for each card."""

    asset_path = Path(asset_dir)

    # Load extraction manifest for technical details
    manifest_path = asset_path / "_extraction_manifest.json"
    extraction_data = {}
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
            extraction_data = manifest.get("cards", {})

    print(f"Creating metadata files for {len(CARD_METADATA)} cards...")

    for card_id, card_info in CARD_METADATA.items():
        extraction_info = extraction_data.get(card_id, {})

        metadata = {
            "id": card_id,
            "name": {
                "en": card_info["name_en"],
                "tr": card_info["name_tr"]
            },
            "number": card_info["number"],
            "arcana": card_info["arcana"],
            "source": {
                "type": "provided_illustration",
                "montage": "1000214766.png",
                "extraction_date": "2026-07-22",
                "position": extraction_info.get("position", {}),
                "crop_coordinates": extraction_info.get("crop", {})
            },
            "assets": {
                "web": extraction_info.get("output", {}).get("web", {}),
                "hq": extraction_info.get("output", {}).get("hq", {})
            },
            "provenance": {
                "status": "approved-for-prototype",
                "notes": "Extracted from user-provided montage image",
                "extraction_date": "2026-07-22",
                "version": "1.0"
            },
            "qa": {
                "score": None,
                "status": "pending-review",
                "notes": "Extracted from montage, pending visual QA"
            }
        }

        metadata_path = asset_path / f"{card_id}-metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        print(f"  ✓ {card_id}")

    print(f"\n✓ Created {len(CARD_METADATA)} metadata files")

if __name__ == "__main__":
    create_metadata_files("assets/tarot-cards")
