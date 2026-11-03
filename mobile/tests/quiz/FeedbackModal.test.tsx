import { fireEvent, render, screen } from '@testing-library/react-native';
import { FeedbackModal } from '@/core/quiz/FeedbackModal';
import { describe, expect, it, jest } from '@jest/globals';

describe('FeedbackModal', () => {
  it('shows distinct feedback and explanation, continuing once despite rapid taps', async () => {
    const onContinue = jest.fn();
    await render(<FeedbackModal visible isCorrect={false} explanation="Lee con calma." onContinue={onContinue} />);
    expect(await screen.findByText(/respuesta incorrecta/i)).toBeTruthy();
    expect(await screen.findByText('Lee con calma.')).toBeTruthy();
    const button = await screen.findByRole('button', { name: /continuar/i });
    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('re-arms for a new feedback and supports long explanation content', async () => {
    const onContinue = jest.fn();
    const long = 'Una explicación extensa. '.repeat(80);
    const view = await render(<FeedbackModal visible isCorrect explanation={long} onContinue={onContinue} />);
    expect(await screen.findByText(/respuesta correcta/i)).toBeTruthy();
    expect(await screen.findByText(long)).toBeTruthy();
    const oldButton = await screen.findByRole('button', { name: /continuar/i });
    expect(await screen.findByRole('header', { name: /respuesta correcta/i })).toBeTruthy();
    await fireEvent.press(oldButton);
    await view.rerender(<FeedbackModal visible={false} isCorrect explanation="" onContinue={onContinue} />);
    await fireEvent.press(oldButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
    await view.rerender(<FeedbackModal visible isCorrect={false} explanation="Otra explicación." onContinue={onContinue} />);
    await fireEvent.press(oldButton);
    expect(onContinue).toHaveBeenCalledTimes(1);
    await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    expect(onContinue).toHaveBeenCalledTimes(2);
  });
});
