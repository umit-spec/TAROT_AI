"""Turkish-aware text normalization and matching for the Interpretation
Graph offline evaluation tooling (IG-2 §16).

Why this exists: JavaScript's default (non-`u`-flag) regex engine treats
`\\w`/`\\b` as ASCII-only, so patterns like `/tanı\\b/i` silently
mis-match inside unrelated Turkish words (`Tanıdık` = "familiar") because
`ı` (dotless i, U+0131) and `İ` (dotted capital I, U+0130) are not ASCII
word characters to that engine — this exact bug was found and fixed
twice already in this project (a Playwright button-selector regex, and
this graph's own DIAGNOSIS_PATTERN test regex in IG-1). Python's `re`
module IS Unicode-aware by default for `str` patterns, so the *word-
boundary* half of the bug does not reproduce here — but the *case-fold*
half still needs explicit handling, because Turkish has two distinct
"i" letters (dotted İ/i and dotless I/ı) that do not case-fold onto each
other under a naive `.lower()`/`.upper()` in most language runtimes'
default (non-Turkish) locale behavior. This module makes both concerns
explicit, tested, and independent of any particular regex engine's
default Unicode awareness.
"""
from __future__ import annotations

import unicodedata

# Turkish-specific case-fold pairs that a locale-naive `.lower()` gets
# wrong or leaves ambiguous: İ (dotted capital) folds to i, I (ASCII
# capital, "dotless" in the Turkish alphabet) folds to ı — the reverse of
# the English mapping most runtimes default to.
_TR_CASEFOLD_MAP = {
    "İ": "i",
    "I": "ı",
}


def normalize_tr_for_match(text: str) -> str:
    """Unicode-normalize and Turkish-casefold `text` for matching.

    Not a display transform — this is a matching-only normalization
    (safe to compare/contains-check, unsafe to show to a user as "the"
    canonical casing of their own text).
    """
    text = unicodedata.normalize("NFC", text)
    for upper, lower in _TR_CASEFOLD_MAP.items():
        text = text.replace(upper, lower)
    return text.lower()


def tr_word_tokens(text: str) -> list[str]:
    """Split into maximal runs of Unicode letters, Turkish-casefolded.

    Uses `str.isalpha()` per character rather than a `\\w`-based regex,
    so it is immune to any engine's ASCII-only word-character table —
    `ı`, `ğ`, `ü`, `ş`, `ö`, `ç` are all `str.isalpha() == True` in
    Python regardless of locale.
    """
    normalized = normalize_tr_for_match(text)
    tokens: list[str] = []
    current: list[str] = []
    for ch in normalized:
        if ch.isalpha():
            current.append(ch)
        else:
            if current:
                tokens.append("".join(current))
                current = []
    if current:
        tokens.append("".join(current))
    return tokens


def tr_contains_word(text: str, word: str) -> bool:
    """Whole-word, Turkish-casefolded match — 'tanı' never matches inside
    'tanıdık' this way, because they are different tokens once split on
    non-letter boundaries, independent of any \\b behavior."""
    target = normalize_tr_for_match(word)
    return target in tr_word_tokens(text)


def tr_contains_phrase(text: str, phrase: str) -> bool:
    """Multi-word, token-window phrase match (order-preserving, exact
    token sequence) — used for red-line phrases like 'kesinlikle
    olacak' that must not fire on the words appearing separately."""
    phrase_tokens = tr_word_tokens(phrase)
    if not phrase_tokens:
        return False
    text_tokens = tr_word_tokens(text)
    n = len(phrase_tokens)
    for i in range(len(text_tokens) - n + 1):
        if text_tokens[i : i + n] == phrase_tokens:
            return True
    return False


# Curated, deliberately non-exhaustive lexicon distinguishing the medical/
# diagnostic noun "tanı" (diagnosis) — and its case-suffixed inflections —
# from the unrelated adjective "tanıdık" (familiar/acquainted) and ITS
# inflections, which happen to share the same "tanı-" surface prefix.
# This is a curated rule for this evaluation's known regression cases,
# not a general-purpose Turkish morphological analyzer (IG-2 §16: "Regex
# yalnız yeterli değilse token tabanlı kontrol kullan").
_TANIDIK_FAMILY_PREFIXES = ("tanıdık", "tanıdığ")  # familiar/acquainted + its inflections
_TANI_DIAGNOSIS_FORMS = {
    "tanı",
    "tanısı",
    "tanıyı",
    "tanıya",
    "tanılar",
    "tanıdır",
    "tanıyla",
    "tanıdan",
}


def is_diagnosis_tani_token(token: str) -> bool:
    """True if `token` is the diagnosis-noun "tanı" or one of its known
    case-suffixed forms — false for "tanıdık"/"tanıdığ..." (familiar)
    even though both surface-share the "tanı-" prefix."""
    normalized = normalize_tr_for_match(token)
    if normalized.startswith(_TANIDIK_FAMILY_PREFIXES):
        return False
    return normalized in _TANI_DIAGNOSIS_FORMS


def contains_diagnosis_tani(text: str) -> bool:
    """Whole-text scan for the diagnosis-noun "tanı" using the curated
    lexicon above, token by token."""
    return any(is_diagnosis_tani_token(tok) for tok in tr_word_tokens(text))


def normalize_position_token(text: str) -> str:
    """Normalizes a position label to its canonical lowercase Turkish-
    casefolded token, so 'YÖN', 'Yön', and 'yön' all collapse to 'yön'."""
    return normalize_tr_for_match(text).strip()
