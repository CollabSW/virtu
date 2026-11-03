import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuizEngine } from '@/core/quiz';
import { Spacing } from '@/constants/theme';
import { exampleQuestions } from './fixtures';

export default function QuizDemo() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ThemedView accessibilityRole="summary" accessibilityLabel="SOLO PRUEBAS. Datos ficticios. No corresponde a un canal real." style={styles.notice}>
          <ThemedText type="smallBold">SOLO PRUEBAS — datos ficticios. No corresponde a un canal real.</ThemedText>
        </ThemedView>
        <QuizEngine questions={exampleQuestions} title="Cultura general · Pruebas" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.four },
  notice: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.three },
});
