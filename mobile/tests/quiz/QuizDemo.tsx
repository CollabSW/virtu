import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuizScreen } from '@/shared/features/quiz/screens/QuizScreen';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { Spacing } from '@/config/theme';
import { Button } from '@/shared/components/Button';
import { exampleQuestions, quizFixtures } from './fixtures';
import { glossaryExamples } from '../glossary/fixtures';

export default function QuizDemo() {
  const [longText, setLongText] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ThemedView accessibilityRole="summary" accessibilityLabel="SOLO PRUEBAS. Datos ficticios. No corresponde a un canal real." style={styles.notice}>
          <ThemedText type="smallBold">SOLO PRUEBAS — datos ficticios. No corresponde a un canal real.</ThemedText>
        </ThemedView>
        <Button
          title={longText ? 'Usar preguntas de ejemplo' : 'Probar texto largo'}
          accessibilityLabel={longText ? 'Usar preguntas de ejemplo' : 'Probar texto largo'}
          onPress={() => setLongText((current) => !current)}
          style={styles.toggle}
        />
        <QuizScreen
          key={longText ? 'long-text' : 'examples'}
          lessonId="demo-cultura"
          questions={longText ? quizFixtures.long : exampleQuestions}
          title="Cultura general · Pruebas"
        />
        <GlossaryScreen title="Glosario de pruebas" entries={glossaryExamples} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.four },
  notice: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.three },
  toggle: { minHeight: 40, paddingHorizontal: 12, borderRadius: 12, alignSelf: 'flex-start' },
});
