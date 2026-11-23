import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/context/AuthContext';
import { getAttemptHistory, getProgress } from '@/shared/services/progressService';
import { APP_SLUG } from '@/config/apiConfig';
import { colors } from '@/config/theme';
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
    <ScrollView style={progressStyles.screen} contentContainerStyle={progressStyles.content}>
      <Card style={progressStyles.hero}>
        <ThemedText accessibilityRole="header" style={progressStyles.heroTitle}>Cálculo</ThemedText>
        <ThemedText style={progressStyles.heroBody}>Resumen de unidades y lecciones</ThemedText>
      </Card>
      {loading ? <View style={progressStyles.center}><ActivityIndicator accessibilityLabel="Cargando progreso" color={colors.primary} /></View>
        : error ? (
          <View style={progressStyles.center} accessibilityRole="alert">
            <ThemedText style={progressStyles.error}>{error}</ThemedText>
            <Button title="Reintentar" onPress={() => void refresh()} />
          </View>
        ) : units.length === 0 ? (
          <View style={progressStyles.center}>
            <ThemedText style={progressStyles.empty}>Aún no hay unidades disponibles.</ThemedText>
            <Button title="Actualizar progreso" disabled={loading} onPress={() => void refresh()} />
          </View>
        ) : units.map((unit, unitIndex) => (
          <Card key={unit.id} style={progressStyles.unitCard}>
            <View style={progressStyles.unitHeading}>
              <View style={progressStyles.grow}>
                <ThemedText style={progressStyles.unitStatus}>Unidad {unitIndex + 1} · {unit.estadoUnidad}</ThemedText>
                <ThemedText accessibilityRole="header" style={progressStyles.unitTitle}>{unit.titulo}</ThemedText>
              </View>
            </View>
            {unit.lecciones.map((item, lessonIndex) => {
              const { cuestionarioId, titulo } = item;
              return (
                <View key={item.id} style={progressStyles.lessonRow}>
                  <View style={progressStyles.lessonNumber}>
                    <ThemedText style={progressStyles.lessonNumberText}>{lessonIndex + 1}</ThemedText>
                  </View>
                  <View style={progressStyles.lessonInfo}>
                    <ThemedText style={progressStyles.lessonTitle}>{titulo} · {item.estado}</ThemedText>
                    <ThemedText style={[
                      progressStyles.statusBadge,
                      item.estado === 'ESTUDIADO' ? progressStyles.studied : progressStyles.pending,
                    ]}>{item.estado}</ThemedText>
                  </View>
                  <Button title="Abrir lección" accessibilityLabel={`Abrir ${titulo}`}
                    onPress={() => setOpenedLesson(item.id)}
                    style={progressStyles.openButton} textStyle={progressStyles.openText} />
                  {item.tieneCuestionario && typeof cuestionarioId === 'number'
                    && Number.isInteger(cuestionarioId) && cuestionarioId > 0 && (
                    <Button title="Ver historial" accessibilityLabel={`Ver historial de ${titulo}`}
                      onPress={() => setLesson({ titulo, cuestionarioId })}
                      style={progressStyles.historyButton} textStyle={progressStyles.openText} />
                  )}
                </View>
              );
            })}
          </Card>
        ))}
      {!loading && !error && units.length > 0 &&
        <Button title="Actualizar progreso" disabled={loading} onPress={() => void refresh()}
          style={progressStyles.updateButton} />}
    </ScrollView>
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
  screen: { flex: 1, backgroundColor: '#F8F9FF' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 16, gap: 12, paddingBottom: 40 },
  hero: { backgroundColor: colors.primary, borderRadius: 12, padding: 20, gap: 4 },
  heroTitle: { color: '#FFFFFF', fontSize: 24, lineHeight: 32, fontWeight: '700' },
  heroBody: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
  center: { gap: 12, alignItems: 'center', paddingVertical: 24 },
  error: { color: colors.text, fontSize: 16, textAlign: 'center' },
  empty: { color: '#434655', fontSize: 16, textAlign: 'center' },
  unitCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#C3C5D7', padding: 16, gap: 12 },
  unitHeading: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1, minWidth: 0 },
  unitStatus: { color: '#434655', fontSize: 16 },
  unitTitle: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  lessonRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#E5EEFF', paddingTop: 12 },
  lessonNumber: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E5EEFF', alignItems: 'center', justifyContent: 'center' },
  lessonNumberText: { color: colors.primary, fontSize: 16, fontWeight: '700' },
  lessonInfo: { flex: 1, minWidth: 160, gap: 4 },
  lessonTitle: { color: colors.text, fontSize: 16, lineHeight: 22 },
  statusBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8, fontSize: 14, overflow: 'hidden' },
  studied: { color: '#006A65', backgroundColor: '#DEFBF8' },
  pending: { color: '#434655', backgroundColor: '#E5EEFF' },
  openButton: { minHeight: 48, borderRadius: 8, backgroundColor: '#E5EEFF', paddingHorizontal: 12 },
  openText: { color: colors.primary, fontSize: 16 },
  historyButton: { minHeight: 48, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C3C5D7', paddingHorizontal: 12 },
  updateButton: { minHeight: 48, borderRadius: 8, backgroundColor: colors.primary },
  title: { fontSize: 28, lineHeight: 36, letterSpacing: -0.7 },
  button: { minHeight: 48, borderRadius: 8, paddingVertical: 12 },
  attempt: { borderRadius: 12, padding: 16, gap: 8 },
  grade: { fontSize: 28, lineHeight: 36 },
  currentGrade: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 },
});
