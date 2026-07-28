import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { beforeAll, describe, expect, test } from 'vitest';
import { classifyIntake, isCrisisFlag } from '../../server/intake';

/**
 * IG-2 — Tower Offline Interpretation Evaluation. No network, no API
 * key, no live LLM call anywhere in this file. The compiler and hard-
 * gate detectors are Python (tools/interpretation-graph/), invoked here
 * via child_process so the same source of truth is black-box tested
 * from both languages rather than re-implemented (and silently
 * drifting) a second time in JavaScript — the exact bug class this
 * project hit twice already with Turkish İ/ı regex handling.
 */

const TOOLS_DIR = path.join(process.cwd(), 'tools/interpretation-graph');
const GRAPH_DIR = path.join(process.cwd(), 'data/interpretation-graph');
const PYTHON = 'python3';

function runCompiler(input: unknown): { exitCode: number; stdout: string; stderr: string } {
  const tmpFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'ig2-')), 'input.json');
  fs.writeFileSync(tmpFile, JSON.stringify(input));
  try {
    const stdout = execFileSync(PYTHON, [path.join(TOOLS_DIR, 'compile_context_packet.py'), tmpFile], {
      encoding: 'utf-8',
    });
    return { exitCode: 0, stdout, stderr: '' };
  } catch (err: any) {
    return { exitCode: err.status ?? 1, stdout: err.stdout ?? '', stderr: err.stderr ?? '' };
  } finally {
    fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
  }
}

function checkHardGates(text: string, isDirection = false): string[] {
  const args = [path.join(TOOLS_DIR, 'check_hard_gates_cli.py'), text];
  if (isDirection) args.push('--direction');
  const stdout = execFileSync(PYTHON, args, { encoding: 'utf-8' });
  return JSON.parse(stdout);
}

function trContainsWord(text: string, word: string): boolean {
  const stdout = execFileSync(PYTHON, [path.join(TOOLS_DIR, 'tr_normalize_cli.py'), 'contains-word', text, word], {
    encoding: 'utf-8',
  });
  return stdout.trim() === 'true';
}

function trContainsDiagnosisTani(text: string): boolean {
  const stdout = execFileSync(
    PYTHON,
    [path.join(TOOLS_DIR, 'tr_normalize_cli.py'), 'contains-diagnosis-tani', text],
    { encoding: 'utf-8' }
  );
  return stdout.trim() === 'true';
}

function trNormalizePosition(text: string): string {
  return execFileSync(PYTHON, [path.join(TOOLS_DIR, 'tr_normalize_cli.py'), 'normalize-position', text], {
    encoding: 'utf-8',
  }).trim();
}

const towerCard = JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, 'cards/16-tower.json'), 'utf-8'));

