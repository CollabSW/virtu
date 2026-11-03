import { ScrollView, StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { FeedbackModal } from './FeedbackModal';
import { getQuizResult } from './quiz-state';
import type { QuizEngineProps } from './types';
import { useQuiz } from './use-quiz';

export function QuizEngine({ questions, title = 'Repaso', onComplete, onAnswer }: QuizEngineProps) {
  const { state, select, confirm, continue: advance } = useQuiz(questions, onAnswer, onComplete);
  const theme = useTheme();
  const question = state.questions[state.index];
  const answer = state.answers[state.answers.length - 1];
  const result = getQuizResult(state);
  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="smallBold" style={styles.eyebrow}>APRENDE A TU RITMO</ThemedText>
        <ThemedText type="subtitle">{title}</ThemedText>
        {state.phase === 'completed' ? (
          <ThemedView type="backgroundElement" style={styles.result}>
            <ThemedText type="smallBold">{state.questions.length === 0 ? 'No hay preguntas disponibles' : 'Cuestionario terminado'}</ThemedText>
            <ThemedText type="title" style={styles.score}>{result.score}%</ThemedText>
            <ThemedText>{result.correctAnswers} de {result.totalQuestions} respuestas correctas</ThemedText>
          </ThemedView>
        ) : question ? (
          <>
            <ThemedText type="small" themeColor="textSecondary">Pregunta {state.index + 1} de {state.questions.length}</ThemedText>
            <View style={styles.progressTrack} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: state.questions.length, now: state.index + 1 }}>
              <View style={[styles.progress, { width: `${((state.index + 1) / state.questions.length) * 100}%` }]} />
            </View>
            <ThemedView type="backgroundElement" style={styles.questionCard}>
              <ThemedText type="subtitle" style={styles.question}>{question.text}</ThemedText>
              <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Opciones de respuesta">
                {question.options.map((option, index) => {
                  const selected = state.selectedOptionId === option.id;
                  const disabled = state.phase !== 'answering';
                  return <Pressable key={option.id} accessibilityRole="radio" accessibilityLabel={option.text} accessibilityState={{ checked: selected, disabled }} disabled={disabled} onPress={() => select(option.id)} style={({ pressed }) => [styles.option, { borderColor: selected ? '#39866b' : theme.textSecondary, backgroundColor: selected ? theme.backgroundSelected : theme.background }, pressed && !disabled && styles.pressed]}>
                    <ThemedText type="smallBold" style={[styles.optionIndex, { backgroundColor: theme.backgroundSelected, color: theme.text }]}>{String.fromCharCode(65 + index)}</ThemedText>
                    <ThemedText style={styles.optionText}>{option.text}</ThemedText>
                  </Pressable>;
                })}
              </View>
            </ThemedView>
            {state.phase === 'answering' && <Pressable accessibilityRole="button" accessibilityLabel="Comprobar respuesta" disabled={!state.selectedOptionId} onPress={confirm} style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.text, opacity: state.selectedOptionId ? 1 : 0.4 }, pressed && styles.pressed]}>
              <ThemedText style={{ color: theme.background, fontWeight: '700' }}>Comprobar respuesta</ThemedText>
            </Pressable>}
          </>
        ) : null}
      </ScrollView>
      <FeedbackModal visible={state.phase === 'feedback'} isCorrect={answer?.isCorrect ?? false} explanation={question?.explanation ?? ''} onContinue={advance} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 24, paddingBottom: 40, gap: 20 },
  eyebrow: { letterSpacing: 1.5, color: '#39866b' },
  progressTrack: { height: 6, borderRadius: 8, backgroundColor: '#d8ddd9', overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: '#39866b', borderRadius: 8 },
  questionCard: { padding: 22, borderRadius: 24, gap: 24 },
  question: { fontSize: 28, lineHeight: 36 },
  options: { gap: 12 },
  option: { minHeight: 58, borderRadius: 16, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionIndex: { minWidth: 28, minHeight: 28, borderRadius: 18, textAlign: 'center', textAlignVertical: 'center', paddingHorizontal: 6, paddingVertical: 3, flexShrink: 0 },
  optionText: { flex: 1 },
  primaryButton: { minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 16 },
  pressed: { opacity: 0.75 },
  result: { padding: 28, borderRadius: 24, alignItems: 'center', gap: 12, marginTop: 24 },
  score: { fontSize: 64, lineHeight: 72 },
});
