import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/context/AuthContext';
import { APP_SLUG } from '@/config/apiConfig';
import RemoteQuizScreen from '@/shared/features/quiz/screens/RemoteQuizScreen';
import MathText from '@/shared/components/MathText';

export default function LessonScreen({ id, close, onProgressChanged }) {
  const { request } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [quiz, setQuiz] = useState(false);
  useEffect(() => {
    let active = true;
    request(`/lecciones/${id}`).then(value => {
      if (value?.id !== id || value?.unidad?.materiaSlug !== APP_SLUG) {
        throw new Error('La lección recibida no pertenece a Cálculo.');
      }
      if (active) setLesson(value);
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [id, request, retry]);

  async function markStudied() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await request(`/lecciones/${id}/marcar-estudiado`, {});
      await onProgressChanged();
      setRetry(value => value + 1);
    } catch (failure) { setError(failure.message); }
    finally { pending.current = false; setBusy(false); }
  }

  if (quiz) return <RemoteQuizScreen quizId={lesson.cuestionarioId} lessonId={id}
    close={() => { setQuiz(false); setRetry(value => value + 1); }} onProgressChanged={onProgressChanged} />;

  return <View style={{ gap: 12 }}>
    <Button title="Volver a unidades" disabled={busy} onPress={close} />
    {!!error && <><ThemedText accessibilityRole="alert">{error}</ThemedText>
      <Button title="Reintentar lección" onPress={() => { setError(''); setRetry(value => value + 1); }} /></>}
    {!lesson ? !error && <ActivityIndicator accessibilityLabel="Cargando lección" /> : <>
      <ThemedText type="subtitle">{lesson.titulo}</ThemedText>
      <MathText text={lesson.definicion} />
      <MathText text={lesson.ejemplo} />
      <ThemedText>Estado: {lesson.estadoEstudiante}</ThemedText>
      {!lesson.tieneCuestionario && <Button title={busy ? 'Guardando…' : 'Marcar como estudiada'}
        disabled={busy || lesson.estadoEstudiante === 'ESTUDIADO'} onPress={markStudied} />}
      {lesson.tieneCuestionario && Number.isSafeInteger(lesson.cuestionarioId) && lesson.cuestionarioId > 0
        && <Button title="Abrir cuestionario" onPress={() => setQuiz(true)} />}
    </>}
  </View>;
}
