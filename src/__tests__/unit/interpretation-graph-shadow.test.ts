import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync, spawnSync } from 'child_process';
import { describe, expect, test } from 'vitest';

const ROOT = process.cwd();
const PYTHON = 'python3';
const SCRIPT = path.join(ROOT, 'tools/interpretation-graph/run_anthropic_shadow.py');
const DATASET_PATH = path.join(
  ROOT,
  'data/interpretation-graph/shadow-evaluation/two-card-shadow-cases.json'
);

type ShadowCase = {
  id: string;
  category: string;
  input: {
    cardId: string;
    position: string;
    topic: string;
    goal: string;
    explicitSignals: Array<Record<string, unknown>>;
    relationshipType: string | null;
    userQuestion: string;
    presentationPreference: string;
    crisisFlag?: boolean;
  };
  forbiddenOutputSubstrings: string[];
  expectedNoModelCall?: boolean;
};

const dataset = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8')) as {
  schemaVersion: string;
  cases: ShadowCase[];
};

function tempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function runJson(args: string[], env: NodeJS.ProcessEnv = process.env): any {
  const stdout = execFileSync(PYTHON, [SCRIPT, ...args], {
    cwd: ROOT,
    encoding: 'utf8',
    env,
  });
  return JSON.parse(stdout);
}

