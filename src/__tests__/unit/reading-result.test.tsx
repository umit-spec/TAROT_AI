// @vitest-environment jsdom
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ReadingResult } from '../../components/ReadingResult';
import type { DrawnCard } from '../../types/reading';
import type { InterpretationOutput } from '../../types/interpretation';
import type { KnowledgeResolutionMeta } from '../../types/knowledge';
import type { IntakeContext } from '../../types/intake';
import { RESULT_DISCLAIMER_COPY } from '../../lib/constitution-copy';

const REGION_NAME = 'Kartların ayrıntılı okuması';

const CARDS: DrawnCard[] = [
  { id: '00-fool', position: 'past', orientation: 'upright' },
  { id: '01-magician', position: 'present', orientation: 'upright' },
  { id: '02-high-priestess', position: 'future', orientation: 'upright' },
];

const INTERPRETATION: InterpretationOutput = {
  opening: 'Kısa bir açılış cümlesi.',
  cards: [
    {
      cardId: '00-fool',
      position: 'past',
      symbolicMeaning: 'GİZLİ-SEMBOLİK-ANLAM-DELI',
      relevanceToQuestion: 'Deli kartının sorunla bağlantısı.',
      reflection: 'Deli için bir düşünme notu.',
    },
    {
      cardId: '01-magician',
      position: 'present',
      symbolicMeaning: 'GİZLİ-SEMBOLİK-ANLAM-BUYUCU',
      relevanceToQuestion: 'Büyücü kartının sorunla bağlantısı.',
      reflection: 'Büyücü için bir düşünme notu.',
    },
    {
      cardId: '02-high-priestess',
      position: 'future',
      symbolicMeaning: 'GİZLİ-SEMBOLİK-ANLAM-RAHIBE',
      relevanceToQuestion: 'Yüksek Rahibe kartının sorunla bağlantısı.',
      reflection: 'Yüksek Rahibe için bir düşünme notu.',
    },
  ],
  patterns: ['ilk destekleyici ipucu', 'ikinci destekleyici ipucu'],
  practicalReflection: 'Üç kartın bütünsel değerlendirmesi.',
  uncertaintyNotice: 'Bu kesinlik değildir, olası bir bakış açısıdır.',
  safetyFlags: [],
  reflectionPrompt: 'Kendine bırakabileceğin bir soru?',
};

const KNOWLEDGE_RESOLVED: KnowledgeResolutionMeta = { status: 'resolved', provider: 'local-json', version: '0.1.0' };
const KNOWLEDGE_PARTIAL: KnowledgeResolutionMeta = { status: 'partial', provider: 'local-json', version: '0.1.0' };
const KNOWLEDGE_FALLBACK: KnowledgeResolutionMeta = { status: 'fallback', provider: 'local-json', version: 'unknown' };

const INTAKE: IntakeContext = {
  questionDomain: 'career',
  persona: 'reflection-seeking',
  emotionalIntensity: 'low',
  decisionUrgency: 'low',
  spiritualPreference: 'balanced',
  responseDepth: 'standard',
  safetyFlags: [],
  confidence: 0.4,
};

function renderResult(overrides: Partial<Parameters<typeof ReadingResult>[0]> = {}) {
  return render(
    <ReadingResult
      cards={CARDS}
      interpretation={INTERPRETATION}
      knowledgeMeta={KNOWLEDGE_RESOLVED}
      providerUsed="claude"
      intakeContext={INTAKE}
      {...overrides}
    />
  );
}

describe('ReadingResult — accessible entry and structure', () => {
  test('region accessible name is the visible heading, not a test-hook string', () => {
    renderResult();
    expect(screen.getByRole('region', { name: REGION_NAME })).toHaveAttribute('data-testid', 'reading-result');
  });

  test('heading focuses on mount', async () => {
    renderResult();
    await waitFor(() => expect(screen.getByRole('heading', { name: REGION_NAME })).toHaveFocus());
  });

  test('heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    renderResult();
    const heading = screen.getByRole('heading', { name: REGION_NAME });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });

  test('persona framing label renders verbatim; raw persona enum never appears', () => {
    renderResult();
    expect(screen.getByTestId('persona-framing')).toHaveTextContent('Açık uçlu bir yansıtma olarak');
    expect(screen.getByRole('region', { name: REGION_NAME }).textContent ?? '').not.toMatch(/reflection-seeking/);
  });

  test('opening renders verbatim', () => {
    renderResult();
    expect(screen.getByText('Kısa bir açılış cümlesi.')).toBeInTheDocument();
  });
});

