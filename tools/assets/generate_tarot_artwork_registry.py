#!/usr/bin/env python3
"""Generates src/lib/tarot-card-artwork.ts by reconciling three sources:

1. The real CardId catalog the reading engine uses (data/cards/*.json) -
   exactly 22 Major Arcana cards. This app has no Minor Arcana CardId at
   all (src/server/reading-engine/cards.ts hard-fails if it ever finds
   anything other than exactly 22 cards numbered 0-21), so the governed
   deck's 56 Minor Arcana derivatives are intentionally NOT registered
   here - there is no CardId they could ever be shown for.
2. The canonical per-file provenance manifest
   (assets/tarot-cards-v2/provenance-manifest.json).
3. The production derivative manifest
   (assets/tarot-cards-v2/derivatives/derivative-manifest.json).

Fails loudly (non-zero exit, no partial registry written) on: a missing
CardId, a missing derivative, a dimension other than 512x768, a hash
mismatch between the derivative manifest and the actual bytes on disk in
public/assets/tarot-cards/v2/, or a missing card back.

Usage:
    python3 tools/assets/generate_tarot_artwork_registry.py [--check]

--check: verify the generated file matches what would be generated (dry
run, no write); exits non-zero on any diff. Used to prove the checked-in
registry is not stale.
"""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CARDS_DIR = REPO_ROOT / "data" / "cards"
PROVENANCE_MANIFEST = REPO_ROOT / "assets" / "tarot-cards-v2" / "provenance-manifest.json"
DERIVATIVE_MANIFEST = REPO_ROOT / "assets" / "tarot-cards-v2" / "derivatives" / "derivative-manifest.json"
PUBLIC_DIR = REPO_ROOT / "public" / "assets" / "tarot-cards" / "v2"
OUTPUT_TS = REPO_ROOT / "src" / "lib" / "tarot-card-artwork.ts"

EXPECTED_WIDTH = 512
EXPECTED_HEIGHT = 768
EXPECTED_CARD_COUNT = 22


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def fail(msg: str) -> None:
    print(f"FATAL: {msg}", file=sys.stderr)
    sys.exit(1)


def load_real_cards() -> list[dict]:
    files = sorted(p for p in CARDS_DIR.glob("*.json"))
    cards = [json.loads(p.read_text()) for p in files]
    if len(cards) != EXPECTED_CARD_COUNT:
        fail(f"expected {EXPECTED_CARD_COUNT} real CardId entries in data/cards, found {len(cards)}")
    ids = {c["cardId"] for c in cards}
    if len(ids) != EXPECTED_CARD_COUNT:
        fail("duplicate cardId detected in data/cards")
    numbers = sorted(c["number"] for c in cards)
    if numbers != list(range(EXPECTED_CARD_COUNT)):
        fail(f"card numbering gap/duplicate: {numbers}")
    return sorted(cards, key=lambda c: c["number"])


def load_provenance() -> dict[str, dict]:
    manifest = json.loads(PROVENANCE_MANIFEST.read_text())
    return {a["source_archive_path"]: a for a in manifest["assets"]}


def load_derivatives() -> dict[str, dict]:
    manifest = json.loads(DERIVATIVE_MANIFEST.read_text())
    by_source = {}
    for e in manifest["entries"]:
        source_rel = e["canonical_source_path"].split("images/", 1)[-1]
        by_source[source_rel] = e
    return by_source


MAJOR_ARCANA_FILENAME_BY_NUMBER = {
    0: "00_Deli", 1: "01_Buyucu", 2: "02_Yuksek_Rahibe", 3: "03_Imparatorice",
    4: "04_Imparator", 5: "05_Aziz", 6: "06_Asiklar", 7: "07_Savas_Arabasi",
    8: "08_Guc", 9: "09_Ermis", 10: "10_Kader_Carki", 11: "11_Adalet",
    12: "12_Asilan_Adam", 13: "13_Olum", 14: "14_Denge", 15: "15_Seytan",
    16: "16_Kule", 17: "17_Yildiz", 18: "18_Ay", 19: "19_Gunes",
    20: "20_Yargi", 21: "21_Dunya",
}


