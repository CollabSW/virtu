import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { confirmAnswer, continueQuiz, createQuizState, getQuizResult, selectOption } from './quiz-state';
import type { QuizState } from './quiz-state';
import type { Question, QuizAnswer, QuizResult } from './types';

export function useQuiz(questions: readonly Question[], onAnswer?: (answer: QuizAnswer) => void, onComplete?: (result: QuizResult) => void) {
  const [state, setState] = useState(() => createQuizState(questions));
  const current = useRef(state);
  const callbacks = useRef({ onAnswer, onComplete });
  useLayoutEffect(() => { callbacks.current = { onAnswer, onComplete }; }, [onAnswer, onComplete]);
  const emptyNotified = useRef(false);
  useEffect(() => {
    if (state.phase === 'completed' && state.questions.length === 0 && !emptyNotified.current) {
      emptyNotified.current = true;
      callbacks.current.onComplete?.(getQuizResult(state));
    }
  }, [state]);
  const transition = useCallback((next: QuizState) => {
    if (next === current.current) return false;
    const previous = current.current;
    current.current = next;
    setState(next);
    if (previous.phase === 'answering' && next.phase === 'feedback') {
      const answer = next.answers[next.answers.length - 1];
      if (answer) callbacks.current.onAnswer?.(answer);
    }
    if (previous.phase !== 'completed' && next.phase === 'completed') callbacks.current.onComplete?.(getQuizResult(next));
    return true;
  }, []);
  return {
    state,
    select: (optionId: string) => state.phase === 'answering' && current.current.index === state.index && transition(selectOption(current.current, optionId)),
    confirm: () => state.phase === 'answering' && current.current.index === state.index && transition(confirmAnswer(current.current)),
    continue: () => state.phase === 'feedback' && current.current.index === state.index && transition(continueQuiz(current.current)),
  };
}
