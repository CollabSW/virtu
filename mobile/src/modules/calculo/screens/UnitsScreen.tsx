import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/context/AuthContext';
import { getAttemptHistory, getProgress } from '@/shared/services/progressService';
import { APP_SLUG } from '@/config/apiConfig';
import LessonScreen from './LessonScreen';
import ProgressOverview from '../components/ProgressOverview';
import { useMatiasDesign } from '../components/matiasDesign';
import { Card } from '@/shared/components/Card';

type Estado = 'ESTUDIADO' | 'PENDIENTE';
type Lesson = { id: number; titulo: string; estado: Estado; tieneCuestionario: boolean; cuestionarioId: number | null };
type Unit = { id: number; titulo: string; estadoUnidad: Estado; lecciones: Lesson[] };
type Content = { slug: string; unidades: Unit[] };
type Attempt = {
  id: number;
  numeroIntento: number;
  aprobado: boolean;
  aciertos: number;
  calificacion: number | string;
  fechaEjecucion: string;
  esNotaVigente: boolean;
};

export default function UnitsScreen({ progressOnly = false, onClose }: { progressOnly?: boolean; onClose?: () => void } = {}) {
  const { request } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState<{ titulo: string; cuestionarioId: number } | null>(null);
  const sequence = useRef(0);
  const [openedLesson, setOpenedLesson] = useState<number | null>(null);
  const design = useMatiasDesign();

  const refresh = useCallback(async () => {
    const current = ++sequence.current;
    setLoading(true);
    setError('');
    try {
      const content = await getProgress(request, APP_SLUG) as Content;
      if (content?.slug !== APP_SLUG || !Array.isArray(content.unidades)
        || content.unidades.some(unit => !Array.isArray(unit?.lecciones))) {
        throw new Error('Virtu devolvió un progreso inválido.');
      }
      if (sequence.current === current) setUnits(content.unidades);
    } catch (failure) {
      if (sequence.current === current) setError(failure instanceof Error ? failure.message : 'No se pudo consultar el progreso.');
    } finally {
      if (sequence.current === current) setLoading(false);
    }
  }, [request]);

  useFocusEffect(useCallback(() => {
    setLesson(null);
    void refresh();
    return () => { sequence.current++; };
  }, [refresh]));

  if (lesson) return <AttemptHistory lesson={lesson} close={() => setLesson(null)} />;
  if (openedLesson !== null) return <LessonScreen id={openedLesson}
    close={() => { setOpenedLesson(null); void refresh(); }} onProgressChanged={refresh} />;

  if (progressOnly) return <View style={[progressStyles.page, { backgroundColor: design.background }]}>
    <ThemedText accessibilityRole="header" style={[progressStyles.title, { color: design.text, fontFamily: design.bold }]}>Mi progreso en Cálculo</ThemedText>
    <ThemedText style={{ color: design.muted, fontFamily: design.regular }}>Seguimiento de tu avance académico</ThemedText>
    {loading ? <ActivityIndicator accessibilityLabel="Cargando progreso" color={design.primary} />
      : error ? <ThemedText accessibilityRole="alert">{error}</ThemedText>
        : <ProgressOverview units={units} onOpenLesson={setOpenedLesson}
          onHistory={(item: Lesson) => setLesson({ titulo: item.titulo, cuestionarioId: item.cuestionarioId! })} />}
    <Button title={error ? 'Reintentar progreso' : 'Actualizar progreso'} disabled={loading} onPress={() => void refresh()}
      style={[progressStyles.button, { backgroundColor: design.button }]} textStyle={{ color: design.onButton, fontFamily: design.semibold }} />
    <Button title="Volver al inicio" onPress={onClose} style={[progressStyles.button, { backgroundColor: design.subtle }]}
      textStyle={{ color: design.text, fontFamily: design.semibold }} />
  </View>;

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="subtitle">Mi progreso</ThemedText>
      {loading ? <ActivityIndicator accessibilityLabel="Cargando progreso" /> : error ? (
        <ThemedText accessibilityRole="alert">{error}</ThemedText>
      ) : units.length === 0 ? <ThemedText>Aún no hay unidades disponibles.</ThemedText> : units.map(unit => (
        <View key={unit.id} style={{ gap: 8 }}>
          <ThemedText>{unit.titulo} · {unit.estadoUnidad}</ThemedText>
          {unit.lecciones.map(item => {
            const { cuestionarioId, titulo } = item;
            return (
              <View key={item.id} style={{ gap: 6 }}>
                <ThemedText>{titulo} · {item.estado}</ThemedText>
                <Button title="Abrir lección" accessibilityLabel={`Abrir ${titulo}`}
                  onPress={() => setOpenedLesson(item.id)} />
                {item.tieneCuestionario && typeof cuestionarioId === 'number'
                  && Number.isInteger(cuestionarioId) && cuestionarioId > 0 && (
                  <Button title="Ver historial" accessibilityLabel={`Ver historial de ${titulo}`}
                    onPress={() => setLesson({ titulo, cuestionarioId })} />
                )}
              </View>
            );
          })}
        </View>
      ))}
      <Button title={error ? 'Reintentar progreso' : 'Actualizar progreso'} disabled={loading}
        onPress={() => void refresh()} />
    </View>
  );
}