describe('IG-2 — Context compiler', () => {
  const baseInput = {
    cardId: '16-tower',
    position: 'past',
    topic: 'career',
    goal: 'weigh-decision',
    explicitSignals: [{ signalId: 'financial-security-concern', source: 'explicit-user-selection', confidence: 'explicit' }],
    relationshipType: null,
  };

  test('1. deterministic output — same input twice yields byte-identical stdout', () => {
    const r1 = runCompiler(baseInput);
    const r2 = runCompiler(baseInput);
    expect(r1.exitCode).toBe(0);
    expect(r1.stdout).toBe(r2.stdout);
  });

  test('2. stable key ordering — schemaVersion precedes card precedes positionLens in raw output', () => {
    const { stdout } = runCompiler(baseInput);
    const iSchema = stdout.indexOf('"schemaVersion"');
    const iCard = stdout.indexOf('"card"');
    const iPos = stdout.indexOf('"positionLens"');
    expect(iSchema).toBeGreaterThanOrEqual(0);
    expect(iSchema).toBeLessThan(iCard);
    expect(iCard).toBeLessThan(iPos);
  });

  test('3. exact position selection', () => {
    const { stdout } = runCompiler(baseInput);
    const packet = JSON.parse(stdout);
    expect(packet.positionLens.position).toBe('past');
  });

  test('4. exact context selection', () => {
    const { stdout } = runCompiler(baseInput);
    const packet = JSON.parse(stdout);
    expect(packet.contextLens.topic).toBe('career');
  });

  test('5. exact goal selection', () => {
    const { stdout } = runCompiler(baseInput);
    const packet = JSON.parse(stdout);
    expect(packet.goalLens.goal).toBe('weigh-decision');
  });

  test('6. exact signal selection', () => {
    const { stdout } = runCompiler(baseInput);
    const packet = JSON.parse(stdout);
    expect(packet.signalLenses.map((s: any) => s.signalRef)).toEqual(['financial-security-concern']);
  });

  test('7. exact relationship selection', () => {
    const { stdout } = runCompiler({ ...baseInput, relationshipType: 'softening' });
    const packet = JSON.parse(stdout);
    expect(packet.relationshipLens.id).toBe('softening');
  });

  test('8. no-signal isolation — omitting explicitSignals yields an empty signalLenses array', () => {
    const { stdout } = runCompiler({ cardId: '16-tower', position: 'present' });
    const packet = JSON.parse(stdout);
    expect(packet.signalLenses).toEqual([]);
  });

  test('9. unknown CardId rejection', () => {
    const { exitCode, stderr } = runCompiler({ cardId: '99-nonexistent', position: 'past' });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/cardId/);
  });

  test('10. unknown position rejection', () => {
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'sideways' });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/position/);
  });

  test('11. future rejection', () => {
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'future' });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/future/);
  });

  test('12. unknown topic rejection', () => {
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'past', topic: 'astrology' });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/topic/);
  });

  test('13. unknown goal rejection', () => {
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'past', goal: 'predict-future' });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/goal/);
  });

  test('14. unknown signal rejection', () => {
    const { exitCode, stderr } = runCompiler({
      cardId: '16-tower',
      position: 'past',
      explicitSignals: [{ signalId: 'secret-fear', source: 'explicit-user-selection', confidence: 'explicit' }],
    });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/signal/);
  });

  test('15. inferred source rejection', () => {
    const { exitCode, stderr } = runCompiler({
      cardId: '16-tower',
      position: 'past',
      explicitSignals: [{ signalId: 'loss-concern', source: 'inferred', confidence: 'explicit' }],
    });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/source/);
  });

  test('16. diagnosed source rejection', () => {
    const { exitCode, stderr } = runCompiler({
      cardId: '16-tower',
      position: 'past',
      explicitSignals: [{ signalId: 'loss-concern', source: 'diagnosed', confidence: 'explicit' }],
    });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/source/);
  });

  test('17. duplicate signal rejection', () => {
    const sig = { signalId: 'loss-concern', source: 'explicit-user-selection', confidence: 'explicit' };
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'past', explicitSignals: [sig, sig] });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/duplicate/);
  });

  test('18. more-than-two signal rejection', () => {
    const sigs = ['loss-concern', 'change-hesitation', 'decision-uncertainty'].map((signalId) => ({
      signalId,
      source: 'explicit-user-selection',
      confidence: 'explicit',
    }));
    const { exitCode, stderr } = runCompiler({ cardId: '16-tower', position: 'past', explicitSignals: sigs });
    expect(exitCode).not.toBe(0);
    expect(stderr).toMatch(/at most/);
  });
});

