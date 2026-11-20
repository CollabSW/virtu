import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { APP_SLUG } from '@/config/apiConfig';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/context/AuthContext';
import { getAttemptHistory, getProgress } from '@/shared/services/progressService';

type Estado = 'ESTUDIADO' | 'PENDIENTE';
type Lesson = { id: number; titulo: string; estado: Estado; tieneCuestionario: boolean; cuestionarioId: number | null };
type Unit = { id: number; titulo: string; estadoUnidad: Estado; lecciones: Lesson[] };
type Content = { slug: string; unidades: Unit[] };
type Attempt = {
  id: number;
  numeroIntento: number;
  aprobado: boolean;
  aciertos: number;
  calificacion: number;
  fechaEjecucion: string;
  esNotaVigente: boolean;
};

export default function UnitsScreen() {
  const { request } = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lesson, setLesson] = useState<{ titulo: string; cuestionarioId: number } | null>(null);
  const sequence = useRef(0);

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
    <View style={{ gap: 12 }}>
      <ThemedText type="subtitle">Historial de {lesson.titulo}</ThemedText>
      {error ? (
        <>
          <ThemedText accessibilityRole="alert">{error}</ThemedText>
          <Button title="Reintentar historial" onPress={() => { setError(''); load(); }} />
        </>
      ) : !attempts ? <ActivityIndicator accessibilityLabel="Cargando historial" />
        : attempts.length === 0 ? <ThemedText>Aún no hay intentos registrados.</ThemedText>
          : attempts.map(attempt => (
            <View key={attempt.id}>
              <ThemedText>Intento {attempt.numeroIntento} · {attempt.aprobado ? 'Aprobado' : 'No aprobado'}</ThemedText>
              <ThemedText>{attempt.aciertos} de 5 aciertos · Nota {attempt.calificacion}</ThemedText>
              <ThemedText>{new Date(attempt.fechaEjecucion).toLocaleString('es-BO')}</ThemedText>
              {attempt.esNotaVigente && <ThemedText>Nota vigente</ThemedText>}
            </View>
          ))}
      <Button title="Volver a mi progreso" onPress={close} />
    </View>
  );
}
