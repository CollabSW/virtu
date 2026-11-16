
import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react-native';

import { StrictMode } from 'react';

import {
  confirmAnswer,
  continueQuiz,
  createQuizState,
  getQuizResult,
  QuizScreen,
  selectOption,
} from '@/shared/features/quiz/screens/QuizScreen';

import { ResultScreen } from '@/shared/features/quiz/screens/ResultScreen';

import {
  quizFixtures,
  exampleQuestions,
} from './fixtures';

import { describe, expect, it, jest } from '@jest/globals';

// ======================================================
// PRUEBAS ORIGINALES DEL QUIZENGINE
// ======================================================

describe('QuizScreen', () => {
  it(
    'runs a five-question attempt, hides the key before confirmation, and calls callbacks once',
    async () => {
      const onAnswer = jest.fn();
      const onComplete = jest.fn();

      await render(
        <StrictMode>
          <QuizScreen
            lessonId="lesson-1"
            questions={exampleQuestions}
            title="Cultura general · Pruebas"
            onAnswer={onAnswer}
            onComplete={onComplete}
          />
        </StrictMode>
      );

      expect(
        await screen.findByText('Cultura general · Pruebas')
      ).toBeTruthy();

      expect(
        screen.queryByText(exampleQuestions[0].explanation)
      ).toBeNull();

      for (let i = 0; i < 5; i++) {
        const question = exampleQuestions[i];

        const correctOption = question.options.find(
          (option) => option.id === question.correctOptionId
        )!;

        await fireEvent.press(
          await screen.findByRole('radio', {
            name: correctOption.text,
          })
        );

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /comprobar/i,
          })
        );

        expect(onAnswer).toHaveBeenCalledTimes(i + 1);

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /continuar/i,
          })
        );
      }

      expect(onComplete).toHaveBeenCalledTimes(1);

      expect(onComplete.mock.calls[0][0]).toMatchObject({
        lessonId: 'lesson-1',
        totalQuestions: 5,
        score: 5,
        correctAnswers: 5,
        passed: true,
      });

      expect(await screen.findByText('5 de 5')).toBeTruthy();
    },
    15000
  );

  it(
    'rejects invalid lesson and empty/single quizzes without completion',
    async () => {
      const done = jest.fn();

      const empty = await render(
        <QuizScreen
          lessonId=""
          questions={[]}
          onComplete={done}
        />
      );

      expect(
        await screen.findByText(/no se pudo iniciar/i)
      ).toBeTruthy();

      expect(done).not.toHaveBeenCalled();

      await empty.unmount();

      await render(
        <QuizScreen
          lessonId="lesson"
          questions={quizFixtures.single}
          onComplete={done}
        />
      );

      expect(
        await screen.findByText(/no se pudo iniciar/i)
      ).toBeTruthy();

      expect(done).not.toHaveBeenCalled();
    }
  );

  it('keeps the mounted question snapshot', async () => {
    const view = await render(
      <QuizScreen
        lessonId="lesson"
        questions={exampleQuestions}
      />
    );

    await view.rerender(
      <QuizScreen
        lessonId="other"
        questions={exampleQuestions.map((question) => ({
          ...question,
          text: 'Reemplazada',
        }))}
      />
    );

    expect(
      await screen.findByText(exampleQuestions[0].text)
    ).toBeTruthy();

    expect(screen.queryByText('Reemplazada')).toBeNull();
  });

  it(
    'deduplicates same-turn confirms and continues; stale question handlers cannot act on the next question',
    async () => {
      const onAnswer = jest.fn();

      await render(
        <QuizScreen
          lessonId="lesson"
          questions={exampleQuestions}
          onAnswer={onAnswer}
        />
      );

      const q1Radio = await screen.findByRole('radio', {
        name: 'Marte',
      });

      await fireEvent.press(q1Radio);

      const oldConfirm = screen.getByRole('button', {
        name: /comprobar/i,
      });

      await act(async () => {
        await fireEvent.press(oldConfirm);
        await fireEvent.press(oldConfirm);
      });

      expect(onAnswer).toHaveBeenCalledTimes(1);

      const oldContinue = screen.getByRole('button', {
        name: /continuar/i,
      });

      await act(async () => {
        await fireEvent.press(oldContinue);
        await fireEvent.press(oldContinue);
      });

      expect(
        await screen.findByText('Pregunta 2 de 5')
      ).toBeTruthy();

      await fireEvent.press(
        await screen.findByRole('radio', {
          name: '56',
        })
      );

      await fireEvent.press(oldConfirm);

      expect(onAnswer).toHaveBeenCalledTimes(1);

      expect(
        screen.queryByText('Respuesta correcta')
      ).toBeNull();
    }
  );

  it(
    'uses latest callbacks after rerender and does not duplicate completion in StrictMode',
    async () => {
      const oldAnswer = jest.fn();
      const latestAnswer = jest.fn();
      const oldDone = jest.fn();
      const latestDone = jest.fn();

      const view = await render(
        <StrictMode>
          <QuizScreen
            lessonId="lesson"
            questions={exampleQuestions}
            onAnswer={oldAnswer}
            onComplete={oldDone}
          />
        </StrictMode>
      );

      await view.rerender(
        <StrictMode>
          <QuizScreen
            lessonId="lesson"
            questions={exampleQuestions}
            onAnswer={latestAnswer}
            onComplete={latestDone}
          />
        </StrictMode>
      );

      for (const question of exampleQuestions) {
        const correctOption = question.options.find(
          (option) => option.id === question.correctOptionId
        )!;

        await fireEvent.press(
          await screen.findByRole('radio', {
            name: correctOption.text,
          })
        );

        const confirm = await screen.findByRole('button', {
          name: /comprobar/i,
        });

        await act(async () => {
          await fireEvent.press(confirm);
          await fireEvent.press(confirm);
        });

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /continuar/i,
          })
        );
      }

      expect(oldAnswer).not.toHaveBeenCalled();
      expect(oldDone).not.toHaveBeenCalled();

      expect(latestAnswer).toHaveBeenCalledTimes(5);
      expect(latestDone).toHaveBeenCalledTimes(1);
    },
    15000
  );

  it(
    'renders and completes a long-content five-question attempt',
    async () => {
      const onComplete = jest.fn();

      await render(
        <QuizScreen
          lessonId="lesson"
          questions={quizFixtures.long}
          onComplete={onComplete}
        />
      );

      expect(
        await screen.findByText(quizFixtures.long[0].text)
      ).toBeTruthy();

      for (const question of quizFixtures.long) {
        await fireEvent.press(
          await screen.findByRole('radio', {
            name: question.options[0].text,
          })
        );

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /comprobar/i,
          })
        );

        expect(
          await screen.findByText(question.explanation)
        ).toBeTruthy();

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /continuar/i,
          })
        );
      }

      expect(onComplete).toHaveBeenCalledTimes(1);
    },
    15000
  );

  it(
    'reviews missed answers with their correct solution',
    async () => {
      let state = createQuizState(
        'lesson',
        exampleQuestions
      );

      for (const question of exampleQuestions) {
        const wrongOption =
          question.correctOptionId === question.options[0].id
            ? question.options[1].id
            : question.options[0].id;

        state = selectOption(state, wrongOption);
        state = confirmAnswer(state);
        state = continueQuiz(state);
      }

      const result = getQuizResult(state);

      await render(
        <ResultScreen
          questions={exampleQuestions}
          result={result}
        />
      );

      expect(
        await screen.findByText('Sigue practicando')
      ).toBeTruthy();

      expect(
        await screen.findByText('Respuesta correcta: Marte')
      ).toBeTruthy();

      expect(await screen.findByText('0 de 5')).toBeTruthy();
    }
  );
});