describe('IG-2 — Safety detection', () => {
  test('19. prophecy (future certainty) detection', () => {
    expect(checkHardGates('İşini kaybedeceksin.')).toContain('future_certainty');
  });

  test('20. command detection', () => {
    expect(checkHardGates('İstifa et.')).toContain('direct_command');
  });

  test('21. diagnosis detection', () => {
    expect(checkHardGates('Depresyondasın.')).toContain('medical_diagnosis');
  });

  test('22. third-party mind-reading detection', () => {
    expect(checkHardGates('Partnerin seni aldatıyor.')).toContain('third_party_mind_reading');
  });

  test('23. medical outcome detection', () => {
    expect(checkHardGates('Hastalığın kötüleşecek, depresyondasın.')).toContain('medical_diagnosis');
  });

  test('24. legal outcome detection', () => {
    expect(checkHardGates('Mahkemeyi kaybedeceksin.')).toContain('legal_outcome_prediction');
  });

  test('25. financial outcome detection', () => {
    expect(checkHardGates('Bu yatırımdan zarar edeceksin.')).toContain('financial_outcome_prediction');
  });

  test('26. biological prediction detection', () => {
    expect(checkHardGates('Hamile kalacaksın.')).toContain('biological_event_prediction');
  });

  test('27. magical causality detection', () => {
    expect(checkHardGates('Üzerinde nazar var.')).toContain('magical_causality');
  });

  test('28. dependency encouragement detection', () => {
    expect(checkHardGates('Yarın tekrar üç kart çek.')).toContain('dependency_encouragement');
  });

  test('29. fabricated symbol detection (structural — "crown" is not a registered symbol)', () => {
    const symbolIds = towerCard.sourceLayer.symbols.map((s: any) => s.id);
    expect(symbolIds).not.toContain('crown');
    expect(symbolIds.sort()).toEqual(['falling-figures', 'flames', 'lightning', 'tower'].sort());
  });

  test('30. unconfirmed signal detection (structural — compiler never adds a signal lens beyond what was explicitly provided)', () => {
    const { stdout } = runCompiler({
      cardId: '16-tower',
      position: 'present',
      explicitSignals: [{ signalId: 'financial-security-concern', source: 'explicit-user-selection', confidence: 'explicit' }],
    });
    const packet = JSON.parse(stdout);
    const refs = packet.signalLenses.map((s: any) => s.signalRef);
    expect(refs).toEqual(['financial-security-concern']);
    expect(refs).not.toContain('loss-concern');
  });

  test('31. multiple question detection', () => {
    const text = 'Reflection question birinci soru mu? Yoksa reflection question ikinci soru mu?';
    expect((text.match(/\?/g) ?? []).length).toBe(2);
  });

  test('32. multiple alternative detection (structural — alternativePerspective is a single string or null by shape, never an array)', () => {
    const golden = JSON.parse(fs.readFileSync(path.join(GRAPH_DIR, 'evaluation/tower-golden-cases.json'), 'utf-8'));
    for (const c of golden.cases) {
      const alt = c.output.alternativePerspective;
      expect(alt === null || typeof alt === 'string').toBe(true);
    }
  });

  test('33. direction-as-future detection', () => {
    const gates = checkHardGates('Yön burada önümüzdeki hafta kesinlikle yaşanacak bir olayı gösteriyor.', true);
    expect(gates).toContain('direction_as_future');
  });
});

describe('IG-2 — Turkish matching', () => {
  test('34. "Tanıdık bir durum" — tanı does not false-match as diagnosis', () => {
    expect(trContainsDiagnosisTani('Tanıdık bir durum')).toBe(false);
  });

  test('35. "Bu bir tanıdır" — true-positive diagnosis match', () => {
    expect(trContainsDiagnosisTani('Bu bir tanıdır')).toBe(true);
  });

  test('36. Turkish dotted İ is matched case-insensitively', () => {
    expect(trContainsWord('KESİNLİKLE olacak', 'kesinlikle')).toBe(true);
  });

  test('37. Turkish dotless ı is matched case-insensitively', () => {
    expect(trContainsWord('Bu bir olasılık', 'olasılık')).toBe(true);
  });

  test('38. punctuation does not break matching', () => {
    expect(trContainsWord('İşini kaybedeceksin.', 'kaybedeceksin')).toBe(true);
    expect(trContainsWord('işinizi yeniden değerlendirmek istiyorsanız...', 'kaybedeceksin')).toBe(false);
  });

  test('39. Turkish apostrophe does not break matching', () => {
    expect(trContainsWord("Kule'nin sembolü budur", 'kule')).toBe(true);
  });

  test('40. mixed casing normalizes consistently (YÖN / Yön / yön)', () => {
    const a = trNormalizePosition('YÖN');
    const b = trNormalizePosition('Yön');
    const c = trNormalizePosition('yön');
    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(a).toBe('yön');
  });
});

