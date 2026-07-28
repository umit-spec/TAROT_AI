// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ReflectionClose } from '../../components/ReflectionClose';

const PROMPT = 'Bu kararda kontrol etmeye çalıştığın şey ne?';
const REGION_NAME = 'Kendine bırakacağın soru';

describe('ReflectionClose — one governed question, nothing else', () => {
  test('renders the governed reflection prompt verbatim', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question')).toHaveTextContent(PROMPT);
    // Verbatim: no extra punctuation appended by the client.
    expect(screen.getByTestId('reflection-question').textContent).toBe(PROMPT);
  });

  test('shows exactly one question', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const text = screen.getByRole('region', { name: REGION_NAME }).textContent ?? '';
    expect((text.match(/\?/g) ?? []).length).toBe(1);
  });

  test('does not leak uncertainty/provider/source/fallback/persona metadata', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const text = screen.getByRole('region', { name: REGION_NAME }).textContent ?? '';
    expect(text).not.toMatch(/provider|reflectionPromptSource|fallback|confidence|safetyFlags|persona|kesinlik değil/i);
  });

  test('offers no save / share / read-again / upsell control', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: /kaydet|paylaş|tekrar oku|yeni okuma|premium|abone|bir okuma daha/i })
    ).not.toBeInTheDocument();
  });

  test('the only control is a neutral restart, which fires its handler', async () => {
    const onRestart = vi.fn();
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={onRestart} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Yeniden başla' }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  test('restart is not called during render, only on activation', () => {
    const onRestart = vi.fn();
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={onRestart} />);
    expect(onRestart).not.toHaveBeenCalled();
  });

  test('restart works with the keyboard (Enter and Space)', async () => {
    const onRestart = vi.fn();
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={onRestart} />);
    const restart = screen.getByRole('button', { name: 'Yeniden başla' });
    restart.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRestart).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onRestart).toHaveBeenCalledTimes(2);
  });

  test('restart button keeps a 44px+ minimum touch target', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const restart = screen.getByRole('button', { name: 'Yeniden başla' });
    expect(restart.className).toMatch(/min-h-\[48px\]/);
    expect(restart.className).toMatch(/min-w-\[44px\]/);
  });

  test('support text renders verbatim', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.getByText('Yanıtlamak zorunda değilsin. Bu soruyu yanında taşıman yeterli.')).toBeInTheDocument();
  });

  test('focuses its heading on mount and is not an alert/live region', async () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: REGION_NAME })).toHaveFocus());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByTestId('reflection-question').getAttribute('aria-live')).toBeNull();
  });

  test('the heading is tabIndex=-1 and never shows the interactive focus-visible ring', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const heading = screen.getByRole('heading', { name: REGION_NAME });
    expect(heading).toHaveAttribute('tabindex', '-1');
    expect(heading.className).toMatch(/focus-visible:outline-none/);
  });

  test('the region accessible name is the visible heading, not a test-hook string', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.getByRole('region', { name: REGION_NAME })).toHaveAttribute('data-testid', 'reflection-close');
  });

  test('the reflection question carries no technical accessible-name attribute', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question')).not.toHaveAttribute('aria-label');
  });

  test('renders no fallback of its own when given the prompt (client never invents one)', () => {
    // Whatever governed text arrives is exactly what shows; the component has
    // no default prompt to substitute.
    const other = 'Şu an neye dikkat etmen sana iyi gelir?';
    render(<ReflectionClose reflectionPrompt={other} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question').textContent).toBe(other);
  });
});

describe('ReflectionClose — plain-text safety and long/edge content', () => {
  test('an HTML/script-like governed prompt renders as inert text, never as a DOM element', () => {
    const malicious = '<script>alert("reflection")</script>';
    render(<ReflectionClose reflectionPrompt={malicious} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question')).toHaveTextContent(malicious);
    expect(document.querySelectorAll('script').length).toBe(0);
  });

  test('an 800+ character prompt renders in full, not truncated', () => {
    const long = 'Uzun bir yansıtma sorusu parçası. '.repeat(30).trim();
    expect(long.length).toBeGreaterThan(800);
    render(<ReflectionClose reflectionPrompt={long} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question').textContent).toBe(long);
  });

  test('newlines in the prompt are preserved as content (whitespace-pre-line)', () => {
    const withNewlines = 'Birinci satır.\nİkinci satır.';
    render(<ReflectionClose reflectionPrompt={withNewlines} onRestart={vi.fn()} />);
    const el = screen.getByTestId('reflection-question');
    expect(el.textContent).toBe(withNewlines);
    expect(el.className).toMatch(/whitespace-pre-line/);
  });

  test('a single-character prompt renders without crashing', () => {
    render(<ReflectionClose reflectionPrompt="?" onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question').textContent).toBe('?');
  });

  test('a prompt containing emoji renders unchanged, client adds none', () => {
    const withEmoji = 'Bugün ne hissediyorsun? 🌙';
    render(<ReflectionClose reflectionPrompt={withEmoji} onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question').textContent).toBe(withEmoji);
  });

  test('an empty prompt does not crash and the component invents no fallback text', () => {
    render(<ReflectionClose reflectionPrompt="" onRestart={vi.fn()} />);
    expect(screen.getByTestId('reflection-question').textContent).toBe('');
    // No client-authored substitute question appears anywhere on screen.
    expect(screen.getByRole('region', { name: REGION_NAME }).textContent ?? '').not.toMatch(/\?/);
  });
});