describe('ReadingResult — card order, index pairing, and identity privacy', () => {
  test('cards render in array order, each paired with interpretation.cards at the same index', () => {
    renderResult();
    const list = screen.getByTestId('card-list');
    const items = within(list).getAllByTestId(/^card-narration-/);
    expect(items.map((el) => el.getAttribute('data-testid'))).toEqual([
      'card-narration-0',
      'card-narration-1',
      'card-narration-2',
    ]);
    expect(items[0]).toHaveTextContent('Deli');
    expect(items[0]).toHaveTextContent('Deli kartının sorunla bağlantısı.');
    expect(items[2]).toHaveTextContent('Yüksek Rahibe');
    expect(items[2]).toHaveTextContent('Yüksek Rahibe kartının sorunla bağlantısı.');
  });

  test('positions read Geçmiş / Şimdi / Yön - never Gelecek', () => {
    renderResult();
    const body = screen.getByRole('region', { name: REGION_NAME }).textContent ?? '';
    expect(body).toContain('Geçmiş');
    expect(body).toContain('Şimdi');
    expect(body).toContain('Yön');
    expect(body).not.toMatch(/Gelecek/);
  });

  test('an unknown card id falls back to the neutral governed name, never the raw id', () => {
    const cards: DrawnCard[] = [{ id: '99-nonexistent', position: 'past', orientation: 'upright' }];
    const interpretation: InterpretationOutput = {
      ...INTERPRETATION,
      cards: [INTERPRETATION.cards[0]!],
    };
    render(
      <ReadingResult
        cards={cards}
        interpretation={{ ...interpretation, cards: [{ ...interpretation.cards[0]!, cardId: '99-nonexistent' }] }}
        knowledgeMeta={KNOWLEDGE_RESOLVED}
        providerUsed="claude"
        intakeContext={INTAKE}
      />
    );
    const item = screen.getByTestId('card-narration-0');
    expect(item).toHaveTextContent('Kart');
    expect(item.textContent ?? '').not.toContain('99-nonexistent');
  });

  test('raw card id never appears in the DOM at all (not in text, not in any attribute)', () => {
    renderResult();
    const region = screen.getByRole('region', { name: REGION_NAME });
    expect(region.textContent ?? '').not.toMatch(/00-fool|01-magician|02-high-priestess/);
    expect(region.innerHTML).not.toMatch(/00-fool|01-magician|02-high-priestess/);
  });

  test('relevanceToQuestion and reflection render verbatim per card', () => {
    renderResult();
    expect(screen.getByText('Büyücü kartının sorunla bağlantısı.')).toBeInTheDocument();
    expect(screen.getByText('Büyücü için bir düşünme notu.')).toBeInTheDocument();
  });

  test('symbolicMeaning is never rendered anywhere on this screen', () => {
    renderResult();
    const region = screen.getByRole('region', { name: REGION_NAME });
    expect(region.textContent ?? '').not.toMatch(/GİZLİ-SEMBOLİK-ANLAM/);
    expect(region.innerHTML).not.toMatch(/GİZLİ-SEMBOLİK-ANLAM/);
  });

  test('each card item is a semantic list item containing an article', () => {
    renderResult();
    const item = screen.getByTestId('card-narration-0');
    expect(item.tagName).toBe('LI');
    expect(item.querySelector('article')).not.toBeNull();
  });
});

describe('ReadingResult — synthesis section', () => {
  test('practicalReflection renders verbatim', () => {
    renderResult();
    expect(screen.getByText('Üç kartın bütünsel değerlendirmesi.')).toBeInTheDocument();
  });

  test('patterns render in array order, no item singled out', () => {
    renderResult();
    const patterns = screen.getByTestId('patterns');
    const items = within(patterns).getAllByRole('listitem').map((li) => li.textContent);
    expect(items).toEqual(['ilk destekleyici ipucu', 'ikinci destekleyici ipucu']);
  });

  test('empty patterns renders no patterns list', () => {
    renderResult({ interpretation: { ...INTERPRETATION, patterns: [] } });
    expect(screen.queryByTestId('patterns')).not.toBeInTheDocument();
  });

  test('uncertaintyNotice renders verbatim as a boundary note', () => {
    renderResult();
    expect(screen.getByText('Bu kesinlik değildir, olası bir bakış açısıdır.')).toBeInTheDocument();
  });
});

