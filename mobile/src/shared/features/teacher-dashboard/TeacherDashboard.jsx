import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { APP_SLUG } from '@/config/apiConfig';
import { colors, typography } from '@/config/theme';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Header } from '@/shared/components/Header';
import MathText from '@/shared/components/MathText';
import { SearchBar } from '@/shared/components/SearchBar';
import { useAuth } from '@/shared/context/AuthContext';

export default function TeacherDashboard({ name }) {
  const { request, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (user?.rol !== 'DOCENTE') return undefined;
    let active = true;
    const path = lesson
      ? `/docente/estudiantes/${student.estudianteId}/lecciones/${lesson.id}`
      : student
        ? `/contenidos/${APP_SLUG}`
        : course
          ? `/docente/cursos/${course.id}/estudiantes`
          : '/docente/cursos';
    request(path).then(value => {
      if (lesson && (!value || value?.estudiante?.id !== student.estudianteId
        || value?.leccion?.id !== lesson.id)) {
        throw new Error('El reporte recibido no corresponde al estudiante y la lección seleccionados.');
      }
      if (student && !lesson && (value?.slug !== APP_SLUG || !Array.isArray(value?.unidades)
        || value.unidades.some(unit => !Array.isArray(unit?.lecciones)))) {
        throw new Error('El servidor devolvió un listado de lecciones de Cálculo inválido.');
      }
      if (course && !student && (value?.curso?.id !== course.id || !Array.isArray(value?.estudiantes)
        || !Number.isSafeInteger(value?.totalEstudiantes))) {
        throw new Error('El servidor devolvió un listado de estudiantes inválido.');
      }
      if (!course && !student && !Array.isArray(value)) {
        throw new Error('El servidor devolvió un listado de cursos inválido.');
      }
      if (active) setData(value);
    }).catch(failure => {
      if (!active) return;
      if (failure?.status === 403) {
        setError('No tienes autorización para consultar este curso, estudiante o lección.');
      } else if (failure?.status === 404) {
        setError('El curso, estudiante o lección solicitado ya no está disponible.');
      } else {
        setError(failure instanceof Error ? failure.message : 'No se pudo cargar el reporte docente.');
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [request, user?.rol, course, student, lesson, retry]);

  const filteredStudents = useMemo(() => {
    if (!data?.estudiantes) return [];
    const search = query.trim().toLocaleLowerCase();
    if (!search) return data.estudiantes;
    return data.estudiantes.filter(item =>
      `${item.nombreCompleto ?? ''} ${item.username ?? ''}`.toLocaleLowerCase().includes(search));
  }, [data, query]);

  function navigate(change) {
    setData(null);
    setError('');
    setLoading(true);
    setQuery('');
    change();
  }

  function goBack() {
    navigate(() => {
      if (lesson) setLesson(null);
      else if (student) setStudent(null);
      else setCourse(null);
    });
  }

  function retryRequest() {
    setError('');
    setLoading(true);
    setRetry(value => value + 1);
  }

  const lessons = student && data?.slug === APP_SLUG
    ? data.unidades.flatMap(unit => unit.lecciones)
    : [];
  const hasAttempt = data?.notaVigente != null
    || (Array.isArray(data?.detallePreguntas) && data.detallePreguntas.length > 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} nestedScrollEnabled>
      <Header title="Panel docente" subtitle={`${name} · Docente · Solo lectura`} />
      {course && <Button title="Volver" accessibilityLabel="Volver a la lista anterior"
        style={styles.secondaryButton} textStyle={styles.secondaryText} onPress={goBack} />}
      {user?.rol !== 'DOCENTE' ? (
        <Card style={styles.card}>
          <ThemedText accessibilityRole="alert" style={styles.body}>Acceso disponible solo para docentes.</ThemedText>
        </Card>
      ) : loading ? (
        <View style={styles.state}>
          <ActivityIndicator accessibilityLabel="Cargando reporte docente" color={colors.primary} />
        </View>
      ) : error ? (
        <Card style={styles.state}>
          <ThemedText accessibilityRole="alert" style={styles.body}>{error}</ThemedText>
          <Button title="Reintentar" onPress={retryRequest} />
        </Card>
      ) : !data ? null
        : !course ? (
          <View style={styles.section}>
            <Card style={styles.hero}>
              <ThemedText accessibilityRole="header" style={styles.heroTitle}>Mis cursos</ThemedText>
              <ThemedText style={styles.heroBody}>Cursos asignados y matrícula actual.</ThemedText>
            </Card>
            {data.length === 0 ? (
              <Card style={styles.state}>
                <ThemedText style={styles.body}>No tienes cursos asignados actualmente.</ThemedText>
              </Card>
            ) : data.map(item => (
              <Button key={item.id} title={`${item.nombre} · ${item.totalEstudiantes} estudiantes${item.colegio?.nombre ? ` · ${item.colegio.nombre}` : ''}`}
                accessibilityLabel={`Abrir curso ${item.nombre}, ${item.totalEstudiantes} estudiantes${item.colegio?.nombre ? `, ${item.colegio.nombre}` : ''}`}
                style={styles.courseButton} textStyle={styles.courseButtonText}
                onPress={() => navigate(() => setCourse(item))} />
            ))}
          </View>
        ) : !student ? (
          <View style={styles.section}>
            <Card style={styles.summary}>
              <ThemedText accessibilityRole="header" style={styles.sectionTitle}>{data.curso?.nombre ?? course.nombre}</ThemedText>
              {!!(data.curso?.colegio?.nombre ?? course.colegio?.nombre) &&
                <ThemedText style={styles.body}>Colegio: {data.curso?.colegio?.nombre ?? course.colegio.nombre}</ThemedText>}
              <ThemedText style={styles.body}>Estudiantes asignados: {data.totalEstudiantes}</ThemedText>
            </Card>
            <Card style={styles.notice}>
              <ThemedText style={styles.body}>
                El avance y promedio siguientes son agregados de todas las materias, tal como los devuelve el servidor; no representan solo Cálculo.
              </ThemedText>
            </Card>
            {data.estudiantes.length === 0 ? (
              <Card style={styles.state}>
                <ThemedText style={styles.emptyTitle}>Este curso aún no tiene estudiantes registrados.</ThemedText>
                <ThemedText style={styles.body}>Cuando haya estudiantes asignados, aparecerán aquí.</ThemedText>
              </Card>
            ) : <>
              <SearchBar accessibilityLabel="Buscar estudiante por nombre o usuario" placeholder="Buscar estudiante"
                value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
              {filteredStudents.length === 0 ? (
                <Card style={styles.state}><ThemedText style={styles.body}>No hay estudiantes que coincidan con la búsqueda.</ThemedText></Card>
              ) : filteredStudents.map(item => (
                <Card key={item.estudianteId} style={styles.studentCard}>
                  <ThemedText accessibilityRole="header" style={styles.studentName}>{item.nombreCompleto}</ThemedText>
                  {!!item.username && <ThemedText style={styles.secondaryBody}>Usuario: {item.username}</ThemedText>}
                  <View style={styles.metrics}>
                    <Metric label="Avance global" value={formatPercent(item.porcentajeAvance)} />
                    <Metric label="Unidades globales" value={`${item.unidadesEstudiadas ?? 0} / ${item.totalUnidades ?? 0}`} />
                    <Metric label="Promedio global" value={formatValue(item.promedioNotas)} />
                  </View>
                  <Button title="Revisar lecciones de Cálculo" accessibilityLabel={`Revisar lecciones de Cálculo de ${item.nombreCompleto}`}
                    onPress={() => navigate(() => setStudent(item))} />
                </Card>
              ))}
            </>}
          </View>
        ) : !lesson ? (
          <View style={styles.section}>
            <Card style={styles.summary}>
              <ThemedText accessibilityRole="header" style={styles.sectionTitle}>{student.nombreCompleto}</ThemedText>
              {!!student.username && <ThemedText style={styles.body}>Usuario: {student.username}</ThemedText>}
              <ThemedText style={styles.body}>Lecciones disponibles en Cálculo</ThemedText>
            </Card>
            {lessons.length === 0 ? (
              <Card style={styles.state}><ThemedText style={styles.body}>No hay lecciones de Cálculo disponibles.</ThemedText></Card>
            ) : lessons.map((item, index) => (
              <Card key={item.id} style={styles.lessonCard}>
                <ThemedText style={styles.lessonIndex}>Lección {index + 1} · {item.estado}</ThemedText>
                <ThemedText style={styles.studentName}>{item.titulo}</ThemedText>
                <ThemedText style={styles.secondaryBody}>
                  {item.tieneCuestionario ? 'Cuestionario disponible' : 'Sin cuestionario'}
                </ThemedText>
                <Button title="Ver detalle de resultados" accessibilityLabel={`Ver resultados de ${item.titulo}`}
                  onPress={() => navigate(() => setLesson(item))} />
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Card style={styles.summary}>
              <ThemedText accessibilityRole="header" style={styles.sectionTitle}>{lesson.titulo}</ThemedText>
              <ThemedText style={styles.body}>Estudiante: {student.nombreCompleto}</ThemedText>
              <ThemedText style={styles.body}>Estado de la lección: {data.estadoLeccion ?? 'No disponible'}</ThemedText>
            </Card>
            {!data.tieneCuestionario ? (
              <Card style={styles.state}>
                <ThemedText style={styles.body}>Esta lección no tiene un cuestionario disponible.</ThemedText>
              </Card>
            ) : !hasAttempt ? (
              <Card style={styles.state}>
                <ThemedText style={styles.body}>Este estudiante aún no tiene intentos registrados para esta lección.</ThemedText>
              </Card>
            ) : <>
              <Card style={styles.metricsCard}>
                <Metric label="Nota vigente" value={formatValue(data.notaVigente)} prominent />
                <View style={styles.metrics}>
                  <Metric label="Aciertos" value={formatValue(data.aciertosTotales)} />
                  <Metric label="Desaciertos" value={formatValue(data.desaciertosTotales)} />
                </View>
              </Card>
              {data.detallePreguntas?.map((item, index) => (
                <Card key={item.preguntaId} style={styles.questionCard}>
                  <ThemedText style={styles.lessonIndex}>Pregunta {item.orden ?? index + 1}</ThemedText>
                  <MathText text={item.enunciado} />
                  <ThemedText style={[styles.answerBadge, item.acerto ? styles.correct : styles.incorrect]}>
                    {item.acerto ? 'Correcta' : 'Incorrecta'}
                  </ThemedText>
                  <ThemedText style={styles.body}>Respuesta elegida</ThemedText>
                  <MathText text={item.respuestaDadaTexto ?? 'Sin respuesta'} standalone />
                  <ThemedText style={styles.body}>Respuesta correcta</ThemedText>
                  <MathText text={item.respuestaCorrectaTexto ?? 'No disponible'} standalone />
                  {!!item.solucionExplicacion && <MathText text={item.solucionExplicacion} />}
                </Card>
              ))}
            </>}
          </View>
        )}
    </ScrollView>
  );
}

function Metric({ label, value, prominent = false }) {
  return (
    <View style={[styles.metric, prominent && styles.prominentMetric]}>
      <ThemedText style={styles.secondaryBody}>{label}</ThemedText>
      <ThemedText style={prominent ? styles.metricLarge : styles.metricValue}>{value}</ThemedText>
    </View>
  );
}

function formatPercent(value) {
  return value == null ? 'No disponible' : `${formatValue(value)}%`;
}

function formatValue(value) {
  return value == null ? 'No disponible' : String(value);
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8F9FF' },
  content: { width: '100%', maxWidth: 800, alignSelf: 'center', padding: 16, paddingBottom: 40, gap: 16 },
  section: { gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C3C5D7', borderRadius: 12, padding: 16, gap: 12 },
  hero: { backgroundColor: colors.primary, borderColor: colors.primary },
  heroTitle: { color: '#FFFFFF', fontSize: typography.title, lineHeight: 32, fontWeight: '700' },
  heroBody: { color: '#FFFFFF', fontSize: typography.body, lineHeight: 24 },
  courseButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C3C5D7', borderRadius: 12, alignItems: 'flex-start' },
  courseButtonText: { color: colors.text, fontSize: typography.body, textAlign: 'left', flexShrink: 1 },
  secondaryButton: { backgroundColor: '#E5EEFF', borderRadius: 8 },
  secondaryText: { color: colors.primary },
  state: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24, gap: 12 },
  body: { color: colors.text, fontSize: typography.body, lineHeight: 24 },
  secondaryBody: { color: '#434655', fontSize: typography.body, lineHeight: 24 },
  emptyTitle: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '700', textAlign: 'center' },
  summary: { backgroundColor: '#FFFFFF', borderColor: '#C3C5D7' },
  sectionTitle: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' },
  notice: { backgroundColor: '#E5EEFF', borderColor: '#A8BCE8' },
  studentCard: { backgroundColor: '#FFFFFF', borderColor: '#C3C5D7', gap: 10 },
  studentName: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { flex: 1, minWidth: 125, backgroundColor: '#F4F6FC', borderRadius: 8, padding: 10, gap: 2 },
  metricValue: { color: colors.text, fontSize: typography.body, lineHeight: 24, fontWeight: '700' },
  prominentMetric: { backgroundColor: '#E5EEFF' },
  metricLarge: { color: colors.primary, fontSize: 24, lineHeight: 32, fontWeight: '700' },
  lessonCard: { backgroundColor: '#FFFFFF', borderColor: '#C3C5D7', gap: 8 },
  lessonIndex: { color: '#434655', fontSize: typography.body, lineHeight: 24, fontWeight: '600' },
  metricsCard: { backgroundColor: '#FFFFFF', borderColor: '#C3C5D7', gap: 10 },
  questionCard: { backgroundColor: '#FFFFFF', borderColor: '#C3C5D7', gap: 10 },
  answerBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, fontSize: typography.body, overflow: 'hidden' },
  correct: { backgroundColor: '#DEFBF8', color: '#006A65' },
  incorrect: { backgroundColor: '#FCE8E6', color: '#8C1D18' },
});
