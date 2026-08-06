// @vitest-environment jsdom
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { redactIssues } from '../../server/http/redact-issues';
import { ReadingRequestSchema, PreviewRequestSchema } from '../../types/api';
import { CONSENT_MODAL_COPY } from '../../lib/constitution-copy';
import { ConsentModal } from '../../components/ConsentModal';
import { CrisisNotice } from '../../components/CrisisNotice';
import { CRISIS_MESSAGE, CRISIS_RESOURCES } from '../../server/intake/crisis-resources';

/* ------------------------------------------------------------------ *
 * Privacy: validation errors must not echo user input
 * ------------------------------------------------------------------ */

describe('H5 privacy — error responses never echo user input', () => {
  test('an invalid enum value is not read back to the client', () => {
    // Zod's raw issue carries `received: "TC-12345678901"` and repeats it
    // inside the generated message.
    const parsed = ReadingRequestSchema.safeParse({ seed: 's', topicHint: 'TC-12345678901' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const raw = JSON.stringify(parsed.error.issues);
    expect(raw).toContain('TC-12345678901');

    const redacted = JSON.stringify(redactIssues(parsed.error.issues));
    expect(redacted).not.toContain('TC-12345678901');
  });

  test('smuggled key names are not read back to the client', () => {
    const parsed = PreviewRequestSchema.safeParse({ question: 'x', gizliAlan: 'hassas-veri' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;

    const redacted = JSON.stringify(redactIssues(parsed.error.issues));
    expect(redacted).not.toContain('gizliAlan');
    expect(redacted).not.toContain('hassas-veri');
  });

  test('the client still learns which field failed and why', () => {
    const parsed = ReadingRequestSchema.safeParse({ seed: 's', question: 'a'.repeat(2000) });
    if (parsed.success) throw new Error('expected failure');
    const redacted = redactIssues(parsed.error.issues);
    expect(redacted[0].path).toBe('question');
    expect(redacted[0].code).toBe('too_big');
  });

  test('our own limit copy survives, because we authored it', () => {
    const parsed = ReadingRequestSchema.safeParse({ seed: 's', question: 'a'.repeat(2000) });
    if (parsed.success) throw new Error('expected failure');
    expect(redactIssues(parsed.error.issues)[0].message).toContain('en fazla 1000 karakter');
  });

  test('a long question body never survives into the redacted issues', () => {
    const secret = 'TC 12345678901 ve hastalığım';
    const parsed = ReadingRequestSchema.safeParse({ seed: 's', question: `${secret} `.repeat(200) });
    if (parsed.success) throw new Error('expected failure');
    expect(JSON.stringify(redactIssues(parsed.error.issues))).not.toContain('12345678901');
  });
});

/* ------------------------------------------------------------------ *
 * Privacy: disclosure is present and specific
 * ------------------------------------------------------------------ */

describe('H5 privacy — third-party AI disclosure', () => {
  test('the provider is named, not described vaguely', () => {
    const text = CONSENT_MODAL_COPY.dataUse.join(' ');
    expect(text).toContain('Anthropic');
    // "teknoloji ortaklarımız" is exactly the vague phrasing this exists to
    // avoid; a reader cannot act on it.
    expect(text).not.toContain('teknoloji ortak');
  });

  test('the disclosure renders above the consent checkbox', () => {
    render(<ConsentModal onAccept={() => {}} onDecline={() => {}} />);
    const disclosure = screen.getByTestId('consent-data-use');
    const checkbox = screen.getByRole('checkbox');
    // Consent is only meaningful if what is being consented to is visible
    // above the control that grants it.
    expect(disclosure.compareDocumentPosition(checkbox) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('the sensitive-data warning is present', () => {
    render(<ConsentModal onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByTestId('consent-sensitive-note').textContent).toMatch(/sağlık|kimlik/i);
  });
});

/* ------------------------------------------------------------------ *
 * Accessibility: static, automatable checks only
 * ------------------------------------------------------------------ */

describe('H5 accessibility — crisis path (static checks)', () => {
  test('the crisis notice is an alert region with an accessible name', () => {
    render(<CrisisNotice message={CRISIS_MESSAGE} resources={[...CRISIS_RESOURCES]} />);
    const region = screen.getByRole('alert');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAccessibleName('Destek kaynakları');
  });

  test('focus moves to the crisis heading on mount', () => {
    render(<CrisisNotice message={CRISIS_MESSAGE} resources={[...CRISIS_RESOURCES]} />);
    const heading = screen.getByRole('heading', { name: 'Destek kaynakları' });
    // A screen-reader user must land here, not somewhere above it.
    expect(document.activeElement).toBe(heading);
  });

  test('the emergency number is reachable as a link with an accessible name', () => {
    render(<CrisisNotice message={CRISIS_MESSAGE} resources={[...CRISIS_RESOURCES]} />);
    const link = screen.getByRole('link', { name: /112/ });
    expect(link).toHaveAttribute('href', 'tel:112');
    // The visually-hidden suffix is what makes the link's purpose clear when
    // read out of context (WCAG 2.4.4).
    expect(link.textContent).toContain('numarasını ara');
  });

  test('the consent dialog is a modal with an accessible name and description', () => {
    render(<ConsentModal onAccept={() => {}} onDecline={() => {}} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleName(CONSENT_MODAL_COPY.title);
    expect(dialog).toHaveAccessibleDescription(CONSENT_MODAL_COPY.intro);
  });

  test('the accept control is disabled until consent is given', () => {
    render(<ConsentModal onAccept={() => {}} onDecline={() => {}} />);
    expect(screen.getByRole('button', { name: CONSENT_MODAL_COPY.acceptLabel })).toBeDisabled();
  });

  test('every interactive control in the crisis path meets the 44px target rule', () => {
    // Enforced via class contract - jsdom computes no real layout, so this
    // asserts the rule is applied, NOT that it renders at 44px. Real
    // measurement is a browser check; see the evidence report.
    render(<CrisisNotice message={CRISIS_MESSAGE} resources={[...CRISIS_RESOURCES]} />);
    const link = screen.getByRole('link', { name: /112/ });
    expect(link.className).toContain('min-h-[44px]');
  });
});
