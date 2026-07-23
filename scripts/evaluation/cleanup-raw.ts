#!/usr/bin/env tsx
import { cleanupRaw } from './lib/raw';

/**
 * Deletes raw/ artifact folders older than the retention window (default 7
 * days, Product Owner decision 3). Scrubbed manifest/results are left in place.
 * Run this after debugging a --retain-raw run, and safe to run any time.
 */
function main() {
  const arg = process.argv[2];
  const days = arg ? Number(arg) : 7;
  if (!Number.isFinite(days) || days < 0) throw new Error(`invalid retention days: ${arg}`);
  const { scanned, removed } = cleanupRaw(days);
  console.log(`Scanned ${scanned} run(s) with raw/ folders; retention ${days} day(s).`);
  if (removed.length > 0) {
    console.log(`Removed raw/ from: ${removed.join(', ')}`);
  } else {
    console.log('Nothing to remove.');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`evaluation:cleanup-raw failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
