/**
 * Single source of the crisis response's user-facing text (message +
 * resource list), shared by /api/readings and /api/readings/preview
 * (docs/ADR-UX-FRAMING-PREVIEW.md R7/G-6) so there is ONE copy, never
 * diverging duplicates.
 *
 * SAFETY-REVIEWED. The resource list was verified in a governed safety review
 * against authorized official sources (İçişleri Bakanlığı / 112 Acil Çağrı
 * Merkezi, Aile ve Sosyal Hizmetler Bakanlığı). Full evidence — each line's
 * institution, purpose, and display rules — is in
 * docs/SAFETY_CRISIS_RESOURCES_REVIEW.md (review date 2026-07-24).
 *
 * ---
 *
 * H2 CHANGE: subtype routing structure, with the runtime list unchanged.
 *
 * The 2026-07-24 review deferred ALO 183 because the crisis gate "does not
 * reliably branch on crisis subtype and the underlying keyword sets are too
 * coarse for a safety-critical branch". H2 replaced those keyword sets, so
 * condition (a) of that deferral is now arguably met.
 *
 * Conditions (b) and (c) are met here: this module now selects resources BY
 * SUBTYPE and every entry carries provenance and a review date.
 *
 * WHAT IS DELIBERATELY NOT DONE: 183 is still not shown at runtime. Adding a
 * phone number to a crisis screen is a binding safety determination reserved
 * to the Product Owner, not an engineering change — the previous review says
 * so explicitly and was signed off by a human. The entry below is staged with
 * `runtimeEnabled: false` and the exact review it is waiting on. Flipping that
 * flag is a human decision, and the test suite asserts it is still false so
 * the flip cannot happen silently.
 */

export interface CrisisResource {
  label: string;
  contact: string;
}

/**
 * A staged resource with the provenance a safety reviewer needs: who publishes
 * it, which official source verified it, when that verification happened, when
 * it must be re-checked, and whether it may be shown at runtime today.
 */
export interface GovernedCrisisResource extends CrisisResource {
  /** Publishing institution. */
  institution: string;
  /** Official source URL the entry was verified against. */
  sourceUrl: string;
  /** ISO date of the last human verification. */
  verifiedOn: string;
  /** ISO date by which the entry must be re-verified. */
  reviewBy: string;
  /** Role accountable for that re-verification. */
  reviewOwner: string;
  /** Crisis subtypes this resource is appropriate for. */
  appliesTo: readonly CrisisSubtype[];
  /** Whether the entry may be rendered today. Human-controlled. */
  runtimeEnabled: boolean;
  /** When runtimeEnabled is false, what is being waited on. */
  blockedReason?: string;
}

export type CrisisSubtype =
  | 'crisis_suicide_detected'
  | 'crisis_violence_detected'
  | 'crisis_medical_detected'
  | 'crisis_assault_detected';

const ALL_SUBTYPES: readonly CrisisSubtype[] = [
  'crisis_suicide_detected',
  'crisis_violence_detected',
  'crisis_medical_detected',
  'crisis_assault_detected',
];

/**
 * The governed registry. Order here is display order.
 *
 * 112 is first and applies to every subtype: it is the single unified
 * emergency number and coordinates health, police, jandarma and fire.
 */
export const GOVERNED_CRISIS_RESOURCES: readonly GovernedCrisisResource[] = [
  {
    label: 'Acil tehlike veya kendine zarar verme riski — 112',
    contact: '112',
    institution: '112 Acil Çağrı Merkezi — İçişleri Bakanlığı',
    sourceUrl: 'https://www.112.gov.tr/',
    verifiedOn: '2026-07-24',
    reviewBy: '2027-07-24',
    reviewOwner: 'Product Owner (binding safety determination)',
    appliesTo: ALL_SUBTYPES,
    runtimeEnabled: true,
  },
  {
    label: 'Aile, kadın, çocuk ve şiddet destek hattı — ALO 183',
    contact: '183',
    institution: 'Aile ve Sosyal Hizmetler Bakanlığı',
    sourceUrl: 'https://www.aile.gov.tr/',
    verifiedOn: '2026-07-24',
    reviewBy: '2027-07-24',
    reviewOwner: 'Product Owner (binding safety determination)',
    appliesTo: ['crisis_assault_detected', 'crisis_violence_detected'],
    runtimeEnabled: false,
    blockedReason:
      'ALO 183 is a social-support line, NOT an emergency alternative to 112. ' +
      'docs/SAFETY_CRISIS_RESOURCES_REVIEW.md §4 requires a Product Owner safety ' +
      'determination before it is shown. H2 supplies the reliable subtype signal ' +
      'that review asked for; the determination itself is still outstanding.',
  },
];

/**
 * Resources for a given set of detected subtypes.
 *
 * Fail-safe by construction: an unknown, empty, or unrecognized subtype set
 * yields the always-applicable emergency line rather than an empty list. A
 * crisis screen must never render with no way to get help.
 */
export function resourcesForSubtypes(subtypes: readonly string[]): CrisisResource[] {
  const active = GOVERNED_CRISIS_RESOURCES.filter((r) => r.runtimeEnabled);

  const matched = active.filter(
    (r) => r.appliesTo.some((s) => subtypes.includes(s)) || r.appliesTo.length === ALL_SUBTYPES.length
  );

  const chosen = matched.length > 0 ? matched : active.filter((r) => r.appliesTo.length === ALL_SUBTYPES.length);

  return chosen.map(({ label, contact }) => ({ label, contact }));
}

/**
 * Backwards-compatible flat list: exactly what the runtime showed before H2.
 * Kept so existing callers and the pinned regression tests are unaffected.
 */
export const CRISIS_RESOURCES: readonly CrisisResource[] = GOVERNED_CRISIS_RESOURCES.filter(
  (r) => r.runtimeEnabled
).map(({ label, contact }) => ({ label, contact }));

export const CRISIS_MESSAGE =
  'Bu zor bir durum olabilir. Yalnız değilsiniz - profesyonel destek almanız önemli.';
