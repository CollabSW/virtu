import { describe, expect, it } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  calculateScore, confirmAnswer, continueQuiz, createQuizState, getQuizResult, selectOption,
} from '../../src/shared/features/quiz/screens/QuizScreen';
import { filterGlossaryEntries, getGlossaryEntries } from '../../src/shared/features/glossary/glossaryService';

const questions = Array.from({ length: 5 }, (_, i) => ({
  id: `q${i + 1}`, text: `Question ${i + 1}`, explanation: `Explanation ${i + 1}`, correctOptionId: 'a',
  options: [
    { id: 'a', text: `Correct ${i}` }, { id: 'b', text: `Wrong ${i}` },
    { id: 'c', text: `Other ${i}` }, { id: 'd', text: `Last ${i}` },
  ],
}));

it('keeps the local controller in QuizScreen, not quizService', () => {
  const source = readFileSync(resolve(__dirname, '../../src/shared/features/quiz/screens/QuizScreen.tsx'), 'utf8');
  expect(source).not.toMatch(/from\s+['"].*quizService/);
  expect([createQuizState, selectOption, confirmAnswer, continueQuiz, getQuizResult, calculateScore].every((fn) => typeof fn === 'function')).toBe(true);
});

describe('quiz service', () => {
  it('requires a lesson and exactly five questions with four unique options each', () => {
    expect(() => createQuizState(' ', questions)).toThrow(/lessonId/i);
    for (const count of [0, 1, 4]) expect(() => createQuizState('lesson', questions.slice(0, count))).toThrow(RangeError);
    expect(() => createQuizState('lesson', [...questions, questions[0]])).toThrow(RangeError);
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : { ...q, options: q.options.slice(0, 3) }))).toThrow(/four/i);
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : { ...q, options: [...q.options, { id: 'e', text: 'Extra' }] }))).toThrow(/four/i);
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : { ...q, options: q.options.map((o, j) => j ? o : { ...o, text: q.options[1].text }) }))).toThrow(/text/i);
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : { ...q, options: q.options.map((o, j) => j ? o : { ...o, id: q.options[1].id }) }))).toThrow(/id/i);
  });

  it('validates untyped runtime inputs and snapshots question and option arrays', () => {
    expect(() => createQuizState(null as never, questions)).toThrow(/lessonId/i);
    expect(() => createQuizState('lesson', null as never)).toThrow(/five/i);
    const input = questions.map((q) => ({ ...q, options: q.options.map((option) => ({ ...option })) }));
    const state = createQuizState('lesson-1', input);
    input[0].text = 'mutated'; input[0].options[0].text = 'mutated';
    expect(state.questions[0].text).toBe('Question 1');
    expect(state.questions[0].options[0].text).toBe('Correct 0');
    expect(Object.isFrozen(state.questions[0].options)).toBe(true);
  });

  it('rejects malformed question and option data, including legacy validation cases', () => {
    const invalidQuizzes = [
      questions.map((q, i) => i ? q : { ...q, id: ' ' }),
      questions.map((q, i) => i ? q : { ...q, text: '' }),
      questions.map((q, i) => i ? q : { ...q, explanation: '  ' }),
      questions.map((q, i) => i ? q : { ...q, correctOptionId: 'missing' }),
      questions.map((q, i) => i ? q : { ...q, options: null }),
      questions.map((q, i) => i ? q : { ...q, options: {} }),
      questions.map((q, i) => i ? q : { ...q, options: q.options.map((option, j) => j ? option : null) }),
      questions.map((q, i) => i ? q : { ...q, options: q.options.map((option, j) => j ? option : { ...option, id: '' }) }),
      questions.map((q, i) => i ? q : { ...q, options: q.options.map((option, j) => j ? option : { ...option, text: '  ' }) }),
    ];
    invalidQuizzes.forEach((quiz) => expect(() => createQuizState('lesson', quiz as never)).toThrow());
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : null) as never)).toThrow(/object/i);
    expect(() => createQuizState('lesson', questions.map((q, i) => i ? q : { ...q, id: questions[1].id }))).toThrow(/duplicate question id/i);
  });

  it('rejects a sparse question array', () => {
    expect(() => createQuizState('lesson', Array(5) as never)).toThrow();
  });

  it('rejects a sparse options array', () => {
    const sparseOptions = Array(4);
    sparseOptions[0] = questions[0].options[0];
    sparseOptions[1] = questions[0].options[1];
    sparseOptions[2] = questions[0].options[2];
    const malformed = questions.map((q, i) => i ? q : { ...q, options: sparseOptions });
    expect(() => createQuizState('lesson', malformed as never)).toThrow();
  });

  it('keeps phase guards, returns immutable transitions, and only returns a completed 5-answer result', () => {
    let state = createQuizState('lesson-1', questions);
    expect(() => getQuizResult(state)).toThrow(/completed|five/i);
    expect(confirmAnswer(state)).toBe(state);
    expect(continueQuiz(state)).toBe(state);
    expect(Object.isFrozen(state.answers)).toBe(true);
    const firstFeedback = confirmAnswer(selectOption(state, 'a'));
    expect(selectOption(firstFeedback, 'b')).toBe(firstFeedback);
    expect(Object.isFrozen(firstFeedback.answers)).toBe(true);
    for (let i = 0; i < 5; i += 1) {
      const selected = selectOption(state, i === 0 ? 'a' : 'b');
      expect(selected).not.toBe(state);
      const feedback = confirmAnswer(selected);
      expect(confirmAnswer(feedback)).toBe(feedback);
      state = continueQuiz(feedback);
    }
    expect(state.phase).toBe('completed');
    expect(() => getQuizResult({ ...state, answers: state.answers.slice(0, 4) })).toThrow(/five/i);
    expect(getQuizResult(state)).toEqual({
      lessonId: 'lesson-1', totalQuestions: 5, correctAnswers: 1, score: 1, passed: false,
      answers: expect.arrayContaining([expect.objectContaining({ isCorrect: true })]),
    });
    expect(continueQuiz(state)).toBe(state);
    const passedState = createQuizState('lesson-2', questions);
    let passed = passedState;
    for (let i = 0; i < 5; i += 1) passed = continueQuiz(confirmAnswer(selectOption(passed, i < 4 ? 'a' : 'b')));
    expect(getQuizResult(passed).passed).toBe(true);
    expect(getQuizResult(passed).score).toBe(4);
  });

  it.each([
    [0, false], [3, false], [4, true], [5, true],
  ])('reports passed=%s for a completed attempt with that many correct answers', (correctCount, passed) => {
    let state = createQuizState('lesson-threshold', questions);
    for (let i = 0; i < 5; i += 1) {
      state = continueQuiz(confirmAnswer(selectOption(state, i < correctCount ? 'a' : 'b')));
    }
    expect(getQuizResult(state).correctAnswers).toBe(correctCount);
    expect(getQuizResult(state).passed).toBe(passed);
  });

  it('returns correct answers out of five and rejects all invalid counts', () => {
    expect([0, 3, 4, 5].map((count) => calculateScore(count, 5))).toEqual([0, 3, 4, 5]);
    for (const [correct, total] of [[-1, 5], [6, 5], [1.5, 5], [1, 4], [1, 6], [0, 0], [NaN, 5], [1, Infinity]]) {
      expect(() => calculateScore(correct, total)).toThrow(RangeError);
    }
  });
});

