import { describe, expect, it } from '@jest/globals';
import {
  calculateScore,
  confirmAnswer,
  continueQuiz,
  createQuizState,
  getQuizResult,
  selectOption,
} from '@/core/quiz/quiz-state';
import type { Question } from '@/core/quiz/types';
import { exampleQuestions, quizAnswerFixtures, quizFixtures } from './fixtures';

it('provides genuinely long answer options in the long fixture', () => {
  expect(quizFixtures.long[0].options.every((option) => option.text.length >= 200)).toBe(true);
});

const questions: readonly Question[] = [
  {
    id: 'q1',
    text: 'A long question '.repeat(100),
    options: [
      { id: 'a', text: 'Correct' },
      { id: 'b', text: 'Incorrect' },
    ],
    correctOptionId: 'a',
    explanation: 'Because A is correct.',
  },
  {
    id: 'q2',
    text: 'Second question?',
    options: [
      { id: 'a', text: 'Correct' },
      { id: 'b', text: 'Incorrect' },
    ],
    correctOptionId: 'b',
    explanation: 'Because B is correct.',
  },
];

describe('calculateScore', () => {
  it('returns bounded integer percentages and defines the empty score as zero', () => {
    expect(calculateScore(0, 4)).toBe(0);
    expect(calculateScore(1, 4)).toBe(25);
    expect(calculateScore(2, 3)).toBe(67);
    expect(calculateScore(4, 4)).toBe(100);
    expect(calculateScore(0, 0)).toBe(0);
  });

  it('rejects invalid counts instead of clamping them', () => {
    for (const [correct, total] of [
      [-1, 2], [1, -1], [3, 2], [0.5, 2], [1, 0], [Number.NaN, 2], [2, Number.NaN],
      [Number.POSITIVE_INFINITY, 3], [1, Number.POSITIVE_INFINITY], [Number.NEGATIVE_INFINITY, 3],
    ]) {
      expect(() => calculateScore(correct, total)).toThrow(RangeError);
    }
  });

  it('accepts every valid count pair from zero through thirty', () => {
    for (let total = 0; total <= 30; total += 1) {
      for (let correct = 0; correct <= total; correct += 1) {
        const score = calculateScore(correct, total);
        expect(Number.isInteger(score)).toBe(true);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });
});

describe('quiz fixtures end-to-end', () => {
  const cases: [string, readonly Question[]][] = [
    ['empty', quizFixtures.empty],
    ['single', quizFixtures.single],
    ['multiple', quizFixtures.multiple],
    ['long', quizFixtures.long],
  ];

  it.each(cases)('%s reaches 100% with correct answers', (_name, quiz) => {
    let state = createQuizState(quiz);
    quiz.forEach((question, index) => {
      const selection = quiz === quizFixtures.multiple
        ? quizAnswerFixtures.correctOptionIds[index]
        : question.correctOptionId;
      state = selectOption(state, selection);
      expect(state.index).toBeLessThan(quiz.length);
      expect(getQuizResult(state).correctAnswers).toBe(index);
      state = confirmAnswer(state);
      expect(state.phase).toBe('feedback');
      state = continueQuiz(state);
      expect(state.index).toBeLessThanOrEqual(quiz.length);
    });
    expect(state.phase).toBe('completed');
    expect(getQuizResult(state).score).toBe(quiz.length ? 100 : 0);
  });

  it.each(cases)('%s reaches 0% with incorrect answers (or empty)', (_name, quiz) => {
    let state = createQuizState(quiz);
    quiz.forEach((question, index) => {
      const selection = quiz === quizFixtures.multiple
        ? quizAnswerFixtures.incorrectOptionIds[index]
        : question.options.find((option) => option.id !== question.correctOptionId)!.id;
      state = selectOption(state, selection);
      expect(state.index).toBeLessThan(quiz.length);
      state = confirmAnswer(state);
      expect(getQuizResult(state).answers).toHaveLength(index + 1);
      state = continueQuiz(state);
      expect(state.index).toBeLessThanOrEqual(quiz.length);
    });
    expect(state.phase).toBe('completed');
    expect(getQuizResult(state).score).toBe(0);
  });

  it('uses explicit correct and incorrect answer fixtures for every example question', () => {
    expect(quizAnswerFixtures.correctOptionIds).toEqual(exampleQuestions.map((question) => question.correctOptionId));
    expect(quizAnswerFixtures.incorrectOptionIds).toHaveLength(exampleQuestions.length);
    expect(quizAnswerFixtures.incorrectOptionIds.every((id, index) =>
      id !== exampleQuestions[index].correctOptionId,
    )).toBe(true);
  });
});

describe('quiz state transitions', () => {
  it('snapshots inputs and produces a partial result once per confirmed question', () => {
    const input = questions.map((question) => ({
      ...question,
      options: question.options.map((option) => ({ ...option })),
    }));
    let state = createQuizState(input);
    input[0].options[0].text = 'mutated';
    input[0].text = 'also mutated';
    expect(state.questions[0].options[0].text).toBe('Correct');
    expect(state.questions[0].text).toBe(questions[0].text);

    state = selectOption(state, 'a');
    const feedback = confirmAnswer(state);
    expect(feedback).not.toBe(state);
    expect(confirmAnswer(feedback)).toBe(feedback);
    expect(selectOption(feedback, 'b')).toBe(feedback);

    const second = continueQuiz(feedback);
    expect(second).not.toBe(feedback);
    const secondFeedback = confirmAnswer(selectOption(second, 'a'));
    const completed = continueQuiz(secondFeedback);
    expect(completed.phase).toBe('completed');
    expect(continueQuiz(completed)).toBe(completed);
    expect(getQuizResult(completed)).toEqual({
      totalQuestions: 2,
      correctAnswers: 1,
      score: 50,
      answers: [
        { questionId: 'q1', optionId: 'a', isCorrect: true },
        { questionId: 'q2', optionId: 'a', isCorrect: false },
      ],
    });
    expect(getQuizResult(completed).score).toBe(50);
  });

  it('leaves state unchanged for invalid or repeated transitions', () => {
    const initial = createQuizState(questions);
    expect(confirmAnswer(initial)).toBe(initial);
    expect(continueQuiz(initial)).toBe(initial);
    expect(selectOption(initial, 'missing')).toBe(initial);
    const completed = createQuizState([]);
    expect(selectOption(completed, 'any')).toBe(completed);
    expect(confirmAnswer(completed)).toBe(completed);

    const selected = selectOption(initial, 'a');
    expect(selectOption(selected, 'a')).toBe(selected);
    const feedback = confirmAnswer(selected);
    expect(confirmAnswer(feedback)).toBe(feedback);
    expect(continueQuiz(feedback).index).toBe(1);
  });

  it('completes an empty quiz immediately with a zero result', () => {
    const empty = createQuizState([]);
    expect(empty.phase).toBe('completed');
    expect(getQuizResult(empty)).toEqual({
      totalQuestions: 0,
      correctAnswers: 0,
      score: 0,
      answers: [],
    });
    expect(continueQuiz(empty)).toBe(empty);
  });

  it('rejects malformed question identifiers, text, options, and answer keys', () => {
    const invalid: Question[][] = [
      [{ ...questions[0], id: ' ' }],
      [questions[0], { ...questions[1], id: 'q1' }],
      [{ ...questions[0], text: '  ' }],
      [{ ...questions[0], options: [{ id: 'a', text: 'A' }] }],
      [{ ...questions[0], correctOptionId: 'missing' }],
      [{ ...questions[0], options: [{ id: ' ', text: 'A' }, questions[0].options[1]] }],
      [{ ...questions[0], options: [questions[0].options[0], { ...questions[0].options[1], id: 'a' }] }],
      [{ ...questions[0], options: [{ id: 'a', text: ' ' }, questions[0].options[1]] }],
      [{ ...questions[0], explanation: ' ' }],
    ];

    for (const quiz of invalid) expect(() => createQuizState(quiz)).toThrow(/question|option/i);
  });
});
