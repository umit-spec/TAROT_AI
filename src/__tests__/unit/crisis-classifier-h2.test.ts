import { describe, expect, test } from 'vitest';
import { assessCrisis } from '../../server/intake/crisis-classifier';
import {
  ALL_CASES,
  AMBIGUOUS_CASES,
  BENIGN_CASES,
  CRISIS_CASES,
  KNOWN_LIMITATIONS,
  type CrisisCase,
} from '../fixtures/crisis-dataset';
import {
  CRISIS_RESOURCES,
  GOVERNED_CRISIS_RESOURCES,
  resourcesForSubtypes,
} from '../../server/intake/crisis-resources';
import {
  editDistance,
  foldCase,
  normalizeForMatch,
  tokenMatches,
  tokenize,
  collapseSpacedLetters,
  stripSeparators,
  MIN_FUZZY_LENGTH,
} from '../../server/intake/turkish-text';

/**
 * H2 evaluation. This is a COVERAGE regression suite over synthetic phrasings,
 * not an accuracy measurement — see the dataset header.
 */

describe('H2 dataset — size meets the program minimum', () => {
  test('at least 50 benign, 60 crisis, 20 ambiguous cases', () => {
    expect(BENIGN_CASES.length).toBeGreaterThanOrEqual(50);
    expect(CRISIS_CASES.length).toBeGreaterThanOrEqual(60);
    expect(AMBIGUOUS_CASES.length).toBeGreaterThanOrEqual(20);
  });

  test('no duplicate case text', () => {
    const seen = new Map<string, number>();
    for (const c of ALL_CASES) seen.set(c.text, (seen.get(c.text) ?? 0) + 1);
    expect([...seen.entries()].filter(([, n]) => n > 1)).toEqual([]);
  });
});

describe('H2 — benign questions are never withheld', () => {
  test.each(BENIGN_CASES.map((c): [string, CrisisCase] => [c.text || '(empty)', c]))(
    '%s',
    (_label, c) => {
      const level = assessCrisis(c.text).level;
      // The hard requirement: a benign question must never hit the crisis
      // gate. Escalation to emotional_support is acceptable for cases the
      // dataset marks that way, and is never a withheld reading.
      expect(level).not.toBe('crisis');
      if (c.expect === 'normal') expect(level).not.toBe('crisis');
    }
  );
});

describe('H2 — crisis disclosures are always withheld', () => {
  test.each(CRISIS_CASES.map((c): [string, CrisisCase] => [c.text, c]))('%s', (_label, c) => {
    const result = assessCrisis(c.text);
    expect(result.level).toBe('crisis');
    if (c.category) expect(result.categories).toContain(c.category);
  });
});

describe('H2 — ambiguous distress resolves to support, never to silence', () => {
  test.each(AMBIGUOUS_CASES.map((c): [string, CrisisCase] => [c.text, c]))('%s', (_label, c) => {
    const level = assessCrisis(c.text).level;
    if (c.expect === 'emotional_support') {
      // Escalating to crisis is a safe failure; dropping to normal is not.
      expect(level === 'emotional_support' || level === 'crisis').toBe(true);
    } else {
      expect(level).toBe(c.expect);
    }
  });
});

/**
 * The fail-safe: when a crisis keyword matched but an exclusion discounted it,
 * and the person is also distressed, the classifier must not resolve toward
 * "ordinary question".
 */
describe('H2 — discounted crisis plus distress never resolves to normal', () => {
  const cases = [
    'İntihar etmeyi düşünmüyorum ama çok kötüyüm ve ağlıyorum.',
    'Kendime zarar vermem ama çaresizim.',
    'Haberlerde intihar haberi gördüm, çok kötü hissediyorum.',
  ];
  test.each(cases)('%s', (text) => {
    const r = assessCrisis(text);
    expect(r.discounted).toBe(true);
    expect(r.level).not.toBe('normal');
  });
});

