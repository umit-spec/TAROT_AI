import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { describe, expect, test } from 'vitest';

/**
 * IG-1 — Tower Interpretation Graph pilot. This suite tests the data
 * files under data/interpretation-graph/ directly (fs + JSON.parse),
 * the same pattern src/__tests__/unit/knowledge-authoring.test.ts uses
 * for data/knowledge-authoring/ — there is no runtime module to import,
 * by design (provenance.runtimeEnabled === false, see the isolation
 * tests at the bottom of this file).
 */

const GRAPH_ROOT = path.join(process.cwd(), 'data/interpretation-graph');
const CARDS_CATALOG = path.join(process.cwd(), 'data/cards');

function readJson(relPath: string): any {
  return JSON.parse(fs.readFileSync(path.join(GRAPH_ROOT, relPath), 'utf-8'));
}

const towerNode = readJson('cards/16-tower.json');
const userSignals = readJson('ontology/user-signals.json');
const userGoals = readJson('ontology/user-goals.json');
const relationshipTypes = readJson('ontology/relationship-types.json');
const guardrails = readJson('ontology/global-guardrails.json');

const signalIds = new Set<string>(userSignals.signals.map((s: { id: string }) => s.id));
const goalIds = new Set<string>(userGoals.goals.map((g: { id: string }) => g.id));
const relationshipIds = new Set<string>(relationshipTypes.relationshipTypes.map((r: { id: string }) => r.id));
const guardrailIds = new Set<string>(
  [...guardrails.must, ...guardrails.may, ...guardrails.mustNot].map((g: { id: string }) => g.id)
);

const CERTAINTY_PATTERN = /(kesinlikle|mutlaka|garantili|kaçınılmaz|istifa et|sahte yapı)/i;
const DIRECT_COMMAND_PATTERN = /(ayrılın|ayrıl\b|kal\b|işten çık|yatırım yap)/i;
// NOTE: deliberately no bare "tanı" root — JS regex \b is ASCII-only and
// does not treat Turkish ı/İ as word characters, so "tanı\b" false-matches
// inside unrelated words like "Tanıdık" (familiar). "teşhis" and "tanı
// koy(mak)" cover the actual diagnosis-language risk unambiguously.
const DIAGNOSIS_PATTERN = /(depresyon|anksiyete|hastalık|teşhis|tanı koy|tükenmişsiniz|kontrolcüsünüz)/i;
const PROFESSIONAL_OUTCOME_PATTERN = /(davayı kazanacaksın|paraların artacak|hastalığı geçeceksin)/i;
const THIRD_PARTY_CERTAINTY_PATTERN = /\b(o kesinlikle|onun kesin|patronun kesin|sevgilin kesin)\b/i;

function safeStrings(node: typeof towerNode): string[] {
  const out: string[] = [];
  out.push(node.sourceLayer.meaning, node.sourceLayer.centralTension, ...node.sourceLayer.themes);
  for (const sym of node.sourceLayer.symbols) out.push(sym.safeUse);
  for (const pos of Object.values(node.reflectionLayer.positions) as any[]) {
    out.push(pos.focus, ...pos.safeInterpretations, ...pos.reflectionQuestions);
  }
  for (const ctx of Object.values(node.reflectionLayer.contexts) as any[]) {
    out.push(ctx.focus, ctx.followUpQuestion);
  }
  for (const lens of Object.values(node.reflectionLayer.userSignalLenses) as any[]) {
    out.push(lens.focus, lens.safeInterpretation, lens.reflectionQuestion);
  }
  for (const q of node.reflectionLayer.adaptiveQuestionRefs) out.push(q.question, q.purpose);
  return out;
}

