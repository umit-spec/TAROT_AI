/**
 * Single source of the crisis response's user-facing text (message +
 * resource list), shared by /api/readings and the future
 * /api/readings/preview endpoint (docs/ADR-UX-FRAMING-PREVIEW.md R7/G-6)
 * so there is ONE copy, never diverging duplicates.
 *
 * SAFETY-REVIEWED. The resource list below was verified in a governed safety
 * review against the authorized official sources (İçişleri Bakanlığı /
 * 112 Acil Çağrı Merkezi, Aile ve Sosyal Hizmetler Bakanlığı). The full
 * evidence — each line's institution, purpose, and display rules — is
 * recorded in docs/SAFETY_CRISIS_RESOURCES_REVIEW.md (review date 2026-07-24).
 *
 * First-safe-version decision (deliberately conservative):
 * - 112 is the single unified emergency number for immediate danger and
 *   self-harm risk; it is the primary and only line shown on every crisis
 *   response.
 * - 155 (Polis İmdat) is REMOVED: police/emergency calls are consolidated
 *   under 112.
 * - The private 0312 "intihar önleme" line is REMOVED: it could not be
 *   verified against an official saglik.gov.tr source. No guessed or
 *   third-party number is substituted.
 * - ALO 183 is NOT in the runtime crisis list. It is a social-support /
 *   violence line (aile, kadın, çocuk, engelli, yaşlı), not an emergency
 *   alternative to 112. The current crisis gate returns one uniform response
 *   and does not reliably branch on crisis subtype, so showing 183 on every
 *   crisis message could misrepresent a non-emergency line as emergency help.
 *   183 is therefore deferred to a future, context-aware routing change
 *   (docs/ADR-UX-FRAMING-PREVIEW.md §1.2; docs/SAFETY_CRISIS_RESOURCES_REVIEW.md).
 */

export interface CrisisResource {
  label: string;
  contact: string;
}

// 112 Acil Çağrı Merkezi — the single unified emergency number (İçişleri
// Bakanlığı). Primary crisis resource for immediate danger / self-harm risk.
export const CRISIS_RESOURCES: readonly CrisisResource[] = [
  { label: 'Acil tehlike veya kendine zarar verme riski — 112', contact: '112' },
];

export const CRISIS_MESSAGE =
  'Bu zor bir durum olabilir. Yalnız değilsiniz - profesyonel destek almanız önemli.';
