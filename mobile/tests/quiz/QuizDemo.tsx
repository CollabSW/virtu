import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { QuizScreen } from '@/shared/features/quiz/screens/QuizScreen';
import { GlossaryScreen } from '@/shared/features/glossary/screens/GlossaryScreen';
import { Spacing } from '@/config/theme';
import { exampleQuestions } from './fixtures';

const glossaryExamples = [
  { id: 'calculo-1', subject: 'calculo', title: 'Función cuadrática', topic: 'Funciones', definition: 'Polinomio de segundo grado.', rendering: 'f(x) = ax² + bx + c' },
  { id: 'historia-1', subject: 'historia', title: 'Simón Bolívar', date: '1783–1830', character: 'Líder independentista', timeline: 'Independencias hispanoamericanas' },
  { id: 'fisica-1', subject: 'fisica', title: 'Inercia', concept: 'Un cuerpo conserva su estado de movimiento si no actúa una fuerza neta.', videoUrl: 'https://example.test/inercia' },
  { id: 'ingles-1', subject: 'ingles', title: 'Resilient', vocabulary: 'resilient', audioUrl: 'https://example.test/resilient', example: 'She is resilient.' },
  { id: 'biologia-1', subject: 'biologia', title: 'Célula', front: '¿Cuál es la unidad básica de la vida?', back: 'La célula.' },
  { id: 'quimica-1', subject: 'quimica', title: 'Carbono', symbol: 'C', atomicNumber: 6, properties: ['No metal', 'Presente en moléculas orgánicas'] },
] as const;

export default function QuizDemo() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <ThemedView accessibilityRole="summary" accessibilityLabel="SOLO PRUEBAS. Datos ficticios. No corresponde a un canal real." style={styles.notice}>
          <ThemedText type="smallBold">SOLO PRUEBAS — datos ficticios. No corresponde a un canal real.</ThemedText>
        </ThemedView>
        <QuizScreen lessonId="demo-cultura" questions={exampleQuestions} title="Cultura general · Pruebas" />
        <GlossaryScreen title="Glosario de pruebas" entries={glossaryExamples} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: Spacing.four },
  notice: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: Spacing.three, marginBottom: Spacing.three },
});