describe('H2 — coverage summary (reported, not asserted as accuracy)', () => {
  test('prints the confusion breakdown', () => {
    const rows: Array<{ group: string; expected: string; actual: string; text: string }> = [];
    let benignWithheld = 0;
    let crisisMissed = 0;

    for (const c of ALL_CASES) {
      const actual = assessCrisis(c.text).level;
      if (actual !== c.expect) {
        rows.push({ group: c.group, expected: c.expect, actual, text: c.text });
      }
      if (c.expect !== 'crisis' && actual === 'crisis') benignWithheld++;
      if (c.expect === 'crisis' && actual !== 'crisis') crisisMissed++;
    }

    console.log(
      `\nH2 coverage: ${ALL_CASES.length} synthetic cases | ` +
        `exact-level mismatches: ${rows.length} | ` +
        `benign withheld: ${benignWithheld} | crisis missed: ${crisisMissed}`
    );
    if (rows.length > 0) {
      console.log(rows.map((r) => `  [${r.group}] ${r.expected}->${r.actual}: ${r.text}`).join('\n'));
    }

    // The two failures that matter are hard gates.
    expect(benignWithheld).toBe(0);
    expect(crisisMissed).toBe(0);
  });
});

/* ------------------------------------------------------------------ *
 * Turkish text utility
 * ------------------------------------------------------------------ */

describe('H2 Turkish text — case folding', () => {
  test("fixes the dotted-I defect that JavaScript's toLowerCase introduces", () => {
    // The defect itself, pinned so nobody "simplifies" foldCase back to this.
    expect('KESİNLİKLE'.toLowerCase()).not.toBe('kesinlikle');
    expect(foldCase('KESİNLİKLE')).toBe('kesinlikle');
  });

  test('dotless I folds to ı, not i', () => {
    expect(foldCase('IRMAK')).toBe('ırmak');
  });

  test('is idempotent', () => {
    const once = foldCase('İNTİHAR');
    expect(foldCase(once)).toBe(once);
  });
});

describe('H2 Turkish text — diacritic folding', () => {
  test('accented and un-accented typing normalize to the same string', () => {
    expect(normalizeForMatch('düşünüyorum')).toBe(normalizeForMatch('dusunuyorum'));
    expect(normalizeForMatch('İntihar')).toBe(normalizeForMatch('intihar'));
  });
});

describe('H2 Turkish text — suffix whitelist', () => {
  // These are the exact over-matches that produced the sexual-assault false
  // positives. The whitelist must reject every one.
  test.each([
    ['zorlanıyorum', 'zorla'],
    ['zorlamam', 'zorla'],
    ['zorlanmış', 'zorla'],
    ['zorluyorum', 'zorla'],
  ])('%s must NOT match stem %s', (token, stem) => {
    expect(tokenMatches(tokenize(token)[0], normalizeForMatch(stem))).toBe(false);
  });

  test.each([
    ['intihar', 'intihar'],
    ['intiharı', 'intihar'],
    ['intihardan', 'intihar'],
    ['tecavüze', 'tecavüz'],
  ])('%s must match stem %s', (token, stem) => {
    expect(tokenMatches(tokenize(token)[0], normalizeForMatch(stem))).toBe(true);
  });
});

describe('H2 Turkish text — bounded typo tolerance', () => {
  test('a one-character typo on a long stem is tolerated when fuzzy is on', () => {
    expect(tokenMatches('zrar', 'zarar', { fuzzy: true })).toBe(true);
  });

  test('typo tolerance is off by default', () => {
    expect(tokenMatches('zrar', 'zarar')).toBe(false);
  });

  test(`stems shorter than ${MIN_FUZZY_LENGTH} are never fuzzy-matched`, () => {
    // One edit turns many short Turkish words into different ones.
    expect(tokenMatches('bal', 'bak', { fuzzy: true })).toBe(false);
    expect(tokenMatches('kar', 'kaz', { fuzzy: true })).toBe(false);
  });

  test('edit distance caps out instead of scanning the whole matrix', () => {
    expect(editDistance('abc', 'abc')).toBe(0);
    expect(editDistance('abc', 'abd')).toBe(1);
    expect(editDistance('abc', 'xyz', 1)).toBeGreaterThan(1);
  });
});

describe('H2 Turkish text — de-obfuscation', () => {
  test('spaced-out letters collapse back to the word', () => {
    expect(collapseSpacedLetters('bu k e s i n l i k l e olacak')).toBe('bu kesinlikle olacak');
  });

  test('ordinary short words are left alone', () => {
    expect(collapseSpacedLetters('o bir ev var')).toBe('o bir ev var');
  });

  test('stripSeparators exposes hyphen and dot obfuscation', () => {
    expect(stripSeparators('kesin-likle')).toContain('kesinlikle');
    expect(stripSeparators('k.e.s.i.n.l.i.k.l.e')).toContain('kesinlikle');
  });
});

