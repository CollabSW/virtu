import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { FeedbackModal } from '../components/FeedbackModal';
import { QuestionCard } from '../components/QuestionCard';
import { ResultScreen } from './ResultScreen';

export type Option = { readonly id: string; readonly text: string };
export type Question = {
  readonly id: string;
  readonly text: string;
  readonly options: readonly Option[];
  readonly correctOptionId: string;
  readonly explanation: string;
};
export type QuizAnswer = {
  readonly questionId: string;
  readonly optionId: string;
  readonly isCorrect: boolean;
};
export type QuizResult = {
  readonly lessonId: string;
  readonly totalQuestions: 5;
  readonly correctAnswers: number;
  readonly score: number;
  readonly passed: boolean;
  readonly answers: readonly QuizAnswer[];
};
export type QuizPhase = 'answering' | 'feedback' | 'completed';
export type QuizState = {
  readonly lessonId: string;
  readonly questions: readonly Question[];
  readonly index: number;
  readonly selectedOptionId: string | null;
  readonly answers: readonly QuizAnswer[];
  readonly phase: QuizPhase;
};

function nonemptyString(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${label} must be a non-empty string`);
  return value;
}

export function createQuizState(lessonId: string, questions: readonly Question[]): QuizState {
  nonemptyString(lessonId, 'lessonId');
  if (!Array.isArray(questions) || questions.length !== 5) throw new RangeError('Quiz must contain exactly five questions');
  const questionIds = new Set<string>();
  const snapshot = Array.from(questions as readonly unknown[], (raw, i): Question => {
    const label = `Question ${i + 1}`;
    if (!raw || typeof raw !== 'object') throw new TypeError(`${label} must be an object`);
    const q = raw as Record<string, unknown>;
    const id = nonemptyString(q.id, `${label} id`);
    if (questionIds.has(id)) throw new Error(`Duplicate question id: ${id}`);
    questionIds.add(id);
    const text = nonemptyString(q.text, `${label} text`);
    const explanation = nonemptyString(q.explanation, `${label} explanation`);
    if (!Array.isArray(q.options) || q.options.length !== 4) throw new RangeError(`${label} must have exactly four options`);
    const optionIds = new Set<string>();
    const optionTexts = new Set<string>();
    const options = Array.from(q.options as readonly unknown[], (rawOption, j): Option => {
      const optionLabel = `${label}, option ${j + 1}`;
      if (!rawOption || typeof rawOption !== 'object') throw new TypeError(`${optionLabel} must be an object`);
      const option = rawOption as Record<string, unknown>;
      const optionId = nonemptyString(option.id, `${optionLabel} id`);
      const optionText = nonemptyString(option.text, `${optionLabel} text`);
      if (optionIds.has(optionId)) throw new Error(`Duplicate option id in ${label}: ${optionId}`);
      if (optionTexts.has(optionText)) throw new Error(`Duplicate option text in ${label}: ${optionText}`);
      optionIds.add(optionId);
      optionTexts.add(optionText);
      return Object.freeze({ id: optionId, text: optionText });
    });
    if (typeof q.correctOptionId !== 'string' || !optionIds.has(q.correctOptionId)) {
      throw new Error(`${label} correctOptionId must match an option id`);
    }
    return Object.freeze({ id, text, options: Object.freeze(options), correctOptionId: q.correctOptionId, explanation });
  });
  return Object.freeze({ lessonId, questions: Object.freeze(snapshot), index: 0, selectedOptionId: null, answers: Object.freeze([]), phase: 'answering' });
}

export function selectOption(state: QuizState, optionId: string): QuizState {
  if (state.phase !== 'answering' || !state.questions[state.index]?.options.some((option) => option.id === optionId) || state.selectedOptionId === optionId) return state;
  return Object.freeze({ ...state, selectedOptionId: optionId });
}

export function confirmAnswer(state: QuizState): QuizState {
  if (state.phase !== 'answering' || state.selectedOptionId === null) return state;
  const question = state.questions[state.index];
  if (!question) return state;
  const answer = Object.freeze({ questionId: question.id, optionId: state.selectedOptionId, isCorrect: state.selectedOptionId === question.correctOptionId });
  return Object.freeze({ ...state, answers: Object.freeze([...state.answers, answer]), phase: 'feedback' });
}

export function continueQuiz(state: QuizState): QuizState {
  if (state.phase !== 'feedback') return state;
  const index = state.index + 1;
  return Object.freeze({ ...state, index, selectedOptionId: null, phase: index === 5 ? 'completed' : 'answering' });
}

export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (!Number.isInteger(correctAnswers) || totalQuestions !== 5 || correctAnswers < 0 || correctAnswers > 5) {
    throw new RangeError('correctAnswers must be an integer from 0 to 5 and totalQuestions must be 5');
  }
  return correctAnswers;
}

export function getQuizResult(state: QuizState): QuizResult {
  if (state.phase !== 'completed' || state.answers.length !== 5) throw new Error('Quiz result is available only after all five answers are completed');
  const correctAnswers = state.answers.reduce((count, answer) => count + Number(answer.isCorrect), 0);
  return Object.freeze({ lessonId: state.lessonId, totalQuestions: 5, correctAnswers, score: calculateScore(correctAnswers, 5), passed: correctAnswers >= 4, answers: state.answers });
}

type State = QuizState;
type Props = {
  lessonId: string;
  questions: readonly Question[];
  title?: string;
  onAnswer?: (answer: QuizAnswer) => void;
  onComplete?: (result: QuizResult) => void;
};

export function QuizScreen({ lessonId, questions, title = 'Repaso', onAnswer, onComplete }: Props) {
  const theme = useTheme();
  const [initial] = useState(() => {
    try {
      return { state: createQuizState(lessonId, questions), error: null };
    } catch (error) {
      return {
        state: null,
        error: error instanceof Error ? error.message : 'No se pudo iniciar el cuestionario.',
      };
    }
  });
  const [state, setState] = useState<State | null>(initial.state);
  const current = useRef<State | null>(initial.state);
  const callbacks = useRef({ onAnswer, onComplete });
  const notifiedAnswers = useRef(new Set<number>());
  const completed = useRef(false);
  const index = state?.index;
  const phase = state?.phase;

  useLayoutEffect(() => {
    callbacks.current = { onAnswer, onComplete };
  }, [onAnswer, onComplete]);

  const apply = useCallback((next: State) => {
    current.current = next;
    setState(next);
  }, []);
  const select = useCallback((optionId: string) => {
    const previous = current.current;
    if (!previous || previous.index !== index || previous.phase !== phase) return;
    apply(selectOption(previous, optionId));
  }, [apply, index, phase]);
  const confirm = useCallback(() => {
    const previous = current.current;
    if (!previous || previous.index !== index || previous.phase !== phase || phase !== 'answering') return;
    const next = confirmAnswer(previous);
    if (next === previous) return;
    apply(next);
    const answer = next.answers[next.answers.length - 1];
    if (!notifiedAnswers.current.has(next.answers.length)) {
      notifiedAnswers.current.add(next.answers.length);
      callbacks.current.onAnswer?.(answer);
    }
  }, [apply, index, phase]);
  const advance = useCallback(() => {
    const previous = current.current;
    if (!previous || previous.index !== index || previous.phase !== phase || phase !== 'feedback') return;
    const next = continueQuiz(previous);
    apply(next);
    if (next.phase === 'completed' && !completed.current) {
      completed.current = true;
      callbacks.current.onComplete?.(getQuizResult(next));
    }
  }, [apply, index, phase]);

  if (initial.error) {
    return (
      <ThemedView accessibilityRole="alert" style={styles.error}>
        <ThemedText type="subtitle">No se pudo iniciar el cuestionario</ThemedText>
        <ThemedText>{initial.error}</ThemedText>
      </ThemedView>
    );
  }
  if (!state) return <ThemedView style={styles.screen} />;
  if (state.phase === 'completed') {
    return <ResultScreen questions={state.questions} result={getQuizResult(state)} />;
  }

  const question = state.questions[state.index];
  const answer = state.answers[state.answers.length - 1];
  return (
    <ThemedView style={styles.screen}>
      <ScrollView key={question.id} contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" style={[styles.eyebrow, { color: theme.success }]}>APRENDE A TU RITMO</ThemedText>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText themeColor="textSecondary">
          Pregunta {state.index + 1} de 5
        </ThemedText>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 5, now: state.index + 1 }}
        >
          <View style={[styles.progress, { width: `${((state.index + 1) / 5) * 100}%` }]} />
        </View>
        {question && (
          <QuestionCard
            question={question}
            selectedOptionId={state.selectedOptionId}
            disabled={state.phase !== 'answering'}
            onSelect={select}
            onConfirm={confirm}
          />
        )}
      </ScrollView>
      <FeedbackModal
        visible={state.phase === 'feedback'}
        isCorrect={answer?.isCorrect ?? false}
        explanation={question?.explanation ?? ''}
        correctOptionText={question.options.find((option) => option.id === question.correctOptionId)?.text}
        onContinue={advance}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
    padding: 24,
    paddingBottom: 40,
    gap: 20,
  },
  eyebrow: { letterSpacing: 1.5 },
  track: { height: 6, borderRadius: 8, backgroundColor: '#d8ddd9', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#39866b', borderRadius: 8 },
  error: { flex: 1, padding: 24, gap: 12 },
});
