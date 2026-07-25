import { z } from 'zod';
import { CardIdSchema } from './card';

/**
 * Production asset gate (Sprint S1, Product Owner decision D3).
 *
 * Every shipped visual asset must carry documented commercial permission
 * before it can be marked production-eligible. This schema + the validator in
 * scripts/assets/validate-assets.ts make that a build-checkable rule rather
 * than a note in a README. Montage-derived assets are structurally barred from
 * `purpose: 'production'` - the enum below has no path that lets them through.
 */

export const AssetPurposeSchema = z.enum([
  'production', // shippable in a paid/public product - requires documented rights
  'staging-fallback', // documented public-domain, staging/internal/free-beta only (D3)
  'prototype-nonproduction', // montage-derived / placeholder - never shippable
]);
export type AssetPurpose = z.infer<typeof AssetPurposeSchema>;

export const AssetLicenseStatusSchema = z.enum([
  'unverified',
  'verified-licensed',
  'verified-public-domain',
  'replacement-completed',
]);
export type AssetLicenseStatus = z.infer<typeof AssetLicenseStatusSchema>;

export const TriStateSchema = z.enum(['yes', 'no', 'unknown']);

export const AssetLicenseEntrySchema = z.object({
  assetId: z.string().min(1),
  cardId: CardIdSchema,
  filePath: z.string().nullable(), // null while the production art doesn't exist yet
  purpose: AssetPurposeSchema,
  creator: z.string().min(1), // 'unknown' is allowed as a literal string, but never for production
  license: z.string().min(1),
  commercialUse: TriStateSchema,
  modificationRights: TriStateSchema,
  attributionRequired: TriStateSchema,
  evidenceLocation: z.string().nullable(), // path to a real license/permission document
  status: AssetLicenseStatusSchema,
  riskLevel: z.enum(['high', 'medium', 'low']),
  notes: z.string().optional(),
});
export type AssetLicenseEntry = z.infer<typeof AssetLicenseEntrySchema>;

export const AssetLicenseManifestSchema = z.object({
  version: z.string().min(1),
  entries: z.array(AssetLicenseEntrySchema),
});
export type AssetLicenseManifest = z.infer<typeof AssetLicenseManifestSchema>;

export interface AssetGateFinding {
  assetId: string;
  reason: string;
}

/**
 * The gate. Returns the reasons any production-purpose asset is NOT eligible to
 * ship. A `production` asset must be verified-licensed / verified-public-domain
 * / replacement-completed, must have documented `commercialUse: 'yes'`, and
 * must point at a real evidence document. Anything else is a finding. Empty
 * result = every production asset has documented commercial permission.
 */
export function evaluateAssetGate(manifest: AssetLicenseManifest): AssetGateFinding[] {
  const findings: AssetGateFinding[] = [];
  for (const e of manifest.entries) {
    if (e.purpose !== 'production') continue; // only production assets gate a ship
    if (e.status === 'unverified') {
      findings.push({ assetId: e.assetId, reason: 'production asset is unverified' });
    }
    if (e.commercialUse !== 'yes') {
      findings.push({ assetId: e.assetId, reason: `commercialUse is '${e.commercialUse}', must be 'yes'` });
    }
    if (!e.evidenceLocation) {
      findings.push({ assetId: e.assetId, reason: 'no evidenceLocation for a production asset' });
    }
    if (e.creator.trim().toLowerCase() === 'unknown') {
      findings.push({ assetId: e.assetId, reason: 'creator is unknown for a production asset' });
    }
  }
  return findings;
}
