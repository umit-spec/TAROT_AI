#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { KnowledgeBundleSchema } from '../../src/types/knowledge';
import { BuildManifestSchema } from '../../src/types/knowledge-authoring';
import { liveKnowledgeDir } from './lib/paths';
import { build } from './build';

/**
 * The ONLY file in this repo permitted to write under data/knowledge/.
 * build.ts writes only under data/knowledge-builds/ - see Sprint 5 plan
 * §2 rule 5. Not invoked this sprint against the real bundle (decision
 * 1/2): the pilot proves this command works via a scratch --targetDir,
 * never the real one.
 */

export interface PromoteResult {
  bundlePath: string;
  manifestPath: string;
  backupPath: string | null;
}

export class PromotionFailedError extends Error {}

async function runtimeCompatibilityCheck(bundlePath: string, targetDir: string): Promise<void> {
  const raw = JSON.parse(fs.readFileSync(bundlePath, 'utf-8'));
  const result = KnowledgeBundleSchema.safeParse(raw);
  if (!result.success) {
    throw new PromotionFailedError(`Promoted bundle failed schema validation: ${result.error.message}`);
  }
  if (result.data.cards.length !== 22) {
    throw new PromotionFailedError(`Promoted bundle has ${result.data.cards.length} cards, expected 22`);
  }

  // Against the real live directory, go further: invoke the actual
  // production loader (a fresh process each CLI run means its module
  // cache starts empty, so this genuinely reads the file we just wrote,
  // not a stale in-memory copy).
  if (path.resolve(targetDir) === path.resolve(liveKnowledgeDir())) {
    const { loadKnowledgeBundle } = await import('../../src/server/knowledge/bundle');
    loadKnowledgeBundle();
  }
}

export async function promote(version: string, targetDir?: string): Promise<PromoteResult> {
  const resolvedTargetDir = targetDir ?? liveKnowledgeDir();
  // 1. Regenerate fresh from the current locked records - never reuse a
  //    stale pilot artifact file, so promotion always reflects the
  //    actual current authoring store, not whatever build.ts last wrote.
  const { bundle, manifest } = build(version);

  const bundleFileName = `bundle-v${version}.json`;
  const bundlePath = path.join(resolvedTargetDir, bundleFileName);
  const manifestPath = path.join(resolvedTargetDir, `manifest-v${version}.json`);
  const tmpBundlePath = `${bundlePath}.tmp`;

  fs.mkdirSync(resolvedTargetDir, { recursive: true });

  // 2. Back up whatever currently occupies the target filename.
  let backupPath: string | null = null;
  if (fs.existsSync(bundlePath)) {
    const backupDir = path.join(resolvedTargetDir, '.backups');
    fs.mkdirSync(backupDir, { recursive: true });
    backupPath = path.join(backupDir, `${bundleFileName}.${Date.now()}.bak`);
    fs.copyFileSync(bundlePath, backupPath);
  }

  try {
    // 3. Write to a temp file, then atomically rename into place.
    fs.writeFileSync(tmpBundlePath, `${JSON.stringify(bundle, null, 2)}\n`, 'utf-8');
    fs.renameSync(tmpBundlePath, bundlePath);

    // 4. Runtime compatibility test against the file now actually in place.
    await runtimeCompatibilityCheck(bundlePath, resolvedTargetDir);

    // 5. Only after the runtime check passes, write the manifest.
    const manifestResult = BuildManifestSchema.safeParse(manifest);
    if (!manifestResult.success) {
      throw new PromotionFailedError(`Manifest failed schema validation: ${manifestResult.error.message}`);
    }
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifestResult.data, null, 2)}\n`, 'utf-8');

    return { bundlePath, manifestPath, backupPath };
  } catch (err) {
    // 6. On ANY failure: restore the previous file (or remove the file we
    //    wrote, if there was nothing before) - zero net change.
    if (fs.existsSync(tmpBundlePath)) fs.rmSync(tmpBundlePath);
    if (backupPath) {
      fs.copyFileSync(backupPath, bundlePath);
    } else if (fs.existsSync(bundlePath)) {
      fs.rmSync(bundlePath);
    }
    throw err instanceof PromotionFailedError ? err : new PromotionFailedError((err as Error).message);
  }
}

function main() {
  const versionArgIdx = process.argv.indexOf('--version');
  const version = versionArgIdx >= 0 ? process.argv[versionArgIdx + 1] : undefined;
  if (!version) {
    throw new Error('Usage: promote.ts --version <X> [--targetDir <path>]');
  }
  const targetDirArgIdx = process.argv.indexOf('--targetDir');
  const targetDir = targetDirArgIdx >= 0 ? process.argv[targetDirArgIdx + 1] : undefined;

  promote(version, targetDir)
    .then((result) => {
      console.log(`Promoted knowledge bundle v${version} to ${result.bundlePath}`);
      if (result.backupPath) console.log(`Previous version backed up to ${result.backupPath}`);
    })
    .catch((err) => {
      console.error(`knowledge-authoring:promote failed - zero files changed: ${(err as Error).message}`);
      process.exit(1);
    });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
