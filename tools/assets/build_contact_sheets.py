#!/usr/bin/env python3
"""Builds low-resolution contact sheets from the production WebP
derivatives, for human visual QA (V2-D013). QA artifacts only - never
served by the application."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

REPO_ROOT = Path(__file__).resolve().parents[2]
DERIV_ROOT = REPO_ROOT / "assets" / "tarot-cards-v2" / "derivatives" / "webp"
OUT_ROOT = REPO_ROOT / "docs" / "evidence" / "visual-qa" / "full-deck-v2"

THUMB_W, THUMB_H = 160, 240
PAD = 12
LABEL_H = 22
COLS_MAJOR = 6
COLS_SUIT = 4

SUITS = {
    "Asa": "Wands / Asa",
    "Kilic": "Swords / Kılıç",
    "Kupa": "Cups / Kupa",
    "Tilsim": "Pentacles / Tılsım",
}


def load_font():
    try:
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 12)
    except Exception:
        return ImageFont.load_default()


def build_sheet(entries: list[tuple[Path, str]], cols: int, out_path: Path, title: str) -> None:
    font = load_font()
    rows = (len(entries) + cols - 1) // cols
    cell_w = THUMB_W + PAD
    cell_h = THUMB_H + LABEL_H + PAD
    title_h = 30
    sheet_w = cols * cell_w + PAD
    sheet_h = rows * cell_h + PAD + title_h
    sheet = Image.new("RGB", (sheet_w, sheet_h), (20, 18, 26))
    draw = ImageDraw.Draw(sheet)
    draw.text((PAD, 6), title, fill=(230, 220, 200), font=font)

    for i, (path, label) in enumerate(entries):
        r, c = divmod(i, cols)
        x = PAD + c * cell_w
        y = title_h + PAD + r * cell_h
        with Image.open(path) as im:
            thumb = im.convert("RGB").resize((THUMB_W, THUMB_H), Image.LANCZOS)
        sheet.paste(thumb, (x, y))
        draw.text((x, y + THUMB_H + 4), label, fill=(220, 210, 230), font=font)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out_path, format="JPEG", quality=82)
    print(f"wrote {out_path} ({sheet_w}x{sheet_h}, {len(entries)} cards)")


def main() -> None:
    major_dir = DERIV_ROOT / "Major_Arcana"
    major_files = sorted(major_dir.glob("*.webp"))
    entries = [(p, p.stem) for p in major_files]
    build_sheet(entries, COLS_MAJOR, OUT_ROOT / "01-major-arcana-and-back.jpg", "Major Arcana + Card Back (23)")

    for prefix, title in SUITS.items():
        suit_files = sorted(DERIV_ROOT.rglob(f"Minor_Arcana/**/{prefix}_*.webp"))
        entries = [(p, p.stem) for p in suit_files]
        safe = prefix.lower()
        build_sheet(entries, COLS_SUIT, OUT_ROOT / f"0{2 + list(SUITS).index(prefix)}-{safe}.jpg", f"{title} (14)")


if __name__ == "__main__":
    main()
