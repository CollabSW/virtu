import { Redirect } from 'expo-router';

// Keep release bundles from resolving the test-only module.
const QuizDemo: typeof import('../../tests/quiz/QuizDemo').default | null = __DEV__
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- this dev-only import is guarded for Metro dead-code elimination.
  ? require('../../tests/quiz/QuizDemo').default
  : null;

export default function PruebasRoute() {
  return QuizDemo ? <QuizDemo /> : <Redirect href="/" />;
}