/* ------------------------------------------------------------------ *
 * Structural guarantees
 * ------------------------------------------------------------------ */

describe('H2 — the assessment never carries user text', () => {
  test('categories are categorical identifiers only', () => {
    const r = assessCrisis('Kendime zarar vermek istiyorum, adım Ayşe ve numaram 5551234567.');
    expect(r.level).toBe('crisis');
    const serialized = JSON.stringify(r);
    expect(serialized).not.toContain('Ayşe');
    expect(serialized).not.toContain('5551234567');
    expect(serialized).not.toContain('zarar');
    for (const c of r.categories) expect(c).toMatch(/^crisis_[a-z_]+$/);
  });
});

/* ------------------------------------------------------------------ *
 * Governed crisis resources (H2 §6.6)
 * ------------------------------------------------------------------ */

describe('H2 — governed crisis resources', () => {
  test('every registry entry carries full provenance', () => {
    for (const r of GOVERNED_CRISIS_RESOURCES) {
      expect(r.institution.length).toBeGreaterThan(0);
      expect(r.sourceUrl).toMatch(/^https:\/\//);
      expect(r.verifiedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.reviewBy).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.reviewOwner.length).toBeGreaterThan(0);
      expect(new Date(r.reviewBy).getTime()).toBeGreaterThan(new Date(r.verifiedOn).getTime());
    }
  });

  test('a disabled entry states what it is blocked on', () => {
    for (const r of GOVERNED_CRISIS_RESOURCES.filter((x) => !x.runtimeEnabled)) {
      expect(r.blockedReason && r.blockedReason.length > 0).toBe(true);
    }
  });

  /**
   * ALO 183 must not reach a user until a Product Owner safety determination
   * is recorded (docs/SAFETY_CRISIS_RESOURCES_REVIEW.md §4). This test is the
   * guard that stops the flag being flipped as a side effect of other work.
   */
  test('ALO 183 stays out of the runtime list pending human sign-off', () => {
    const alo183 = GOVERNED_CRISIS_RESOURCES.find((r) => r.contact === '183');
    expect(alo183).toBeDefined();
    expect(alo183!.runtimeEnabled).toBe(false);
    expect(CRISIS_RESOURCES.map((r) => r.contact)).not.toContain('183');
  });

  test('112 is returned for every subtype, and for an unknown one', () => {
    const subtypes = [
      ['crisis_suicide_detected'],
      ['crisis_violence_detected'],
      ['crisis_medical_detected'],
      ['crisis_assault_detected'],
      ['crisis_unrecognized_future_category'],
      [],
    ];
    for (const s of subtypes) {
      const contacts = resourcesForSubtypes(s).map((r) => r.contact);
      expect(contacts).toContain('112');
      expect(contacts.length).toBeGreaterThan(0);
    }
  });

  test('no unverified or removed number can appear', () => {
    const body = JSON.stringify(resourcesForSubtypes(['crisis_assault_detected']));
    expect(body).not.toContain('155');
    expect(body).not.toContain('0312');
    expect(body).not.toContain('9098');
    expect(body).not.toContain('183');
  });
});

describe('H2 — known limitations stay exactly as documented', () => {
  test.each(KNOWN_LIMITATIONS.map((k) => [k.text, k] as const))(
    'still behaves as recorded: %s',
    (_label, k) => {
      // Pinned so this list cannot grow silently, and so a future fix has to
      // update the record rather than leave a stale claim behind.
      expect(assessCrisis(k.text).level).toBe(k.actual);
      expect(k.actual).not.toBe(k.ideal);
      expect(k.why.length).toBeGreaterThan(40);
    }
  );

  test('every known limitation is a conservative (over-reacting) failure', () => {
    // A limitation that MISSES a crisis would be a different class of problem
    // and must never be parked on this list.
    for (const k of KNOWN_LIMITATIONS) {
      expect(k.ideal).not.toBe('crisis');
    }
  });
});
