export type Option = {
  readonly id: string;
  readonly text: string;
};

export type Question = {
  readonly id: string;
  readonly text: string;
  readonly options: readonly Option[];
  readonly correctOptionId: string;
  readonly explanation: string;
};

export type QuizAnswer = {
  questionId: string;
  optionId: string;
  isCorrect: boolean;
};

export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  answers: readonly QuizAnswer[];
};

export type QuizEngineProps = {
  questions: readonly Question[];
  title?: string;
  onComplete?: (result: QuizResult) => void;
  onAnswer?: (answer: QuizAnswer) => void;
};

export type FeedbackModalProps = {
  visible: boolean;
  isCorrect: boolean;
  explanation: string;
  onContinue: () => void;
};
