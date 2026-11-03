import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { StrictMode } from 'react';
import { QuizEngine } from '@/core/quiz';
import type { Question } from '@/core/quiz/types';
import { quizFixtures } from './fixtures';
import { useQuiz } from '@/core/quiz/use-quiz';
import { describe, expect, it, jest } from '@jest/globals';

const questions: readonly Question[] = [
  { id: 'one', text: '¿Cuál es la respuesta?', options: [{ id: 'a', text: 'Sí' }, { id: 'b', text: 'No' }], correctOptionId: 'a', explanation: 'La respuesta es sí.' },
  { id: 'two', text: 'Segunda pregunta', options: [{ id: 'c', text: 'Cierto' }, { id: 'd', text: 'Falso' }], correctOptionId: 'd', explanation: 'La respuesta es falso.' },
];

describe('QuizEngine', () => {
  it('reveals no key before confirmation, locks choices, advances explicitly, and completes once', async () => {
    const onComplete = jest.fn();
    const onAnswer = jest.fn();
    const view = await render(<QuizEngine questions={questions} onComplete={onComplete} onAnswer={onAnswer} />);
    expect(await screen.queryByText('La respuesta es sí.')).toBeNull();
    await fireEvent.press(await screen.findByRole('radio', { name: 'Sí' }));
    const confirm = await screen.findByRole('button', { name: /comprobar respuesta/i });
    await fireEvent.press(confirm);
    await fireEvent.press(confirm);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('La respuesta es sí.')).toBeTruthy();
    expect(JSON.stringify(view.toJSON())).toContain('"disabled":true');
    await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    await fireEvent.press(await screen.findByRole('radio', { name: 'Cierto' }));
    await fireEvent.press(await screen.findByRole('button', { name: /comprobar respuesta/i }));
    expect(await screen.findByText('Respuesta incorrecta')).toBeTruthy();
    expect(await screen.findByText('La respuesta es falso.')).toBeTruthy();
    const next = await screen.findByRole('button', { name: /continuar/i });
    await fireEvent.press(next);
    await fireEvent.press(next);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('50%')).toBeTruthy();
    expect(await screen.findByText('1 de 2 respuestas correctas')).toBeTruthy();
  });

  it('handles empty quiz safely and supports long question content', async () => {
    const onComplete = jest.fn();
    const view = await render(<StrictMode><QuizEngine questions={[]} onComplete={onComplete} /></StrictMode>);
    expect(await screen.findByText(/no hay preguntas/i)).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
    await view.unmount();
    await render(<QuizEngine questions={quizFixtures.long} />);
    expect(await screen.findByText(quizFixtures.long[0].text)).toBeTruthy();
    expect(await screen.findByText(quizFixtures.long[0].options[0].text)).toBeTruthy();
  });

  it('survives StrictMode without duplicate completion', async () => {
    const onComplete = jest.fn();
    await render(<StrictMode><QuizEngine questions={questions.slice(0, 1)} onComplete={onComplete} /></StrictMode>);
    await fireEvent.press(await screen.findByRole('radio', { name: 'Sí' }));
    await fireEvent.press(await screen.findByRole('button', { name: /comprobar respuesta/i }));
    await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('serializes batched duplicate events and rejects stale actions after advancing', async () => {
    const onAnswer = jest.fn();
    const onComplete = jest.fn();
    type HookProps = { answer: typeof onAnswer; complete: typeof onComplete };
    const { result, rerender } = await renderHook<ReturnType<typeof useQuiz>, HookProps>(
      ({ answer, complete }) => useQuiz(questions, answer, complete),
      { initialProps: { answer: onAnswer, complete: onComplete } },
    );
    const staleConfirm = result.current.confirm;
    await act(() => {
      result.current.select('a');
      result.current.confirm();
      result.current.confirm();
    });
    expect(result.current.state.phase).toBe('feedback');
    expect(result.current.state.answers).toHaveLength(1);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    const staleContinue = result.current.continue;
    await act(() => { staleContinue(); staleContinue(); });
    expect(result.current.state.index).toBe(1);
    expect(result.current.state.phase).toBe('answering');
    await act(() => { staleConfirm(); });
    expect(result.current.state.answers).toHaveLength(1);
    const latestAnswer = jest.fn();
    const latestComplete = jest.fn();
    await rerender({ answer: latestAnswer, complete: latestComplete });
    await act(() => { result.current.select('c'); result.current.confirm(); result.current.confirm(); });
    expect(result.current.state.answers).toHaveLength(2);
    expect(latestAnswer).toHaveBeenCalledTimes(1);
    await act(() => { staleContinue(); });
    expect(result.current.state.phase).toBe('feedback');
    const oldQuestionContinue = result.current.continue;
    await act(() => { oldQuestionContinue(); oldQuestionContinue(); });
    expect(result.current.state.phase).toBe('completed');
    expect(onComplete).not.toHaveBeenCalled();
    expect(latestComplete).toHaveBeenCalledTimes(1);
    expect(result.current.state.answers.map(({ isCorrect }) => isCorrect)).toEqual([true, false]);
  });

  it('keeps the initial question snapshot when parent passes a new array', async () => {
    const view = await render(<QuizEngine questions={questions} />);
    await view.rerender(<QuizEngine questions={[{ ...questions[0], text: 'No reemplazar el intento actual' }]} />);
    expect(await view.findByText(questions[0].text)).toBeTruthy();
    expect(view.queryByText('No reemplazar el intento actual')).toBeNull();
  });
});
