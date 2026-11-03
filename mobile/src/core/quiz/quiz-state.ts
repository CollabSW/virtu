import type { Question, QuizAnswer, QuizResult } from './types';

export type QuizPhase = 'answering' | 'feedback' | 'completed';

export type QuizState = {
  readonly questions: readonly Question[];
  readonly index: number;
  readonly selectedOptionId: string | null;
  readonly answers: readonly QuizAnswer[];
  readonly phase: QuizPhase;
};

export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (
    !Number.isInteger(correctAnswers) ||
    !Number.isInteger(totalQuestions) ||
    totalQuestions < 0 ||
    correctAnswers < 0 ||
    correctAnswers > totalQuestions ||
    (totalQuestions === 0 && correctAnswers !== 0)
  ) {
    throw new RangeError('correctAnswers and totalQuestions must be valid non-negative counts');
  }

  return totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
}

function snapshotQuestions(questions: readonly Question[]): readonly Question[] {
  const questionIds = new Set<string>();

  return questions.map((question, questionIndex) => {
    const questionLabel = `Question ${questionIndex + 1}`;
    if (!question.id.trim()) throw new Error(`${questionLabel} id must not be empty`);
    if (questionIds.has(question.id)) throw new Error(`Duplicate question id: ${question.id}`);
    questionIds.add(question.id);
    if (!question.text.trim()) throw new Error(`${questionLabel} text must not be empty`);
    if (!question.explanation.trim()) throw new Error(`${questionLabel} explanation must not be empty`);
    if (question.options.length < 2) throw new Error(`${questionLabel} must have at least two options`);

    const optionIds = new Set<string>();
    const options = question.options.map((option, optionIndex) => {
      const optionLabel = `${questionLabel}, option ${optionIndex + 1}`;
      if (!option.id.trim()) throw new Error(`${optionLabel} id must not be empty`);
      if (optionIds.has(option.id)) throw new Error(`Duplicate option id in ${questionLabel}: ${option.id}`);
      optionIds.add(option.id);
      if (!option.text.trim()) throw new Error(`${optionLabel} text must not be empty`);
      return Object.freeze({ id: option.id, text: option.text });
    });

    if (!optionIds.has(question.correctOptionId)) {
      throw new Error(`${questionLabel} correctOptionId must match an option id`);
    }

    return Object.freeze({
      id: question.id,
      text: question.text,
      options: Object.freeze(options),
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
    });
  });
}

export function createQuizState(questions: readonly Question[]): QuizState {
  const snapshot = Object.freeze(snapshotQuestions(questions));
  return Object.freeze({
    questions: snapshot,
    index: 0,
    selectedOptionId: null,
    answers: Object.freeze([]),
    phase: snapshot.length === 0 ? 'completed' : 'answering',
  });
}

export function selectOption(state: QuizState, optionId: string): QuizState {
  if (state.phase !== 'answering') return state;
  const question = state.questions[state.index];
  if (!question?.options.some((option) => option.id === optionId)) return state;
  if (state.selectedOptionId === optionId) return state;

  return Object.freeze({ ...state, selectedOptionId: optionId });
}

export function confirmAnswer(state: QuizState): QuizState {
  if (state.phase !== 'answering' || state.selectedOptionId === null) return state;
  const question = state.questions[state.index];
  if (!question) return state;

  const answer = Object.freeze({
    questionId: question.id,
    optionId: state.selectedOptionId,
    isCorrect: state.selectedOptionId === question.correctOptionId,
  });
  return Object.freeze({
    ...state,
    answers: Object.freeze([...state.answers, answer]),
    phase: 'feedback',
  });
}

export function continueQuiz(state: QuizState): QuizState {
  if (state.phase !== 'feedback') return state;
  const nextIndex = state.index + 1;
  return Object.freeze({
    ...state,
    index: nextIndex,
    selectedOptionId: null,
    phase: nextIndex >= state.questions.length ? 'completed' : 'answering',
  });
}

export function getQuizResult(state: QuizState): QuizResult {
  const answers = state.answers;
  const correctAnswers = answers.reduce((count, answer) => count + Number(answer.isCorrect), 0);
  return {
    totalQuestions: state.questions.length,
    correctAnswers,
    score: calculateScore(correctAnswers, state.questions.length),
    answers,
  };
}