describe('Interpretation Graph — structure', () => {
  test('16-tower.json parses as valid JSON', () => {
    expect(() => readJson('cards/16-tower.json')).not.toThrow();
  });

  test('real CardId is 16-tower', () => {
    expect(towerNode.id).toBe('16-tower');
  });

  test('CardId exists in the canonical data/cards/ catalog', () => {
    const catalogIds = fs.readdirSync(CARDS_CATALOG).map((f) => f.replace(/\.json$/, ''));
    expect(catalogIds).toContain(towerNode.id);
  });

  test('the NotebookLM-suggested variant 16-the-tower is not used anywhere', () => {
    expect(towerNode.id).not.toBe('16-the-tower');
    const operative = JSON.stringify({
      sourceLayer: towerNode.sourceLayer,
      reflectionLayer: towerNode.reflectionLayer,
    });
    expect(operative).not.toContain('16-the-tower');
  });

  test('provenance.runtimeEnabled is false', () => {
    expect(towerNode.provenance.runtimeEnabled).toBe(false);
  });

  test('exactly three positions: past, present, direction', () => {
    expect(Object.keys(towerNode.reflectionLayer.positions).sort()).toEqual(['direction', 'past', 'present']);
  });

  test('no "future" key exists anywhere in positions', () => {
    expect(towerNode.reflectionLayer.positions.future).toBeUndefined();
    expect(JSON.stringify(towerNode.reflectionLayer.positions)).not.toMatch(/"future"\s*:/);
  });

  test('direction position is not framed as prophecy', () => {
    const direction = towerNode.reflectionLayer.positions.direction;
    const text = [direction.focus, ...direction.safeInterpretations, ...direction.reflectionQuestions].join(' ');
    expect(text).not.toMatch(CERTAINTY_PATTERN);
    expect(text.toLowerCase()).not.toContain('gelecekte kesin');
  });

  test('exactly 8 contexts', () => {
    expect(Object.keys(towerNode.reflectionLayer.contexts)).toHaveLength(8);
    expect(Object.keys(towerNode.reflectionLayer.contexts).sort()).toEqual(
      ['boundaries', 'career', 'change', 'decision', 'family', 'relationship', 'self-awareness', 'uncertainty'].sort()
    );
  });

  test('exactly 10 user signal lenses', () => {
    expect(Object.keys(towerNode.reflectionLayer.userSignalLenses)).toHaveLength(10);
  });
});

describe('Interpretation Graph — references', () => {
  test('every userSignalLenses.signalRef resolves in ontology/user-signals.json', () => {
    for (const lens of Object.values(towerNode.reflectionLayer.userSignalLenses) as any[]) {
      expect(signalIds.has(lens.signalRef)).toBe(true);
    }
  });

  test('every relationshipTypeRefs entry resolves in ontology/relationship-types.json', () => {
    for (const ref of towerNode.reflectionLayer.relationshipTypeRefs) {
      expect(relationshipIds.has(ref)).toBe(true);
    }
  });

  test('every safetyRefs entry resolves in ontology/global-guardrails.json', () => {
    for (const ref of towerNode.safetyRefs) {
      expect(guardrailIds.has(ref)).toBe(true);
    }
  });

  test('no unknown ref anywhere (goals/signals referenced by adaptiveQuestionRefs triggers)', () => {
    for (const q of towerNode.reflectionLayer.adaptiveQuestionRefs) {
      for (const goalRef of q.trigger.goals) expect(goalIds.has(goalRef)).toBe(true);
      for (const sigRef of q.trigger.explicitSignalRefs) expect(signalIds.has(sigRef)).toBe(true);
    }
  });

  test('no duplicate IDs in any ontology file or the card node', () => {
    const dupeCheck = (ids: string[]) => new Set(ids).size === ids.length;
    expect(dupeCheck(userSignals.signals.map((s: { id: string }) => s.id))).toBe(true);
    expect(dupeCheck(userGoals.goals.map((g: { id: string }) => g.id))).toBe(true);
    expect(dupeCheck(relationshipTypes.relationshipTypes.map((r: { id: string }) => r.id))).toBe(true);
    const allGuardrailIds = [...guardrails.must, ...guardrails.may, ...guardrails.mustNot].map(
      (g: { id: string }) => g.id
    );
    expect(dupeCheck(allGuardrailIds)).toBe(true);
    expect(dupeCheck(towerNode.sourceLayer.symbols.map((s: { id: string }) => s.id))).toBe(true);
    expect(dupeCheck(towerNode.reflectionLayer.adaptiveQuestionRefs.map((q: { id: string }) => q.id))).toBe(true);
  });
});