describe('ReadingResult — diagnostics matrix', () => {
  test('resolved knowledge + non-mock provider shows no diagnostics at all', () => {
    renderResult({ knowledgeMeta: KNOWLEDGE_RESOLVED, providerUsed: 'claude' });
    expect(screen.queryByTestId(/^diagnostic-/)).not.toBeInTheDocument();
  });

  test('knowledge partial shows exactly the partial badge', () => {
    renderResult({ knowledgeMeta: KNOWLEDGE_PARTIAL });
    expect(screen.getByTestId('diagnostic-knowledge-partial')).toHaveTextContent('kısmi');
    expect(screen.queryByTestId('diagnostic-knowledge-fallback')).not.toBeInTheDocument();
  });

  test('knowledge fallback shows exactly the fallback badge', () => {
    renderResult({ knowledgeMeta: KNOWLEDGE_FALLBACK });
    expect(screen.getByTestId('diagnostic-knowledge-fallback')).toHaveTextContent('ulaşılamadı');
  });

  test('providerUsed === "mock" shows exactly the narration-fallback badge', () => {
    renderResult({ providerUsed: 'mock' });
    expect(screen.getByTestId('diagnostic-narration-fallback')).toHaveTextContent('yedek modda');
  });

  test('raw provider string and safetyFlags never leak into the DOM', () => {
    renderResult({ providerUsed: 'mock', intakeContext: { ...INTAKE, safetyFlags: ['crisis_test_flag'] } });
    const region = screen.getByRole('region', { name: REGION_NAME });
    expect(region.textContent ?? '').not.toMatch(/crisis_test_flag/);
    expect(region.textContent ?? '').not.toMatch(/\bmock\b/);
  });
});

describe('ReadingResult — disclaimer and closing CTA', () => {
  test('all four disclaimer lines render exactly', () => {
    renderResult();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.heading)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.body)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.professionalNote)).toBeInTheDocument();
    expect(screen.getByText(RESULT_DISCLAIMER_COPY.autonomyNote)).toBeInTheDocument();
  });

  test('disclaimer footer accessible name is the visible "Hatırlatma" heading', () => {
    renderResult();
    const footer = screen.getByTestId('result-disclaimer');
    const labelledBy = footer.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent(RESULT_DISCLAIMER_COPY.heading);
  });

  test('onComplete present renders the CTA and calls only onComplete', async () => {
    const onComplete = vi.fn();
    renderResult({ onComplete });
    const cta = screen.getByRole('button', { name: 'Okumayı bir soruyla tamamla' });
    await userEvent.click(cta);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  test('onComplete absent renders no CTA at all', () => {
    renderResult({ onComplete: undefined });
    expect(screen.queryByRole('button', { name: 'Okumayı bir soruyla tamamla' })).not.toBeInTheDocument();
  });
});

describe('ReadingResult — plain-text safety', () => {
  test('an HTML/script-like governed string renders as inert text, never as a DOM element', () => {
    const malicious = '<script>window.__pwned = true;</script>';
    renderResult({ interpretation: { ...INTERPRETATION, practicalReflection: malicious } });
    expect(screen.getByText(malicious)).toBeInTheDocument();
    expect(document.querySelectorAll('script').length).toBe(0);
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});

describe('ReadingResult — stress fixtures', () => {
  test('long opening, synthesis, relevance, reflection, and pattern text all render without throwing', () => {
    const long = (label: string, n: number) => `${label} `.repeat(n).trim();
    renderResult({
      interpretation: {
        ...INTERPRETATION,
        opening: long('Uzun açılış cümlesi parçası.', 20),
        practicalReflection: long('Uzun bütünsel değerlendirme parçası.', 40),
        patterns: [long('Tek bir uzun destekleyici ipucu parçası.', 15)],
        uncertaintyNotice: long('Uzun belirsizlik notu parçası.', 25),
        cards: INTERPRETATION.cards.map((c) => ({
          ...c,
          relevanceToQuestion: long('Uzun soru bağlantısı parçası.', 25),
          reflection: long('Uzun düşünme notu parçası.', 15),
        })),
      },
    });
    expect(screen.getByRole('region', { name: REGION_NAME })).toBeInTheDocument();
  });
});