function AttemptHistory({ lesson, close }: { lesson: { titulo: string; cuestionarioId: number }; close: () => void }) {
  const { request } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[] | null>(null);
  const [error, setError] = useState('');
  const sequence = useRef(0);
  const quizId = lesson.cuestionarioId;
  const design = useMatiasDesign();

  const load = useCallback(() => {
    const current = ++sequence.current;
    getAttemptHistory(request, quizId).then((data: unknown) => {
      if (!Array.isArray(data)) throw new Error('Virtu devolvió un historial inválido.');
      if (sequence.current === current) setAttempts(data);
    }).catch((failure: unknown) => {
      if (sequence.current === current) setError(failure instanceof Error ? failure.message : 'No se pudo consultar el historial.');
    });
  }, [request, quizId]);

  useFocusEffect(useCallback(() => {
    load();
    return () => { sequence.current++; };
  }, [load]));

  return (
    <View style={[progressStyles.page, { backgroundColor: design.background }]}>
      <ThemedText accessibilityRole="header" style={[progressStyles.title, { color: design.text, fontFamily: design.bold }]}>Historial de {lesson.titulo}</ThemedText>
      <ThemedText style={{ color: design.muted, fontFamily: design.regular }}>Resultados registrados por el servidor</ThemedText>
      {error ? (
        <>
          <ThemedText accessibilityRole="alert">{error}</ThemedText>
          <Button title="Reintentar historial" onPress={() => { setError(''); load(); }} />
        </>
      ) : !attempts ? <ActivityIndicator accessibilityLabel="Cargando historial" />
        : attempts.length === 0 ? <ThemedText>Aún no hay intentos registrados.</ThemedText>
          : attempts.map(attempt => (
            <Card key={attempt.id} style={[progressStyles.attempt, { backgroundColor: design.surface }]}>
              <ThemedText style={{ color: attempt.aprobado ? design.success : design.text, fontFamily: design.semibold }}>Intento {attempt.numeroIntento} · {attempt.aprobado ? 'Aprobado' : 'No aprobado'}</ThemedText>
              <ThemedText style={[progressStyles.grade, { color: attempt.aprobado ? design.success : design.text, fontFamily: design.bold }]}>Nota {attempt.calificacion}</ThemedText>
              <ThemedText style={{ color: design.text, fontFamily: design.regular }}>{attempt.aciertos} de 5 aciertos</ThemedText>
              <ThemedText style={{ color: design.muted, fontFamily: design.regular }}>{new Date(attempt.fechaEjecucion).toLocaleString('es-BO')}</ThemedText>
              {attempt.esNotaVigente && <ThemedText style={[progressStyles.currentGrade, { color: design.success, backgroundColor: design.successSurface, fontFamily: design.semibold }]}>Nota vigente</ThemedText>}
            </Card>
          ))}
      <Button title="Volver a mi progreso" onPress={close} style={[progressStyles.button, { backgroundColor: design.button }]}
        textStyle={{ color: design.onButton, fontFamily: design.semibold }} />
    </View>
  );
}

const progressStyles = StyleSheet.create({
  page: { gap: 12, padding: 16, marginHorizontal: -20 },
  title: { fontSize: 28, lineHeight: 36, letterSpacing: -0.7 },
  button: { minHeight: 48, borderRadius: 8, paddingVertical: 12 },
  attempt: { borderRadius: 12, padding: 16, gap: 8 },
  grade: { fontSize: 28, lineHeight: 36 },
  currentGrade: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
});
