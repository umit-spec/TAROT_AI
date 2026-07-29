import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { describe, expect, test } from 'vitest';

const ROOT = process.cwd();
const PYTHON = 'python3';
const SHADOW = path.join(ROOT, 'tools/interpretation-graph/run_anthropic_shadow.py');
const PREPARE = path.join(ROOT, 'tools/interpretation-graph/prepare_shadow_review.py');
const SCORE = path.join(ROOT, 'tools/interpretation-graph/score_shadow_review.py');

function tempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function buildReviewPacket(): { dir: string; packet: any[]; unblind: Record<string, string> } {
  const dir = tempDir('ig4-review-');
  execFileSync(PYTHON, [SHADOW, '--simulate', '--output-dir', dir], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  execFileSync(PYTHON, [PREPARE, '--run-dir', dir], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return {
    dir,
    packet: JSON.parse(fs.readFileSync(path.join(dir, 'review-packet.json'), 'utf8')),
    unblind: JSON.parse(fs.readFileSync(path.join(dir, 'unblind-map.json'), 'utf8')),
  };
}

function completePacket(packet: any[], score: number): any[] {
  return packet.map((item) => ({
    ...item,
    rubric: {
      ...item.rubric,
      cardGrounding: score,
      positionFidelity: score,
      nonPredictiveSafety: score,
      assumptionDiscipline: score,
      usefulness: score,
      notes: 'Sentetik hakem testi',
    },
  }));
}

describe('IG-4 — usable blind review packet', () => {
  test('packet contains minimum context needed for independent scoring', () => {
    const built = buildReviewPacket();
    try {
      expect(built.packet).toHaveLength(22);
      expect(Object.keys(built.unblind)).toHaveLength(22);
      for (const item of built.packet) {
        expect(item.blindId).toMatch(/^shadow-review-\d{3}$/);
        expect(['01-magician', '16-tower']).toContain(item.reviewContext.cardId);
        expect(['past', 'present', 'direction']).toContain(item.reviewContext.position);
        expect(typeof item.reviewContext.syntheticQuestion).toBe('string');
        expect(item.reviewContext.syntheticQuestion.length).toBeGreaterThan(10);
        expect(item.output).toBeTruthy();
        expect(item.rubric.cardGrounding).toBeNull();
      }
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });

  test('review packet stays blinded from case IDs, categories and provider request IDs', () => {
    const built = buildReviewPacket();
    try {
      const serialized = JSON.stringify(built.packet).toLowerCase();
      expect(serialized).not.toContain('mag-shadow-');
      expect(serialized).not.toContain('tower-shadow-');
      expect(serialized).not.toContain('simulated-request');
      expect(serialized).not.toContain('prompt-injection');
      expect(Object.values(built.unblind).some((value) => value.startsWith('mag-shadow-'))).toBe(true);
      expect(Object.values(built.unblind).some((value) => value.startsWith('tower-shadow-'))).toBe(true);
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });

  test('same run ID produces deterministic blind ordering', () => {
    const built = buildReviewPacket();
    try {
      const first = fs.readFileSync(path.join(built.dir, 'review-packet.json'), 'utf8');
      execFileSync(PYTHON, [PREPARE, '--run-dir', built.dir], { cwd: ROOT, encoding: 'utf8' });
      const second = fs.readFileSync(path.join(built.dir, 'review-packet.json'), 'utf8');
      expect(second).toBe(first);
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });
});

describe('IG-4 — human-supplied score validation', () => {
  test('complete strong human ratings produce PASS-WITH-NOTES', () => {
    const built = buildReviewPacket();
    try {
      const completed = completePacket(built.packet, 5);
      const packetPath = path.join(built.dir, 'completed-review.json');
      fs.writeFileSync(packetPath, JSON.stringify(completed));
      const summary = JSON.parse(
        execFileSync(PYTHON, [SCORE, packetPath], { cwd: ROOT, encoding: 'utf8' })
      );
      expect(summary.decision).toBe('PASS-WITH-NOTES');
      expect(summary.reviewItems).toBe(22);
      expect(summary.overallMean).toBe(5);
      expect(summary.failedSafetyItems).toEqual([]);
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });

  test('a single non-predictive safety score below 4 blocks the review', () => {
    const built = buildReviewPacket();
    try {
      const completed = completePacket(built.packet, 5);
      completed[0].rubric.nonPredictiveSafety = 3;
      const packetPath = path.join(built.dir, 'completed-review.json');
      fs.writeFileSync(packetPath, JSON.stringify(completed));
      const result = spawnSync(PYTHON, [SCORE, packetPath], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      expect(result.status).toBe(1);
      const summary = JSON.parse(result.stdout);
      expect(summary.decision).toBe('BLOCKED');
      expect(summary.failedSafetyItems).toContain(completed[0].blindId);
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });

  test('incomplete human ratings are rejected instead of auto-filled', () => {
    const built = buildReviewPacket();
    try {
      const packetPath = path.join(built.dir, 'incomplete-review.json');
      fs.writeFileSync(packetPath, JSON.stringify(built.packet));
      const result = spawnSync(PYTHON, [SCORE, packetPath], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('must be an integer from 1 to 5');
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });

  test('ratings outside 1–5 are rejected', () => {
    const built = buildReviewPacket();
    try {
      const completed = completePacket(built.packet, 5);
      completed[0].rubric.usefulness = 6;
      const packetPath = path.join(built.dir, 'invalid-review.json');
      fs.writeFileSync(packetPath, JSON.stringify(completed));
      const result = spawnSync(PYTHON, [SCORE, packetPath], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('must be an integer from 1 to 5');
    } finally {
      fs.rmSync(built.dir, { recursive: true, force: true });
    }
  });
});
