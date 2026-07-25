#!/usr/bin/env tsx
import { ALL_RECORD_TYPES } from './lib/paths';
import { loadRecords } from './lib/io';
import { detectConflicts } from './lib/conflicts';

function main() {
  let hasErrors = false;

  for (const recordType of ALL_RECORD_TYPES) {
    const records = loadRecords(recordType);
    const { warnings, errors, duplicates } = detectConflicts(records);

    for (const warning of warnings) {
      console.warn(`[${recordType}] warning: ${warning.message}`);
    }
    for (const duplicate of duplicates) {
      console.log(`[${recordType}] duplicate (harmless, collapses on build): ${duplicate.recordIds.join(', ')}`);
    }
    for (const error of errors) {
      console.error(`[${recordType}] BUILD-BLOCKING: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exitCode = 1;
    return;
  }
  console.log('No build-blocking conflicts among locked records.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (err) {
    console.error(`knowledge-authoring:check-conflicts failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