// ======================================================
// C2-23: CONECTAR FINAL DEL QUIZ CON RESULTSCREEN
// ======================================================

describe('Jhaelin: C2-23 resultado final', () => {
  it(
    'finaliza una sola vez y muestra el resultado aprobado de 4/5',
    async () => {
      const onComplete = jest.fn();
      const onAnswer = jest.fn();

      await render(
        <QuizScreen
          lessonId="lesson-jhaelin"
          questions={exampleQuestions}
          onComplete={onComplete}
          onAnswer={onAnswer}
        />
      );

      for (let i = 0; i < exampleQuestions.length; i++) {
        const question = exampleQuestions[i];

        // Las primeras cuatro respuestas son correctas.
        // La última respuesta es incorrecta.
        const option =
          i < 4
            ? question.options.find(
                (candidate) =>
                  candidate.id === question.correctOptionId
              )!
            : question.options.find(
                (candidate) =>
                  candidate.id !== question.correctOptionId
              )!;

        await fireEvent.press(
          await screen.findByRole('radio', {
            name: option.text,
          })
        );

        const confirm = screen.getByRole('button', {
          name: /comprobar/i,
        });

        // Simular doble confirmación.
        await act(async () => {
          await fireEvent.press(confirm);
          await fireEvent.press(confirm);
        });

        // Cada pregunta solo registra una respuesta.
        expect(onAnswer).toHaveBeenCalledTimes(i + 1);

        const next = screen.getByRole('button', {
          name: /continuar/i,
        });

        // Simular doble pulsación al continuar.
        await act(async () => {
          await fireEvent.press(next);
          await fireEvent.press(next);
        });
      }

      // Solo se finaliza una vez.
      expect(onComplete).toHaveBeenCalledTimes(1);

      // Verificar los datos del resultado.
      expect(onComplete.mock.calls[0][0]).toMatchObject({
        lessonId: 'lesson-jhaelin',
        totalQuestions: 5,
        correctAnswers: 4,
        score: 4,
        passed: true,
      });

      // Comprobar que aparece ResultScreen.
      expect(
        await screen.findByText('4 de 5')
      ).toBeTruthy();

      expect(
        await screen.findByText('¡Cuestionario aprobado!')
      ).toBeTruthy();
    },
    15000
  );
});

