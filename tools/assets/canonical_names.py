#!/usr/bin/env python3
"""
Canonical card naming and Turkish localization
Authority: docs/05-VISUAL_CONSTITUTION.md
"""

CARDS = [
    {"number": 0, "id": "00-fool", "name_en": "The Fool", "name_tr": "Deli"},
    {"number": 1, "id": "01-magician", "name_en": "The Magician", "name_tr": "Büyücü"},
    {"number": 2, "id": "02-high-priestess", "name_en": "The High Priestess", "name_tr": "Yüksek Rahibe"},
    {"number": 3, "id": "03-empress", "name_en": "The Empress", "name_tr": "İmparatoriçe"},
    {"number": 4, "id": "04-emperor", "name_en": "The Emperor", "name_tr": "İmparator"},
    {"number": 5, "id": "05-hierophant", "name_en": "The Hierophant", "name_tr": "Hiyerofant"},
    {"number": 6, "id": "06-lovers", "name_en": "The Lovers", "name_tr": "Âşıklar"},
    {"number": 7, "id": "07-chariot", "name_en": "The Chariot", "name_tr": "Savaş Arabası"},
    {"number": 8, "id": "08-strength", "name_en": "Strength", "name_tr": "Güç"},
    {"number": 9, "id": "09-hermit", "name_en": "The Hermit", "name_tr": "Ermiş"},
    {"number": 10, "id": "10-wheel-of-fortune", "name_en": "Wheel of Fortune", "name_tr": "Kaderin Tekerleği"},
    {"number": 11, "id": "11-justice", "name_en": "Justice", "name_tr": "Adalet"},
    {"number": 12, "id": "12-hanged-man", "name_en": "The Hanged Man", "name_tr": "Asılı Adam"},
    {"number": 13, "id": "13-death", "name_en": "Death", "name_tr": "Ölüm"},
    {"number": 14, "id": "14-temperance", "name_en": "Temperance", "name_tr": "Denge"},
    {"number": 15, "id": "15-devil", "name_en": "The Devil", "name_tr": "Şeytan"},
    {"number": 16, "id": "16-tower", "name_en": "The Tower", "name_tr": "Kule"},
    {"number": 17, "id": "17-star", "name_en": "The Star", "name_tr": "Yıldız"},
    {"number": 18, "id": "18-moon", "name_en": "The Moon", "name_tr": "Ay"},
    {"number": 19, "id": "19-sun", "name_en": "The Sun", "name_tr": "Güneş"},
    {"number": 20, "id": "20-judgement", "name_en": "Judgement", "name_tr": "Yargı"},
    {"number": 21, "id": "21-world", "name_en": "The World", "name_tr": "Dünya"},
]

# Validation
assert len(CARDS) == 22, "Must have exactly 22 cards"
assert len(set(c["id"] for c in CARDS)) == 22, "No duplicate IDs"
assert len(set(c["number"] for c in CARDS)) == 22, "No duplicate numbers"
assert all(0 <= c["number"] <= 21 for c in CARDS), "All numbers 0-21"
assert CARDS[8]["id"] == "08-strength", "Strength is card 8 (not 11)"
assert CARDS[11]["id"] == "11-justice", "Justice is card 11 (not 8)"
assert CARDS[16]["id"] == "16-tower", "Tower is card 16 (not 17)"
assert CARDS[17]["id"] == "17-star", "Star is card 17 (not 16)"

print("✓ Canonical card names locked")
print(f"✓ {len(CARDS)} cards validated")
