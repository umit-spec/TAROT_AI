/**
 * Single source of the crisis response's user-facing text (message +
 * resource list), extracted verbatim from src/app/api/readings/route.ts so
 * that /api/readings and the future /api/readings/preview endpoint
 * (docs/ADR-UX-FRAMING-PREVIEW.md R7/G-6) reference ONE copy instead of
 * diverging duplicates.
 *
 * IMPORTANT — this module is a *mechanical* extraction only. The numbers,
 * labels, and message are byte-identical to their previous inline values;
 * moving them here does NOT mean they have been verified. The known
 * crisis-resource safety debt (unverified private line; emergency vs.
 * social-support lines presented in the same list; see
 * docs/02-ETHICAL_CONSTITUTION.md, docs/UX_FLOW_V2.md §8) is still open and
 * must be closed by a SEPARATE, reviewed safety-remediation change against
 * current official Turkish sources (https://www.112.gov.tr/, ALO 183)
 * before the preview endpoint exposes these to users over the new route.
 */

export interface CrisisResource {
  label: string;
  contact: string;
}

// docs/02-ETHICAL_CONSTITUTION.md Crisis Resources (Türkiye).
export const CRISIS_RESOURCES: readonly CrisisResource[] = [
  { label: 'İntihar Önleme Derneği Çağrı Hattı', contact: '0312 380 9098' },
  { label: 'ALO 183 - Çocuk İhbar Hattı', contact: '183' },
  { label: 'Polis İmdat', contact: '155' },
  { label: 'Acil Tıp', contact: '112' },
];

export const CRISIS_MESSAGE =
  'Bu zor bir durum olabilir. Yalnız değilsiniz - profesyonel destek almanız önemli.';
