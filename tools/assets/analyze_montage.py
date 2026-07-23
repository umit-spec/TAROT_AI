#!/usr/bin/env python3
"""
Analyze Major Arcana montage image to detect card boundaries.
Outputs crop coordinates for all 22 cards.
"""

import sys
import json
from PIL import Image, ImageDraw
import numpy as np
from pathlib import Path

def analyze_montage(image_path: str) -> dict:
    """Analyze montage image and detect card boundaries."""

    img = Image.open(image_path)
    img_array = np.array(img)

    print(f"Image size: {img.size}")
    print(f"Image shape: {img_array.shape}")

    # Convert to grayscale for edge detection
    if len(img_array.shape) == 3:
        gray = np.mean(img_array, axis=2)
    else:
        gray = img_array

    # Calculate differences to find boundaries
    diff_x = np.abs(np.diff(gray, axis=1))
    diff_y = np.abs(np.diff(gray, axis=0))

    # Find strong horizontal and vertical lines
    h_edges = np.where(np.sum(diff_y > 20, axis=1) > img.size[0] * 0.3)[0]
    v_edges = np.where(np.sum(diff_x > 20, axis=0) > img.size[1] * 0.3)[0]

    print(f"\nHorizontal edges (potential row boundaries): {len(h_edges)} detected")
    print(f"Vertical edges (potential column boundaries): {len(v_edges)} detected")

    # For manual analysis, print some edge positions
    if len(h_edges) > 0:
        h_unique = []
        last = -100
        for h in sorted(h_edges):
            if h - last > 50:  # Group nearby edges
                h_unique.append(h)
                last = h
        print(f"Grouped horizontal edges: {h_unique[:10]}")

    if len(v_edges) > 0:
        v_unique = []
        last = -100
        for v in sorted(v_edges):
            if v - last > 50:  # Group nearby edges
                v_unique.append(v)
                last = v
        print(f"Grouped vertical edges: {v_unique[:15]}")

    return {
        "image_size": img.size,
        "h_edges_detected": len(h_edges),
        "v_edges_detected": len(v_edges)
    }

def create_crop_config(image_path: str, manual_coordinates: dict = None) -> dict:
    """Create crop configuration based on image analysis."""

    img = Image.open(image_path)
    width, height = img.size

    # Canonical position map from master prompt
    canonical_map = [
        # Row 1: positions 0-7
        ("00-the-fool", 0, 0), ("01-the-magician", 0, 1), ("02-the-high-priestess", 0, 2),
        ("03-the-empress", 0, 3), ("04-the-emperor", 0, 4), ("05-the-hierophant", 0, 5),
        ("06-the-lovers", 0, 6), ("07-the-chariot", 0, 7),
        # Row 2: positions 8-15
        ("08-strength", 1, 0), ("09-the-hermit", 1, 1), ("10-wheel-of-fortune", 1, 2),
        ("11-justice", 1, 3), ("12-the-hanged-man", 1, 4), ("13-death", 1, 5),
        ("14-temperance", 1, 6), ("15-the-devil", 1, 7),
        # Row 3: positions 16-21
        ("16-the-tower", 2, 0), ("17-the-star", 2, 1), ("18-the-moon", 2, 2),
        ("19-the-sun", 2, 3), ("20-judgement", 2, 4), ("21-the-world", 2, 5),
    ]

    # Estimate card dimensions from image
    # If user provides manual coordinates, use those. Otherwise estimate.
    if manual_coordinates:
        return manual_coordinates

    # Conservative estimate: cards are roughly portrait (height > width)
    # 3 rows, so height / 3 gives approximate card height
    # 8 columns in widest row, so width / 8 gives approximate card width

    estimated_card_height = height // 3
    estimated_card_width = width // 8

    print(f"\nEstimated card dimensions: {estimated_card_width} x {estimated_card_height}")
    print(f"Aspect ratio: {estimated_card_width / estimated_card_height:.2f}")
    print("(Cards should be portrait, so width < height)")

    return None  # Will be manually created

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python analyze_montage.py <image_path>")
        sys.exit(1)

    image_path = sys.argv[1]

    if not Path(image_path).exists():
        print(f"Error: Image not found: {image_path}")
        sys.exit(1)

    print("Analyzing montage image...\n")
    results = analyze_montage(image_path)
    print(json.dumps(results, indent=2))
