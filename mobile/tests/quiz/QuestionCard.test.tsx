import { fireEvent, render, screen } from '@testing-library/react-native';
import { QuestionCard } from '@/shared/features/quiz/components/QuestionCard';
import { QuizScreen } from '@/shared/features/quiz/screens/QuizScreen';
import { Colors } from '@/config/theme';
import * as themeHook from '@/hooks/use-theme';
import { StyleSheet } from 'react-native';
import { exampleQuestions, quizFixtures } from './fixtures';
import { describe, expect, it, jest } from '@jest/globals';

describe('QuestionCard', () => {
  it.each(['light', 'dark'] as const)('uses the corrected small-text color in the %s theme', async (mode) => {
    const theme = jest.spyOn(themeHook, 'useTheme').mockReturnValue(Colors[mode]);
    try {
      await render(<QuizScreen lessonId="contrast-check" questions={exampleQuestions} />);
      const style = StyleSheet.flatten(screen.getByText('APRENDE A TU RITMO').props.style);
      expect(style.color).toBe(mode === 'light' ? '#176b48' : '#78d8a5');
    } finally { theme.mockRestore(); }
  });

  it('shows a long prompt and four configurable formula-like options', async () => {
    const question = { ...quizFixtures.long[0], options: quizFixtures.long[0].options.map((option, index) => ({ ...option, text: index === 0 ? 'f(x) = ax² + bx + c; x → ∞; ∑ₙ₌₁ᵐ n²' : option.text })) };
    await render(<QuestionCard question={question} selectedOptionId={null} disabled={false} onSelect={jest.fn()} onConfirm={jest.fn()} />);
    expect(screen.getByText(question.text)).toBeTruthy();
    expect(screen.getByText(question.options[0].text)).toBeTruthy();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
  });

  it('keeps one accessible selection and only confirms after a choice', async () => {
    const onSelect = jest.fn(); const onConfirm = jest.fn();
    const view = await render(<QuestionCard question={exampleQuestions[0]} selectedOptionId={null} disabled={false} onSelect={onSelect} onConfirm={onConfirm} />);
    const confirm = screen.getByRole('button', { name: 'Comprobar respuesta' });
    expect(confirm.props.accessibilityState.disabled).toBe(true);
    await fireEvent.press(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('radio', { name: 'Marte' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
    await view.rerender(<QuestionCard question={exampleQuestions[0]} selectedOptionId="mars" disabled={false} onSelect={onSelect} onConfirm={onConfirm} />);
    expect(screen.getAllByRole('radio').filter((radio) => radio.props.accessibilityState.checked)).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
