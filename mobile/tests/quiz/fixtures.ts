import type { Question } from '@/shared/features/quiz/screens/QuizScreen';

export const exampleQuestions: readonly Question[] = [
  {
    id: 'basics-1',
    text: '¿Qué planeta es conocido como el planeta rojo?',
    options: [
      { id: 'mars', text: 'Marte' },
      { id: 'venus', text: 'Venus' },
      { id: 'jupiter', text: 'Júpiter' },
      { id: 'saturn', text: 'Saturno' },
    ],
    correctOptionId: 'mars',
    explanation: 'El óxido de hierro de su superficie le da a Marte su color rojizo.',
  },
  {
    id: 'basics-2',
    text: '¿Cuánto es 7 × 8?',
    options: [
      { id: '54', text: '54' },
      { id: '56', text: '56' },
      { id: '64', text: '64' },
      { id: '49', text: '49' },
    ],
    correctOptionId: '56',
    explanation: 'Siete grupos de ocho suman cincuenta y seis.',
  },
  {
    id: 'basics-3',
    text: '¿Cuál es el símbolo químico del agua?',
    options: [
      { id: 'co2', text: 'CO₂' },
      { id: 'h2o', text: 'H₂O' },
      { id: 'o2', text: 'O₂' },
      { id: 'n2', text: 'N₂' },
    ],
    correctOptionId: 'h2o',
    explanation: 'Cada molécula de agua contiene dos átomos de hidrógeno y uno de oxígeno.',
  },
  {
    id: 'basics-4',
    text: '¿En qué continente está Japón?',
    options: [
      { id: 'europe', text: 'Europa' },
      { id: 'asia', text: 'Asia' },
      { id: 'africa', text: 'África' },
      { id: 'america', text: 'América' },
    ],
    correctOptionId: 'asia',
    explanation: 'Japón es un país insular de Asia oriental.',
  },
  {
    id: 'basics-5',
    text: '¿Qué órgano bombea la sangre por el cuerpo?',
    options: [
      { id: 'lungs', text: 'Los pulmones' },
      { id: 'heart', text: 'El corazón' },
      { id: 'liver', text: 'El hígado' },
      { id: 'kidney', text: 'Los riñones' },
    ],
    correctOptionId: 'heart',
    explanation: 'El corazón impulsa la sangre a través del sistema circulatorio.',
  },
];

export const quizFixtures: {
  readonly empty: readonly Question[];
  readonly single: readonly Question[];
  readonly multiple: readonly Question[];
  readonly long: readonly Question[];
} = {
  empty: [],
  single: [exampleQuestions[0]],
  multiple: exampleQuestions,
  long: exampleQuestions.map((question, index) => index === 0 ? {
    ...question,
    id: 'long-question',
    text: `${question.text} f(x) = ax² + bx + c; x → ∞; ∑ₙ₌₁ᵐ n². ${'Lee con atención todos los detalles antes de responder. '.repeat(20)}`,
    options: question.options.map((option) => ({
      ...option,
      text: `${option.text}: ${'Una explicación extensa con información adicional para evaluar respuestas de longitud considerable. '.repeat(5)}`,
    })),
  } : question),
};

export const quizAnswerFixtures = {
  correctOptionIds: exampleQuestions.map((question) => question.correctOptionId),
  incorrectOptionIds: exampleQuestions.map(
    (question) => question.options.find((option) => option.id !== question.correctOptionId)!.id,
  ),
} as const;

export const lessonQuizFixture = {
  lessonId: 'lesson-mock',
  questions: exampleQuestions,
} as const;
