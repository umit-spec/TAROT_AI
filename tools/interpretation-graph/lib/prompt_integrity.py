"""SHA-256 canonical-JSON integrity hashes for prompt bundles (IG-3 §14).

Standard library only (hashlib, json). Canonical form: UTF-8, sorted
keys, compact separators, ensure_ascii=False (so a Turkish character
and its escaped \\uXXXX form never hash differently by accident).

These hashes are NOT a security signature — they detect accidental
drift and tampering-after-the-fact for reproducibility and audit
purposes, not cryptographic authentication of a message's origin. This
limitation is stated in every place these hashes are documented,
matching the master prompt's own explicit instruction.
"""
from __future__ import annotations

import hashlib
import json


def canonical_json(obj: object) -> str:
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def compute_context_hash(bounded_context: dict) -> str:
    return sha256_hex(canonical_json(bounded_context))


def compute_question_hash(normalized_question_text: str) -> str:
    return sha256_hex(normalized_question_text)


def compute_template_hash(template_version: str, system_prompt: str) -> str:
    return sha256_hex(canonical_json({"templateVersion": template_version, "systemPrompt": system_prompt}))


def compute_bundle_hash(bundle: dict) -> str:
    """Hashes the bundle with its own integrity block blanked out (empty
    strings) first, so the bundle's hash doesn't try to hash itself."""
    blanked = dict(bundle)
    blanked["integrity"] = {"contextHash": "", "questionHash": "", "templateHash": "", "bundleHash": ""}
    return sha256_hex(canonical_json(blanked))


def verify_bundle_hash(bundle: dict) -> bool:
    """Recomputes bundleHash from the bundle's own current content and
    compares — the tamper-detection check the validator/evaluator use."""
    return compute_bundle_hash(bundle) == bundle["integrity"]["bundleHash"]
