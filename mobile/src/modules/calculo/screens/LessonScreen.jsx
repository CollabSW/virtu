import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { useAuth } from '@/shared/context/AuthContext';
import { APP_SLUG } from '@/config/apiConfig';
import { colors, typography } from '@/config/theme';
import RemoteQuizScreen from '@/shared/features/quiz/screens/RemoteQuizScreen';
import MathText from '@/shared/components/MathText';
import CalculusGlossary from './CalculusGlossary';

export default function LessonScreen({ id, close, onProgressChanged }) {
  const { request } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [quiz, setQuiz] = useState(false);
  const [glossary, setGlossary] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setError('');
    request(`/lecciones/${id}`).then(value => {
      if (value?.id !== id || value?.unidad?.materiaSlug !== APP_SLUG) {
        throw new Error('La lección recibida no pertenece a Cálculo.');
      }
      if (active) setLesson(value);
    }).catch(failure => {
      if (active) setError(failure instanceof Error ? failure.message : 'No se pudo cargar la lección.');
    });
    return () => { active = false; };
  }, [id, request]);

  useFocusEffect(useCallback(() => load(), [load]));

  async function markStudied() {
    if (pending.current || lesson?.estadoEstudiante === 'ESTUDIADO') return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await request(`/lecciones/${id}/marcar-estudiado`, {});
      const state = response?.estadoEstudiante ?? response?.estado ?? response?.estado_progreso;
      setLesson(current => ({
        ...current,
        estadoEstudiante: state === 'ESTUDIADO' ? 'ESTUDIADO' : current?.estadoEstudiante,
      }));
      await onProgressChanged();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo actualizar el estado.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  if (quiz) return <RemoteQuizScreen quizId={lesson.cuestionarioId} lessonId={id}
    close={() => { setQuiz(false); load(); }} onProgressChanged={onProgressChanged} />;
  if (glossary) return <CalculusGlossary close={() => setGlossary(false)} />;

  return <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
    <Button title="Volver a unidades" disabled={busy} onPress={close} />
    {!!error && <View style={styles.errorBlock}>
      <ThemedText accessibilityRole="alert">{error}</ThemedText>
      <Button title="Reintentar lección" onPress={() => load()} />
    </View>}
    {!lesson ? !error && <ActivityIndicator accessibilityLabel="Cargando lección" /> : <>
      <View style={styles.heading}>
        <ThemedText accessibilityRole="header" style={styles.title}>{lesson.titulo}</ThemedText>
        <ThemedText style={[
          styles.status,
          { color: lesson.estadoEstudiante === 'ESTUDIADO' ? '#006A65' : '#434655',
            backgroundColor: lesson.estadoEstudiante === 'ESTUDIADO' ? '#DEFBF8' : '#E5EEFF' },
        ]}>Estado: {lesson.estadoEstudiante}</ThemedText>
      </View>
      <Card style={styles.card}>
        <ThemedText accessibilityRole="header" style={styles.cardTitle}>Definición</ThemedText>
        <MathText text={lesson.definicion} />
      </Card>
      <Card style={styles.card}>
        <ThemedText accessibilityRole="header" style={styles.cardTitle}>Ejemplo</ThemedText>
        <MathText text={lesson.ejemplo} />
      </Card>
      <Button title="Gráficas / Glosario" accessibilityLabel="Abrir Glosario y Gráficas"
        style={styles.secondaryButton} textStyle={styles.secondaryText} onPress={() => setGlossary(true)} />
      {!lesson.tieneCuestionario && <Button title={busy ? 'Guardando…' : 'Marcar como estudiado'}
        disabled={busy || lesson.estadoEstudiante === 'ESTUDIADO'} onPress={markStudied} />}
      {lesson.tieneCuestionario && Number.isSafeInteger(lesson.cuestionarioId) && lesson.cuestionarioId > 0
        && <Button title="Abrir cuestionario" onPress={() => setQuiz(true)} />}
    </>}
  </ScrollView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FF' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 16, gap: 12, paddingBottom: 40 },
  errorBlock: { gap: 8 },
  heading: { gap: 8, marginBottom: 4 },
  title: { color: colors.text, fontSize: typography.title, lineHeight: 32 },
  status: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, fontSize: typography.body },
  card: { backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: '#C3C5D7', padding: 16 },
  cardTitle: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#E5EEFF', borderRadius: 8 },
  secondaryText: { color: colors.primary },
});