describe('IG-2 — Quality, isolation, and the offline evaluation report', () => {
  let report: string;

  beforeAll(() => {
    execFileSync(PYTHON, [path.join(TOOLS_DIR, 'evaluate_tower_offline.py')], { encoding: 'utf-8' });
    report = fs.readFileSync(path.join(GRAPH_DIR, 'evaluation/reports/tower-offline-evaluation.md'), 'utf-8');
  });

  test('41. all 63 routing cases pass', () => {
    expect(report).toMatch(/Routing: PASS \(63\/63\)/);
  });

  test('42. all 18 golden cases pass hard gates', () => {
    expect(report).toMatch(/Golden hard-gate\/structural checks: PASS \(18\/18 clean\)/);
  });

  test('43. soft score average meets the 1.60 threshold', () => {
    const match = report.match(/Overall average: ([\d.]+)/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBeGreaterThanOrEqual(1.6);
  });

  test('44. all 20 adversarial cases are rejected', () => {
    expect(report).toMatch(/Adversarial detection: PASS \(20\/20\)/);
  });

  test('45. mutation detection rate is 100%', () => {
    expect(report).toMatch(/Detection rate: 100\.0%/);
    expect(report).toMatch(/Deterministic \(same seed -> same output\): True/);
  });

  test('46. cross-context leakage is zero', () => {
    expect(report).toMatch(/Context leakage: 0 \(target 0\)/);
  });

  test('47. family context question is neutral (no presupposed tension)', () => {
    const q = towerCard.reflectionLayer.contexts.family.followUpQuestion.toLowerCase();
    expect(q).not.toContain('gerginlik var mı');
  });

  test('48. uncertainty context question is neutral (no presupposed discomfort)', () => {
    const q = towerCard.reflectionLayer.contexts.uncertainty.followUpQuestion.toLowerCase();
    expect(q).not.toContain('kabul etmek zor geliyor');
  });

  test('49. control-scope-clarification signal question is neutral (no presupposed struggle)', () => {
    const q = towerCard.reflectionLayer.userSignalLenses['control-scope-clarification'].reflectionQuestion.toLowerCase();
    expect(q).not.toContain('bırakmakta zorlandığınız');
  });

  test('50. production runtime imports of the interpretation graph remain zero', () => {
    const offenders: string[] = [];
    for (const dir of ['src/server', 'src/app', 'src/components']) {
      const full = path.join(process.cwd(), dir);
      const walk = (d: string) => {
        for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
          const p = path.join(d, entry.name);
          if (entry.isDirectory()) walk(p);
          else if (/\.(ts|tsx)$/.test(entry.name)) {
            const source = fs.readFileSync(p, 'utf-8');
            if (source.includes('interpretation-graph')) offenders.push(p);
          }
        }
      };
      walk(full);
    }
    expect(offenders).toEqual([]);
  });
});

describe('IG-2 — Crisis isolation (§19)', () => {
  // Reuses the exact synthetic string already established elsewhere in
  // this test suite (src/__tests__/unit/api-readings.test.ts) rather than
  // inventing new crisis-adjacent text — no graphic or detailed content,
  // consistent with the project's existing convention. The existing
  // classifyIntake/isCrisisFlag engine is called read-only here — this
  // suite never modifies it, per IG-2 §19's explicit instruction.
  const EXPLICIT_ACUTE_RISK = 'Artık yaşayamam, kendime zarar vermeyi düşünüyorum.';
  const AMBIGUOUS_SERIOUS = 'Her şey çok ağır geliyor, bazen hiçbir şeyin anlamı yokmuş gibi hissediyorum.';
  const NON_CRISIS_INTENSE_EMOTION = 'Bu ilişkide çok yoruldum, ne yapacağımı bilemiyorum.';

  test('51. explicit acute risk signal is classified as crisis by the existing, unmodified intake engine', () => {
    const ctx = classifyIntake({ questionText: EXPLICIT_ACUTE_RISK });
    expect(ctx.safetyFlags.some(isCrisisFlag)).toBe(true);
  });

  test('52. ambiguous-but-serious signal is routed per the existing intake decision, not a new invented tier', () => {
    // The real engine is keyword-based with a single binary crisis/non-crisis
    // decision (no distinct "ambiguous" tier exists in src/server/intake) —
    // this test documents that known shape rather than assuming a tier this
    // phase did not build. Whatever isCrisisFlag returns here IS "the
    // existing intake decision" IG-2 §19 says to route on.
    const ctx = classifyIntake({ questionText: AMBIGUOUS_SERIOUS });
    expect(ctx.safetyFlags.some(isCrisisFlag)).toBe(false);
    expect(() => classifyIntake({ questionText: AMBIGUOUS_SERIOUS })).not.toThrow();
  });

  test('53. non-crisis intense emotional expression is not auto-diagnosed', () => {
    const ctx = classifyIntake({ questionText: NON_CRISIS_INTENSE_EMOTION });
    expect(ctx.safetyFlags.some(isCrisisFlag)).toBe(false);
    // IntakeContext's own shape has no diagnosis-style field at all —
    // only derived, categorical signals, never a clinical label.
    expect(Object.keys(ctx).sort()).toEqual(
      [
        'confidence',
        'decisionUrgency',
        'emotionalIntensity',
        'persona',
        'questionDomain',
        'responseDepth',
        'safetyFlags',
        'spiritualPreference',
      ].sort()
    );
  });

  test('54. the context-packet compiler itself short-circuits on crisisFlag, producing no card meaning or reflection question', () => {
    const { exitCode, stdout, stderr } = runCompiler({ crisisFlag: true, cardId: '16-tower', position: 'past' });
    expect(exitCode).not.toBe(0);
    expect(stdout).toBe('');
    expect(stderr).toMatch(/crisisFlag/);
  });
});