def build_registry() -> tuple[list[tuple[str, dict]], dict]:
    real_cards = load_real_cards()
    provenance = load_provenance()
    derivatives = load_derivatives()

    entries: list[tuple[str, dict]] = []
    for card in real_cards:
        number = card["number"]
        card_id = card["cardId"]
        stem = MAJOR_ARCANA_FILENAME_BY_NUMBER.get(number)
        if stem is None:
            fail(f"no known Full Deck V2 filename mapping for card number {number} ({card_id})")
        source_rel = f"Major_Arcana/{stem}.png"
        deriv = derivatives.get(source_rel)
        if deriv is None:
            fail(f"missing derivative for {card_id} (expected source {source_rel})")
        prov = provenance.get(source_rel)
        if prov is None:
            fail(f"missing provenance entry for {source_rel}")
        if prov["sha256"] != deriv["canonical_source_sha256"]:
            fail(f"canonical source hash mismatch for {card_id}: provenance={prov['sha256']} derivative={deriv['canonical_source_sha256']}")
        if (deriv["output_width"], deriv["output_height"]) != (EXPECTED_WIDTH, EXPECTED_HEIGHT):
            fail(f"unexpected derivative dimensions for {card_id}: {deriv['output_width']}x{deriv['output_height']}")

        public_file = PUBLIC_DIR / f"{stem}.webp"
        if not public_file.is_file():
            fail(f"public derivative missing on disk for {card_id}: {public_file}")
        on_disk_sha = sha256_of(public_file)
        if on_disk_sha != deriv["output_sha256"]:
            fail(f"public file hash mismatch for {card_id}: on-disk={on_disk_sha} manifest={deriv['output_sha256']}")

        entries.append((card_id, {
            "src": f"/assets/tarot-cards/v2/{stem}.webp",
            "width": EXPECTED_WIDTH,
            "height": EXPECTED_HEIGHT,
            "sourceSha256": prov["sha256"],
            "derivativeSha256": deriv["output_sha256"],
        }))

    seen_ids = [cid for cid, _ in entries]
    if len(seen_ids) != len(set(seen_ids)):
        fail("duplicate CardId in generated registry")
    if len(entries) != EXPECTED_CARD_COUNT:
        fail(f"expected exactly {EXPECTED_CARD_COUNT} registry entries, built {len(entries)}")

    # Card back
    back_source_rel = "Major_Arcana/Card_Back.png"
    back_deriv = derivatives.get(back_source_rel)
    back_prov = provenance.get(back_source_rel)
    if back_deriv is None or back_prov is None:
        fail("missing card back derivative or provenance entry")
    if back_prov["sha256"] != back_deriv["canonical_source_sha256"]:
        fail("card back canonical source hash mismatch")
    back_public = PUBLIC_DIR / "Card_Back.webp"
    if not back_public.is_file():
        fail(f"public card back file missing on disk: {back_public}")
    back_on_disk_sha = sha256_of(back_public)
    if back_on_disk_sha != back_deriv["output_sha256"]:
        fail("public card back hash mismatch")
    if (back_deriv["output_width"], back_deriv["output_height"]) != (EXPECTED_WIDTH, EXPECTED_HEIGHT):
        fail("unexpected card back derivative dimensions")

    card_back = {
        "src": "/assets/tarot-cards/v2/Card_Back.webp",
        "width": EXPECTED_WIDTH,
        "height": EXPECTED_HEIGHT,
        "sourceSha256": back_prov["sha256"],
        "derivativeSha256": back_deriv["output_sha256"],
    }

    return entries, card_back


def render_ts(entries: list[tuple[str, dict]], card_back: dict) -> str:
    lines = []
    lines.append("// GENERATED — DO NOT EDIT")
    lines.append("// Produced by tools/assets/generate_tarot_artwork_registry.py from:")
    lines.append("//   - data/cards/*.json (the real CardId catalog the reading engine uses)")
    lines.append("//   - assets/tarot-cards-v2/provenance-manifest.json (canonical source hashes)")
    lines.append("//   - assets/tarot-cards-v2/derivatives/derivative-manifest.json (production WebP hashes)")
    lines.append("//")
    lines.append("// This registry is exhaustive over the app's real 22-card Major Arcana")
    lines.append("// CardId catalog only (docs/UI_PREMIUM_V1.md FAZ 9). The governed Full Deck")
    lines.append("// V2 asset set also includes 56 Minor Arcana cards, but the reading engine")
    lines.append("// (src/server/reading-engine/cards.ts) hard-fails unless data/cards contains")
    lines.append("// exactly 22 Major Arcana cards - there is no CardId a Minor Arcana card")
    lines.append("// could ever be shown for, so none is registered here.")
    lines.append("")
    lines.append("export type CardId =")
    for cid, _ in entries:
        lines.append(f"  | '{cid}'")
    lines[-1] += ";"
    lines.append("")
    lines.append("export type CardArtworkEntry = {")
    lines.append("  src: string;")
    lines.append("  width: 512;")
    lines.append("  height: 768;")
    lines.append("  sourceSha256: string;")
    lines.append("  derivativeSha256: string;")
    lines.append("};")
    lines.append("")
    lines.append("export const CARD_ARTWORK = {")
    for cid, entry in entries:
        lines.append(f"  '{cid}': {{")
        lines.append(f"    src: '{entry['src']}',")
        lines.append(f"    width: {entry['width']},")
        lines.append(f"    height: {entry['height']},")
        lines.append(f"    sourceSha256: '{entry['sourceSha256']}',")
        lines.append(f"    derivativeSha256: '{entry['derivativeSha256']}',")
        lines.append("  },")
    lines.append("} satisfies Record<CardId, CardArtworkEntry>;")
    lines.append("")
    lines.append("export const CARD_BACK_ARTWORK: CardArtworkEntry = {")
    lines.append(f"  src: '{card_back['src']}',")
    lines.append(f"  width: {card_back['width']},")
    lines.append(f"  height: {card_back['height']},")
    lines.append(f"  sourceSha256: '{card_back['sourceSha256']}',")
    lines.append(f"  derivativeSha256: '{card_back['derivativeSha256']}',")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    check_only = "--check" in sys.argv
    entries, card_back = build_registry()
    rendered = render_ts(entries, card_back)

    if check_only:
        if not OUTPUT_TS.is_file():
            fail(f"{OUTPUT_TS} does not exist")
        current = OUTPUT_TS.read_text()
        if current != rendered:
            fail(f"{OUTPUT_TS} is stale relative to its sources - re-run without --check")
        print(f"OK: {OUTPUT_TS} is up to date ({len(entries)} cards + card back)")
        return 0

    OUTPUT_TS.write_text(rendered)
    print(f"Wrote {OUTPUT_TS} ({len(entries)} cards + card back)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