describe('IG-4 — governed synthetic dataset', () => {
  test('dataset has the governed 24-case size', () => {
    expect(dataset.schemaVersion).toBe('1.0.0');
    expect(dataset.cases).toHaveLength(24);
  });

  test('case IDs are unique', () => {
    const ids = dataset.cases.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('coverage is balanced across Tower and Magician', () => {
    expect(dataset.cases.filter((item) => item.input.cardId === '01-magician')).toHaveLength(12);
    expect(dataset.cases.filter((item) => item.input.cardId === '16-tower')).toHaveLength(12);
  });

  test('exactly two cases require crisis short-circuit', () => {
    const crisis = dataset.cases.filter((item) => item.expectedNoModelCall === true);
    expect(crisis).toHaveLength(2);
    expect(crisis.every((item) => item.input.crisisFlag === true)).toBe(true);
  });

  test('exactly 22 cases are eligible for a live call', () => {
    expect(dataset.cases.filter((item) => item.expectedNoModelCall !== true)).toHaveLength(22);
  });

  test('dataset contains no email addresses or Turkish phone-number patterns', () => {
    const serialized = JSON.stringify(dataset);
    expect(serialized).not.toMatch(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    expect(serialized).not.toMatch(/(?:\+90|0)?5\d{9}/);
  });

  for (const shadowCase of dataset.cases) {
    test(`${shadowCase.id} has canonical bounded-composer input`, () => {
      expect(['01-magician', '16-tower']).toContain(shadowCase.input.cardId);
      expect(['past', 'present', 'direction']).toContain(shadowCase.input.position);
      expect([
        'career',
        'relationship',
        'decision',
        'family',
        'boundaries',
        'self-awareness',
        'uncertainty',
        'change',
      ]).toContain(shadowCase.input.topic);
      expect(['clarify-thoughts', 'see-different-perspective', 'weigh-decision', 'understand-emotions', 'curiosity']).toContain(
        shadowCase.input.goal
      );
      expect(shadowCase.input.presentationPreference).toBe('concise');
      expect(shadowCase.input.userQuestion.trim().length).toBeGreaterThan(10);
      expect(Array.isArray(shadowCase.forbiddenOutputSubstrings)).toBe(true);
    });
  }
});

describe('IG-4 — dry-run and deterministic simulation', () => {
  test('dry-run composes all callable cases without network access', () => {
    const out = tempDir('ig4-dry-');
    try {
      const summary = runJson(['--output-dir', out]);
      expect(summary.mode).toBe('dry-run');
      expect(summary.decision).toBe('READY');
      expect(summary.liveStatus).toBe('NOT_EXECUTED');
      expect(summary.modelCalls).toBe(0);
      expect(summary.plannedModelCalls).toBe(22);
      expect(summary.crisisShortCircuits).toBe(2);
      expect(summary.conservativeUpperBoundUsd).toBeLessThanOrEqual(1);
      expect(summary.productionRuntimeInvoked).toBe(false);
      expect(fs.existsSync(path.join(out, 'summary.json'))).toBe(true);
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });

  test('simulation exercises the complete post-response validation path', () => {
    const out = tempDir('ig4-sim-');
    try {
      const summary = runJson(['--simulate', '--output-dir', out]);
      expect(summary.mode).toBe('simulate');
      expect(summary.liveStatus).toBe('SIMULATED');
      expect(summary.decision).toBe('PASS-WITH-NOTES');
      expect(summary.modelCalls).toBe(22);
      expect(summary.validOutputs).toBe(22);
      expect(summary.hardSafetyOrLeakageFailures).toBe(0);
      expect(summary.crisisShortCircuits).toBe(2);
      expect(summary.estimatedCostUsd).toBeLessThanOrEqual(1);

      const results = JSON.parse(fs.readFileSync(path.join(out, 'results.json'), 'utf8')) as any[];
      const packet = JSON.parse(fs.readFileSync(path.join(out, 'review-packet.json'), 'utf8')) as any[];
      const unblind = JSON.parse(fs.readFileSync(path.join(out, 'unblind-map.json'), 'utf8')) as Record<string, string>;
      expect(results).toHaveLength(22);
      expect(results.every((item) => item.valid === true)).toBe(true);
      expect(packet).toHaveLength(22);
      expect(Object.keys(unblind)).toHaveLength(22);
      expect(new Set(Object.keys(unblind)).size).toBe(22);
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });

  test('live execution is blocked unless the explicit environment gate is open', () => {
    const out = tempDir('ig4-gate-');
    try {
      const result = spawnSync(PYTHON, [SCRIPT, '--execute', '--output-dir', out], {
        cwd: ROOT,
        encoding: 'utf8',
        env: { ...process.env, IG4_ALLOW_LIVE: '', ANTHROPIC_API_KEY: '' },
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('LIVE_GATE_CLOSED');
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });

  test('open live gate with no credential reports honest NOT_EXECUTED without failing the harness', () => {
    const out = tempDir('ig4-no-key-');
    try {
      const env: NodeJS.ProcessEnv = { ...process.env, IG4_ALLOW_LIVE: '1' };
      delete env.ANTHROPIC_API_KEY;
      const summary = runJson(['--execute', '--output-dir', out], env);
      expect(summary.liveStatus).toBe('NOT_EXECUTED');
      expect(summary.decision).toBe('BLOCKED');
      expect(summary.modelCalls).toBe(0);
      expect(summary.blockedReason).toContain('ANTHROPIC_API_KEY');
    } finally {
      fs.rmSync(out, { recursive: true, force: true });
    }
  });
});

describe('IG-4 — Anthropic request contract', () => {
  test('request uses top-level system, user-role data message and output_config.format', () => {
    const py = [
      'import json,sys',
      `sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'tools/interpretation-graph'))})`,
      'from run_anthropic_shadow import _load_json,_sanitize_output_schema,_build_request_body,DATASET_PATH,OUTPUT_SCHEMA_PATH',
      'from compose_bounded_prompt import compose_bounded_prompt',
      'case=_load_json(DATASET_PATH)["cases"][0]',
      'bundle=compose_bounded_prompt(case["input"])',
      'schema=_sanitize_output_schema(_load_json(OUTPUT_SCHEMA_PATH))',
      'body=_build_request_body(bundle,"claude-sonnet-4-6",600,schema)',
      'print(json.dumps(body,ensure_ascii=False))',
    ].join(';');
    const body = JSON.parse(
      execFileSync(PYTHON, ['-c', py], { cwd: ROOT, encoding: 'utf8' })
    );
    expect(typeof body.system).toBe('string');
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe('user');
    expect(body.messages.some((message: any) => message.role === 'system')).toBe(false);
    expect(body.output_config.format.type).toBe('json_schema');
    expect(body.output_config.format.schema.additionalProperties).toBe(false);
    expect(body.temperature).toBe(0);
    expect(body.model).toBe('claude-sonnet-4-6');
  });

  test('API schema removes unsupported metadata/constraints but preserves the exact required contract', () => {
    const py = [
      'import json,sys',
      `sys.path.insert(0, ${JSON.stringify(path.join(ROOT, 'tools/interpretation-graph'))})`,
      'from run_anthropic_shadow import _load_json,_sanitize_output_schema,OUTPUT_SCHEMA_PATH',
      'schema=_sanitize_output_schema(_load_json(OUTPUT_SCHEMA_PATH))',
      'print(json.dumps(schema,ensure_ascii=False))',
    ].join(';');
    const schema = JSON.parse(execFileSync(PYTHON, ['-c', py], { cwd: ROOT, encoding: 'utf8' }));
    const serialized = JSON.stringify(schema);
    expect(serialized).not.toContain('$schema');
    expect(serialized).not.toContain('$id');
    expect(serialized).not.toContain('$comment');
    expect(serialized).not.toContain('minLength');
    expect(schema.required).toEqual([
      'primaryInterpretation',
      'alternativePerspective',
      'reflectionQuestion',
      'usedContextRefs',
    ]);
    expect(schema.properties.usedContextRefs.additionalProperties).toBe(false);
  });

  test('default model is a pinned structured-output-capable model ID', () => {
    const source = fs.readFileSync(SCRIPT, 'utf8');
    expect(source).toContain('DEFAULT_MODEL = "claude-sonnet-4-6"');
    expect(source).toContain('DEFAULT_BUDGET_USD = 1.00');
    expect(source).toContain('DEFAULT_MAX_LIVE_CALLS = 22');
  });
});

describe('IG-4 — repository isolation and operator ergonomics', () => {
  test('shadow run directory is git-ignored', () => {
    const ignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    expect(ignore).toContain('data/interpretation-graph/shadow-runs/');
  });

  test('package scripts expose dry-run, simulate and explicit live modes', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
    expect(pkg.scripts['ig4:dry-run']).toContain('run_anthropic_shadow.py');
    expect(pkg.scripts['ig4:simulate']).toContain('--simulate');
    expect(pkg.scripts['ig4:live']).toContain('--execute');
  });

  test('production app/server/components do not import the shadow harness', () => {
    const offenders: string[] = [];
    for (const relative of ['src/app', 'src/server', 'src/components']) {
      const base = path.join(ROOT, relative);
      const stack = [base];
      while (stack.length) {
        const current = stack.pop()!;
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
          const full = path.join(current, entry.name);
          if (entry.isDirectory()) stack.push(full);
          else if (/\.(ts|tsx)$/.test(entry.name)) {
            const text = fs.readFileSync(full, 'utf8');
            if (text.includes('run_anthropic_shadow') || text.includes('two-card-shadow-cases')) {
              offenders.push(path.relative(ROOT, full));
            }
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
