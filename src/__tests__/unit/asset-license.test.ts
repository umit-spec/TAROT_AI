import { describe, it, expect } from 'vitest';
import {
  AssetLicenseManifestSchema,
  AssetLicenseEntrySchema,
  evaluateAssetGate,
  type AssetLicenseEntry,
} from '../../types/asset-license';
import { loadManifest } from '../../../scripts/assets/validate-assets';

const base: AssetLicenseEntry = {
  assetId: 'x-production',
  cardId: '00-fool',
  filePath: null,
  purpose: 'production',
  creator: 'unknown',
  license: 'tbd',
  commercialUse: 'unknown',
  modificationRights: 'unknown',
  attributionRequired: 'unknown',
  evidenceLocation: null,
  status: 'unverified',
  riskLevel: 'high',
};

describe('asset gate (D3)', () => {
  it('fails an unverified production asset with no rights', () => {
    const findings = evaluateAssetGate({ version: 't', entries: [base] });
    expect(findings.length).toBeGreaterThan(0);
    expect(findings.some((f) => f.reason.includes('unverified'))).toBe(true);
  });

  it('passes a fully-documented production asset', () => {
    const ok: AssetLicenseEntry = {
      ...base,
      creator: 'Commissioned Illustrator',
      commercialUse: 'yes',
      status: 'verified-licensed',
      evidenceLocation: 'validation/investor-readiness/licenses/00-fool-commission.pdf',
    };
    expect(evaluateAssetGate({ version: 't', entries: [ok] })).toHaveLength(0);
  });

  it('never gates a prototype-nonproduction (montage) asset', () => {
    const proto: AssetLicenseEntry = { ...base, assetId: 'm', purpose: 'prototype-nonproduction' };
    expect(evaluateAssetGate({ version: 't', entries: [proto] })).toHaveLength(0);
  });

  it('rejects an invalid cardId at the schema level', () => {
    expect(AssetLicenseEntrySchema.safeParse({ ...base, cardId: 'Fool' }).success).toBe(false);
  });
});

describe('shipped pilot manifest', () => {
  it('validates and keeps all three pilot production entries unverified (art pending)', () => {
    const manifest = loadManifest();
    expect(AssetLicenseManifestSchema.safeParse(manifest).success).toBe(true);
    const production = manifest.entries.filter((e) => e.purpose === 'production');
    expect(production).toHaveLength(3);
    for (const e of production) expect(e.status).toBe('unverified');
  });

  it('never marks a montage asset as production', () => {
    const manifest = loadManifest();
    const montage = manifest.entries.filter((e) => e.filePath?.includes('assets/tarot-cards/'));
    expect(montage.length).toBeGreaterThan(0);
    for (const e of montage) expect(e.purpose).toBe('prototype-nonproduction');
  });

  it('gate currently reports the pilot as not production-ready (expected)', () => {
    const findings = evaluateAssetGate(loadManifest());
    expect(findings.length).toBeGreaterThan(0); // correct until rights are documented
  });
});
