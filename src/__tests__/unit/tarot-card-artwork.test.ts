// @vitest-environment node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { describe, expect, test } from 'vitest';
import { CARD_ARTWORK, CARD_BACK_ARTWORK, type CardId } from '../../lib/tarot-card-artwork';

const REPO_ROOT = path.resolve(__dirname, '../../..');

function sha256Of(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

describe('CARD_ARTWORK — exhaustive over the real 22-card Major Arcana catalog', () => {
  test('has exactly 22 face entries', () => {
    expect(Object.keys(CARD_ARTWORK)).toHaveLength(22);
  });

  test('every entry appears exactly once (no duplicate CardId keys)', () => {
    const keys = Object.keys(CARD_ARTWORK);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('has no unknown/extra entries beyond the real card catalog', () => {
    const cardsDir = path.join(REPO_ROOT, 'data', 'cards');
    const realIds = fs
      .readdirSync(cardsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => JSON.parse(fs.readFileSync(path.join(cardsDir, f), 'utf-8')).cardId as string);
    expect(realIds).toHaveLength(22);
    expect(Object.keys(CARD_ARTWORK).sort()).toEqual([...realIds].sort());
  });

  test('every src ends with .webp', () => {
    for (const entry of Object.values(CARD_ARTWORK)) {
      expect(entry.src.endsWith('.webp')).toBe(true);
    }
  });

  test('no src points at a canonical PNG path', () => {
    for (const entry of Object.values(CARD_ARTWORK)) {
      expect(entry.src).not.toMatch(/\.png$/);
      expect(entry.src).not.toMatch(/tarot-cards-v2\/images/);
    }
  });

  test('every entry is exactly 512x768', () => {
    for (const entry of Object.values(CARD_ARTWORK)) {
      expect(entry.width).toBe(512);
      expect(entry.height).toBe(768);
    }
  });

  test('every registered src resolves to a real file under public/', () => {
    for (const entry of Object.values(CARD_ARTWORK)) {
      const diskPath = path.join(REPO_ROOT, 'public', entry.src);
      expect(fs.existsSync(diskPath)).toBe(true);
    }
  });

  test('every public file byte-matches its recorded derivativeSha256', () => {
    for (const entry of Object.values(CARD_ARTWORK)) {
      const diskPath = path.join(REPO_ROOT, 'public', entry.src);
      expect(sha256Of(diskPath)).toBe(entry.derivativeSha256);
    }
  });

  test('every entry has a non-empty sourceSha256 matching the canonical provenance manifest', () => {
    const provenance = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'assets/tarot-cards-v2/provenance-manifest.json'), 'utf-8')
    );
    const bySourcePath: Record<string, string> = {};
    for (const a of provenance.assets as Array<{ source_archive_path: string; sha256: string }>) {
      bySourcePath[a.source_archive_path] = a.sha256;
    }
    const knownSha256 = new Set(Object.values(bySourcePath));
    for (const entry of Object.values(CARD_ARTWORK)) {
      expect(entry.sourceSha256).toBeTruthy();
      expect(knownSha256.has(entry.sourceSha256)).toBe(true);
    }
  });

  test('no two entries share the same derivative (face) file', () => {
    const hashes = Object.values(CARD_ARTWORK).map((e) => e.derivativeSha256);
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  test('no two entries share the same src path', () => {
    const srcs = Object.values(CARD_ARTWORK).map((e) => e.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });
});

describe('CARD_BACK_ARTWORK — a single constant, not tied to any CardId', () => {
  test('exists and is 512x768 WebP', () => {
    expect(CARD_BACK_ARTWORK.src.endsWith('.webp')).toBe(true);
    expect(CARD_BACK_ARTWORK.width).toBe(512);
    expect(CARD_BACK_ARTWORK.height).toBe(768);
  });

  test('resolves to a real file on disk and matches its recorded hash', () => {
    const diskPath = path.join(REPO_ROOT, 'public', CARD_BACK_ARTWORK.src);
    expect(fs.existsSync(diskPath)).toBe(true);
    expect(sha256Of(diskPath)).toBe(CARD_BACK_ARTWORK.derivativeSha256);
  });

  test('is not one of the 22 face entries', () => {
    const faceSrcs = new Set(Object.values(CARD_ARTWORK).map((e) => e.src));
    expect(faceSrcs.has(CARD_BACK_ARTWORK.src)).toBe(false);
  });
});

describe('Registry generator reproducibility', () => {
  test('the checked-in registry is not stale relative to its sources', () => {
    const result = require('child_process').spawnSync(
      'python3',
      ['tools/assets/generate_tarot_artwork_registry.py', '--check'],
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    );
    expect(result.status).toBe(0);
  });
});

describe('TypeScript exhaustiveness (compile-time, exercised here at runtime)', () => {
  test('a CardId can index CARD_ARTWORK directly with no cast needed', () => {
    const id: CardId = '00-fool';
    expect(CARD_ARTWORK[id]).toBeDefined();
  });
});
