// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ReflectionClose } from '../../components/ReflectionClose';

const PROMPT = 'Bu kararda kontrol etmeye çalıştığın şey ne?';

describe('ReflectionClose — one governed question, nothing else', () => {
  test('renders the governed reflection prompt verbatim', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.getByLabelText('reflection-question')).toHaveTextContent(PROMPT);
    // Verbatim: no extra punctuation appended by the client.
    expect(screen.getByLabelText('reflection-question').textContent).toBe(PROMPT);
  });

  test('shows exactly one question', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const text = screen.getByLabelText('reflection-close').textContent ?? '';
    expect((text.match(/\?/g) ?? []).length).toBe(1);
  });

  test('does not leak uncertainty/provider/source/fallback/persona metadata', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    const text = screen.getByLabelText('reflection-close').textContent ?? '';
    expect(text).not.toMatch(/provider|reflectionPromptSource|fallback|confidence|safetyFlags|persona|kesinlik değil/i);
  });

  test('offers no save / share / read-again / upsell control', () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /kaydet|paylaş|tekrar oku|yeni okuma|premium|abone/i })).not.toBeInTheDocument();
  });

  test('the only control is a neutral restart, which fires its handler', async () => {
    const onRestart = vi.fn();
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={onRestart} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: 'Yeniden başla' }));
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  test('focuses its heading on mount and is not an alert/live region', async () => {
    render(<ReflectionClose reflectionPrompt={PROMPT} onRestart={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Kendine bırakacağın soru' })).toHaveFocus());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByLabelText('reflection-question').getAttribute('aria-live')).toBeNull();
  });

  test('renders no fallback of its own when given the prompt (client never invents one)', () => {
    // Whatever governed text arrives is exactly what shows; the component has
    // no default prompt to substitute.
    const other = 'Şu an neye dikkat etmen sana iyi gelir?';
    render(<ReflectionClose reflectionPrompt={other} onRestart={vi.fn()} />);
    expect(screen.getByLabelText('reflection-question').textContent).toBe(other);
  });
});
