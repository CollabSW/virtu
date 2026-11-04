import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { StrictMode } from 'react';
import { confirmAnswer, continueQuiz, createQuizState, getQuizResult, QuizScreen, selectOption } from '@/shared/features/quiz/screens/QuizScreen';
import { ResultScreen } from '@/shared/features/quiz/screens/ResultScreen';
import { quizFixtures, exampleQuestions } from './fixtures';
import { describe, expect, it, jest } from '@jest/globals';

describe('QuizScreen', () => {
  it('runs a five-question attempt, hides the key before confirmation, and calls callbacks once', async () => {
    const onAnswer = jest.fn(); const onComplete = jest.fn();
    await render(<StrictMode><QuizScreen lessonId="lesson-1" questions={exampleQuestions} title="Cultura general · Pruebas" onAnswer={onAnswer} onComplete={onComplete} /></StrictMode>);
    expect(await screen.findByText('Cultura general · Pruebas')).toBeTruthy();
    expect(screen.queryByText(exampleQuestions[0].explanation)).toBeNull();
    for (let i = 0; i < 5; i++) {
      await fireEvent.press(await screen.findByRole('radio', { name: exampleQuestions[i].options.find((o) => o.id === exampleQuestions[i].correctOptionId)!.text }));
      await fireEvent.press(await screen.findByRole('button', { name: /comprobar/i }));
      expect(onAnswer).toHaveBeenCalledTimes(i + 1);
      await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ lessonId: 'lesson-1', totalQuestions: 5, score: 5, correctAnswers: 5, passed: true });
    expect(await screen.findByText('5 de 5')).toBeTruthy();
  });
  it('rejects invalid lesson and empty/single quizzes without completion', async () => {
    const done = jest.fn(); const empty = await render(<QuizScreen lessonId="" questions={[]} onComplete={done} />);
    expect(await screen.findByText(/no se pudo iniciar/i)).toBeTruthy(); expect(done).not.toHaveBeenCalled();
    await empty.unmount(); await render(<QuizScreen lessonId="lesson" questions={quizFixtures.single} onComplete={done} />);
    expect(await screen.findByText(/no se pudo iniciar/i)).toBeTruthy(); expect(done).not.toHaveBeenCalled();
  });
  it('keeps the mounted question snapshot', async () => {
    const view = await render(<QuizScreen lessonId="lesson" questions={exampleQuestions} />);
    await view.rerender(<QuizScreen lessonId="other" questions={exampleQuestions.map((q) => ({ ...q, text: 'Reemplazada' }))} />);
    expect(await screen.findByText(exampleQuestions[0].text)).toBeTruthy(); expect(screen.queryByText('Reemplazada')).toBeNull();
  });
  it('deduplicates same-turn confirms and continues; stale question handlers cannot act on the next question', async () => {
    const onAnswer = jest.fn();
    await render(<QuizScreen lessonId="lesson" questions={exampleQuestions} onAnswer={onAnswer} />);
    const q1Radio = await screen.findByRole('radio', { name: 'Marte' });
    await fireEvent.press(q1Radio);
    const oldConfirm = screen.getByRole('button', { name: /comprobar/i });
    await act(async () => { await fireEvent.press(oldConfirm); await fireEvent.press(oldConfirm); });
    expect(onAnswer).toHaveBeenCalledTimes(1);
    const oldContinue = screen.getByRole('button', { name: /continuar/i });
    await act(async () => { await fireEvent.press(oldContinue); await fireEvent.press(oldContinue); });
    expect(await screen.findByText('Pregunta 2 de 5')).toBeTruthy();
    await fireEvent.press(await screen.findByRole('radio', { name: '56' }));
    await fireEvent.press(oldConfirm);
    expect(onAnswer).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Respuesta correcta')).toBeNull();
  });
  it('uses latest callbacks after rerender and does not duplicate completion in StrictMode', async () => {
    const oldAnswer = jest.fn(); const latestAnswer = jest.fn(); const oldDone = jest.fn(); const latestDone = jest.fn();
    const view = await render(<StrictMode><QuizScreen lessonId="lesson" questions={exampleQuestions} onAnswer={oldAnswer} onComplete={oldDone} /></StrictMode>);
    await view.rerender(<StrictMode><QuizScreen lessonId="lesson" questions={exampleQuestions} onAnswer={latestAnswer} onComplete={latestDone} /></StrictMode>);
    for (const q of exampleQuestions) {
      await fireEvent.press(await screen.findByRole('radio', { name: q.options.find((o) => o.id === q.correctOptionId)!.text }));
      const confirm = await screen.findByRole('button', { name: /comprobar/i });
      await act(async () => { await fireEvent.press(confirm); await fireEvent.press(confirm); });
      await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    }
    expect(oldAnswer).not.toHaveBeenCalled(); expect(oldDone).not.toHaveBeenCalled();
    expect(latestAnswer).toHaveBeenCalledTimes(5); expect(latestDone).toHaveBeenCalledTimes(1);
  });
  it('renders and completes a long-content five-question attempt', async () => {
    const onComplete = jest.fn();
    await render(<QuizScreen lessonId="lesson" questions={quizFixtures.long} onComplete={onComplete} />);
    expect(await screen.findByText(quizFixtures.long[0].text)).toBeTruthy();
    for (const q of quizFixtures.long) {
      await fireEvent.press(await screen.findByRole('radio', { name: q.options[0].text }));
      await fireEvent.press(await screen.findByRole('button', { name: /comprobar/i }));
      expect(await screen.findByText(q.explanation)).toBeTruthy();
      await fireEvent.press(await screen.findByRole('button', { name: /continuar/i }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
  it('reviews missed answers with their correct solution', async () => {
    let state = createQuizState('lesson', exampleQuestions);
    for (const q of exampleQuestions) { state = selectOption(state, q.correctOptionId === q.options[0].id ? q.options[1].id : q.options[0].id); state = confirmAnswer(state); state = continueQuiz(state); }
    const result = getQuizResult(state);
    await render(<ResultScreen questions={exampleQuestions} result={result} />);
    expect(await screen.findByText('Sigue practicando')).toBeTruthy(); expect(await screen.findByText('Respuesta correcta: Marte')).toBeTruthy(); expect(await screen.findByText('0 de 5')).toBeTruthy();
  });
});