// ======================================================
// C2-27: PROBAR FLUJO FUNCIONAL DEL QUIZENGINE
// ======================================================

describe('Jhaelin: C2-27 flujo funcional', () => {
  it(
    'rechaza un cuestionario inválido de cuatro preguntas sin calificar',
    async () => {
      const onComplete = jest.fn();
      const onAnswer = jest.fn();

      await render(
        <QuizScreen
          lessonId="lesson-invalid"
          questions={exampleQuestions.slice(0, 4)}
          onComplete={onComplete}
          onAnswer={onAnswer}
        />
      );

      expect(
        await screen.findByText(
          /no se pudo iniciar el cuestionario/i
        )
      ).toBeTruthy();

      // No debe registrar respuestas.
      expect(onAnswer).not.toHaveBeenCalled();

      // No debe generar ningún resultado.
      expect(onComplete).not.toHaveBeenCalled();

      // No debe mostrar una calificación.
      expect(
        screen.queryByText('4 de 5')
      ).toBeNull();
    }
  );

  it(
    'completa cinco preguntas, presenta feedback y muestra un resultado reprobado',
    async () => {
      const onAnswer = jest.fn();
      const onComplete = jest.fn();

      await render(
        <QuizScreen
          lessonId="lesson-failed"
          questions={exampleQuestions}
          onAnswer={onAnswer}
          onComplete={onComplete}
        />
      );

      for (let i = 0; i < exampleQuestions.length; i++) {
        const question = exampleQuestions[i];

        // Solo las primeras tres respuestas son correctas.
        const option =
          i < 3
            ? question.options.find(
                (candidate) =>
                  candidate.id === question.correctOptionId
              )!
            : question.options.find(
                (candidate) =>
                  candidate.id !== question.correctOptionId
              )!;

        await fireEvent.press(
          await screen.findByRole('radio', {
            name: option.text,
          })
        );

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /comprobar/i,
          })
        );

        // Feedback inmediato después de confirmar.
        expect(
          await screen.findByText(question.explanation)
        ).toBeTruthy();

        expect(onAnswer).toHaveBeenCalledTimes(i + 1);

        await fireEvent.press(
          await screen.findByRole('button', {
            name: /continuar/i,
          })
        );
      }

      expect(onComplete).toHaveBeenCalledTimes(1);

      expect(onComplete.mock.calls[0][0]).toMatchObject({
        lessonId: 'lesson-failed',
        totalQuestions: 5,
        correctAnswers: 3,
        score: 3,
        passed: false,
      });

      expect(
        await screen.findByText('3 de 5')
      ).toBeTruthy();

      expect(
        await screen.findByText('Sigue practicando')
      ).toBeTruthy();
    },
    15000
  );
});
