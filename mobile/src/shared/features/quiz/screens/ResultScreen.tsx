import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import type { Question, QuizResult } from './QuizScreen';

type Props = { questions: readonly Question[]; result: QuizResult };

export function ResultScreen({ questions, result }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.summary}>
        <Header title={result.passed ? '¡Cuestionario aprobado!' : 'Sigue practicando'} />
        <ThemedText type="title" style={styles.score}>{result.score} de 5</ThemedText>
        <ThemedText>{result.correctAnswers} respuestas correctas</ThemedText>
      </Card>
      <Header title="Revisa tus respuestas" />
      {questions.map((question, index) => {
        const answer = result.answers.find((item) => item.questionId === question.id);
        const chosen = question.options.find((option) => option.id === answer?.optionId);
        const correct = question.options.find((option) => option.id === question.correctOptionId);
        return (
          <Card key={question.id} style={styles.item}>
            <ThemedText type="smallBold">
              Pregunta {index + 1}: {question.text}
            </ThemedText>
            <ThemedText>
              {answer?.isCorrect ? 'Correcta' : `Tu respuesta: ${chosen?.text ?? 'Sin respuesta'}`}
            </ThemedText>
            {!answer?.isCorrect && <ThemedText>Respuesta correcta: {correct?.text}</ThemedText>}
            <ThemedText themeColor="textSecondary">{question.explanation}</ThemedText>
          </Card>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  summary: { alignItems: 'center', padding: 24, borderRadius: 24, gap: 8 },
  score: { fontSize: 48, lineHeight: 56 },
  item: { padding: 18, borderRadius: 18, gap: 8 },
});