describe('glossary service', () => {
  const entries = [
    { id: 'h', subject: 'historia', title: 'Imperio', date: 'Roma antigua' },
    { id: 'b', subject: 'biologia', title: 'Célula', concept: 'Membrana celular' },
    { id: 'q', subject: 'quimica', title: 'Agua', symbol: 'H₂O', atomicNumber: 8 },
    { id: 'i', subject: 'ingles', title: 'Hello', vocabulary: 'greeting', audioUrl: 'hello.mp3' },
    { id: 'c', subject: 'calculo', title: 'Derivada', example: 'Pendiente de la curva' },
    { id: 'f', subject: 'fisica', title: 'Fuerza', properties: ['masa', 'aceleración'] },
  ] as const;

  it('supports six subjects, optional heterogeneous text fields, and case-insensitive search', () => {
    expect(getGlossaryEntries(entries)).toHaveLength(6);
    for (const subject of ['historia', 'biologia', 'quimica', 'ingles', 'calculo', 'fisica'] as const) {
      expect(getGlossaryEntries(entries, subject)).toHaveLength(1);
    }
    expect(filterGlossaryEntries(entries, 'CELULAR')[0].id).toBe('b');
    expect(filterGlossaryEntries(entries, 'aceleración')[0].id).toBe('f');
    expect(filterGlossaryEntries(entries, 'hello.mp3')[0].id).toBe('i');
    expect(filterGlossaryEntries(entries, '  ', 'quimica')).toEqual([entries[2]]);
    expect(filterGlossaryEntries(entries, 'no existe')).toEqual([]);
  });
});
