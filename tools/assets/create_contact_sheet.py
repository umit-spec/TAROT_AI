#!/usr/bin/env python3
"""
Create QA contact sheet showing all 22 Major Arcana cards.
Used to visually verify extraction order and card identity.
"""

import sys
import json
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

def create_contact_sheet(asset_dir: str, output_path: str):
    """Create contact sheet with all 22 cards."""

    asset_path = Path(asset_dir)
    if not asset_path.exists():
        raise FileNotFoundError(f"Asset directory not found: {asset_dir}")

    # Load extraction manifest to get card order
    manifest_path = asset_path / "_extraction_manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)
        cards = manifest["cards"]
    else:
        # Fallback: scan directory
        cards = {}
        for f in sorted(asset_path.glob("*.webp")):
            if not f.name.endswith("-hq.webp"):
                card_id = f.stem
                cards[card_id] = {"canonical_number": int(card_id.split("-")[0])}

    # Sort by canonical number
    sorted_cards = sorted(
        cards.items(),
        key=lambda x: x[1].get("canonical_number", 999)
    )

    print(f"Creating contact sheet with {len(sorted_cards)} cards...")

    # Load all web images
    images = []
    labels = []
    for card_id, card_data in sorted_cards:
        card_path = asset_path / f"{card_id}.webp"
        if card_path.exists():
            img = Image.open(card_path)
            images.append(img)
            labels.append(card_id)
        else:
            print(f"  Warning: Image not found: {card_path}")

    if not images:
        raise ValueError("No images found to process")

    # Create grid: 6 columns (2 rows of 6, 2 rows of 5-6)
    # Better: 4 rows x 6 cards (some rows have 8 in original, but we'll do 4x6 for readability)
    # Actually: match original layout 8-8-6
    cols = 4  # 4 columns for better viewing
    rows = (len(images) + cols - 1) // cols

    # Card dimensions (all are now 512x768)
    card_w, card_h = images[0].size if images else (512, 768)

    # Layout
    margin = 20
    label_height = 30
    cell_w = card_w + 2 * margin
    cell_h = card_h + label_height + 2 * margin

    # Canvas size
    canvas_w = cols * cell_w
    canvas_h = rows * cell_h + 50  # Extra for header

    canvas = Image.new("RGB", (canvas_w, canvas_h), (20, 20, 30))
    draw = ImageDraw.Draw(canvas)

    # Draw title
    title = "Major Arcana — QA Contact Sheet"
    draw.text((20, 10), title, fill=(200, 160, 120), font=None)

    # Draw cards
    for idx, (img, label) in enumerate(zip(images, labels)):
        row = idx // cols
        col = idx % cols

        x = col * cell_w + margin
        y = 50 + row * cell_h + margin

        # Paste card image
        canvas.paste(img, (x, y))

        # Draw label
        label_y = y + card_h + 5
        draw.text((x, label_y), label, fill=(200, 160, 120), font=None)

    # Save contact sheet
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_file, "PNG")

    print(f"✓ Contact sheet saved: {output_path}")
    print(f"  Canvas size: {canvas_w} x {canvas_h}")
    print(f"  Grid: {cols} columns x {rows} rows")
    print(f"  Cards: {len(images)}/22")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_contact_sheet.py <asset_dir> [output_path]")
        sys.exit(1)

    asset_dir = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else "validation/evidence/assets/major-arcana-contact-sheet.png"

    try:
        create_contact_sheet(asset_dir, output_path)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)