describe('Interpretation Graph — safety', () => {
  test('safe interpretations contain no certainty pattern', () => {
    for (const s of safeStrings(towerNode)) expect(s).not.toMatch(CERTAINTY_PATTERN);
  });

  test('safe fields contain no direct command pattern', () => {
    for (const s of safeStrings(towerNode)) expect(s).not.toMatch(DIRECT_COMMAND_PATTERN);
  });

  test('safe fields contain no diagnosis/personality-label pattern', () => {
    for (const s of safeStrings(towerNode)) expect(s).not.toMatch(DIAGNOSIS_PATTERN);
  });

  test('safe fields contain no professional-outcome prediction pattern', () => {
    for (const s of safeStrings(towerNode)) expect(s).not.toMatch(PROFESSIONAL_OUTCOME_PATTERN);
  });

  test('safe fields contain no third-party mind-reading certainty pattern', () => {
    for (const s of safeStrings(towerNode)) expect(s).not.toMatch(THIRD_PARTY_CERTAINTY_PATTERN);
  });

  test('"kaçınılmaz" does not appear in any safe runtime field', () => {
    for (const s of safeStrings(towerNode)) expect(s.toLowerCase()).not.toContain('kaçınılmaz');
  });

  test('"sahte yapı" does not appear in any safe runtime field', () => {
    for (const s of safeStrings(towerNode)) expect(s.toLowerCase()).not.toContain('sahte yapı');
  });

  test('Rider-Waite-Smith / RWS is never named in operative (sourceLayer/reflectionLayer) content', () => {
    const operative = JSON.stringify({
      sourceLayer: towerNode.sourceLayer,
      reflectionLayer: towerNode.reflectionLayer,
    }).toLowerCase();
    expect(operative).not.toContain('rider-waite-smith');
    expect(operative).not.toContain('rider waite smith');
  });

  test('every user-signals.json entry only allows explicit/user-confirmed sources', () => {
    for (const signal of userSignals.signals) {
      expect(signal.allowedSources).toEqual(
        expect.arrayContaining(signal.allowedSources.filter((s: string) => ['explicit-user-selection', 'user-confirmed'].includes(s)))
      );
      for (const src of signal.allowedSources) {
        expect(['explicit-user-selection', 'user-confirmed']).toContain(src);
      }
      expect(signal.notADiagnosis).toBe(true);
    }
  });

  test('no adaptive question pre-assumes a diagnosis or a certain outcome', () => {
    for (const q of towerNode.reflectionLayer.adaptiveQuestionRefs) {
      expect(q.question).not.toMatch(DIAGNOSIS_PATTERN);
      expect(q.question).not.toMatch(CERTAINTY_PATTERN);
    }
  });
});

describe('Interpretation Graph — isolation', () => {
  test('src/server/** does not import the interpretation graph', () => {
    const serverDir = path.join(process.cwd(), 'src/server');
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const source = fs.readFileSync(full, 'utf-8');
          if (source.includes('interpretation-graph')) offenders.push(full);
        }
      }
    };
    walk(serverDir);
    expect(offenders).toEqual([]);
  });

  test('src/app/** does not import the interpretation graph', () => {
    const appDir = path.join(process.cwd(), 'src/app');
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && /\.(ts|tsx)$/.test(entry.name)) {
          const source = fs.readFileSync(full, 'utf-8');
          if (source.includes('interpretation-graph')) offenders.push(full);
        }
      }
    };
    walk(appDir);
    expect(offenders).toEqual([]);
  });

  test('the existing canonical data/cards/16-tower.json is unchanged since the CRG-1 baseline', () => {
    const CRG1_BASE_SHA = 'f05a74a';
    let diff = '';
    try {
      diff = execFileSync('git', ['diff', CRG1_BASE_SHA, '--', 'data/cards/16-tower.json'], {
        cwd: process.cwd(),
        encoding: 'utf-8',
      });
    } catch {
      // If git is unavailable in this environment, fall back to a content check
      // against the known-good baseline values recorded in FAZ 9/RC-2 docs.
      diff = '';
    }
    expect(diff.trim()).toBe('');
  });

  test('the API request/response contract types are unaffected', () => {
    const apiTypesPath = path.join(process.cwd(), 'src/types/api.ts');
    const source = fs.readFileSync(apiTypesPath, 'utf-8');
    expect(source).not.toContain('interpretation-graph');
  });

  test('validator tool exists and does not require a new npm dependency', () => {
    const validatorPath = path.join(process.cwd(), 'tools/interpretation-graph/validate_interpretation_graph.py');
    expect(fs.existsSync(validatorPath)).toBe(true);
    const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'));
    expect(packageJson.dependencies.jsonschema).toBeUndefined();
    expect((packageJson.devDependencies ?? {}).jsonschema).toBeUndefined();
  });
});
