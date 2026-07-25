#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import {
  AssetLicenseManifestSchema,
  evaluateAssetGate,
  type AssetLicenseManifest,
} from '../../src/types/asset-license';

/**
 * Production asset gate (Sprint S1, D3). Loads the license manifest, validates
 * its schema, and reports whether any production-purpose asset lacks documented
 * commercial permission. Exit 1 when a production asset is not eligible - so a
 * future CI wiring blocks a build that would ship an unlicensed asset. Today,
 * the three pilot production entries are intentionally unverified: the gate is
 * SUPPOSED to fail them until the Product Owner records real rights documents.
 */
export function manifestPath(): string {
  return path.join(process.cwd(), 'data', 'assets', 'pilot-license-manifest.json');
}

export function loadManifest(): AssetLicenseManifest {
  const p = manifestPath();
  if (!fs.existsSync(p)) throw new Error(`asset license manifest not found: ${p}`);
  const raw = JSON.parse(fs.readFileSync(p, 'utf-8'));
  const parsed = AssetLicenseManifestSchema.safeParse(raw);
  if (!parsed.success) throw new Error(`manifest failed schema validation: ${parsed.error.message}`);
  return parsed.data;
}

function main() {
  const enforce = process.argv.includes('--enforce');
  const manifest = loadManifest();
  const findings = evaluateAssetGate(manifest);

  const production = manifest.entries.filter((e) => e.purpose === 'production');
  const eligible = production.length - new Set(findings.map((f) => f.assetId)).size;
  console.log(`Asset gate: ${manifest.entries.length} entries, ${production.length} production, ${eligible} production eligible.`);

  if (findings.length > 0) {
    console.log('Production assets NOT eligible to ship (documented, expected while art is pending):');
    for (const f of findings) console.log(`  ${f.assetId}: ${f.reason}`);
    if (enforce) {
      console.error('\nAsset gate ENFORCED and FAILED - no production build may ship these assets.');
      process.exit(1);
    }
    console.log('\n(run with --enforce to make this a hard failure - intended for the pre-ship CI gate)');
    return;
  }
  console.log('OK: every production asset has documented commercial permission.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`assets:validate failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
