import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/shared/components/Button';
import { Header } from '@/shared/components/Header';
import MathText from '@/shared/components/MathText';
import { useAuth } from '@/shared/context/AuthContext';
import { APP_SLUG } from '@/config/apiConfig';

export default function TeacherDashboard({ name }) {
  const { request } = useAuth();
  const [course, setCourse] = useState(null);
  const [student, setStudent] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    const path = lesson ? `/docente/estudiantes/${student.estudianteId}/lecciones/${lesson.id}`
      : student ? `/contenidos/${APP_SLUG}`
        : course ? `/docente/cursos/${course.id}/estudiantes` : '/docente/cursos';
    request(path).then(value => {
      if ((!course && !Array.isArray(value)) || (student && !lesson && value?.slug !== APP_SLUG)
        || (student && !lesson && (!Array.isArray(value?.unidades)
          || value.unidades.some(unit => !Array.isArray(unit?.lecciones))))
        || (course && !student && !Array.isArray(value?.estudiantes))
        || (lesson && (value?.leccion?.id !== lesson.id || value?.estudiante?.id !== student.estudianteId))) {
        throw new Error('El servidor devolvió un reporte inválido.');
      }
      if (active) setData(value);
    }).catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [request, course, student, lesson, retry]);

  function navigate(change) {
    setData(null);
    setError('');
    change();
  }

  return (
    <View style={{ gap: 12 }}>
      <Header title="Inicio docente" subtitle={name} />
      {course && <Button title="Volver" onPress={() => navigate(() => {
        if (lesson) setLesson(null);
        else if (student) setStudent(null);
        else setCourse(null);
      })} />}
      {error ? <><ThemedText accessibilityRole="alert">{error}</ThemedText>
        <Button title="Reintentar consulta" onPress={() => navigate(() => setRetry(value => value + 1))} /></>
        : !data ? <ActivityIndicator accessibilityLabel="Cargando reporte docente" />
          : !course ? <>
            <ThemedText>Mis cursos</ThemedText>
            {!data.length && <ThemedText>No hay cursos asignados.</ThemedText>}
            {data.map(item => <Button key={item.id} title={item.nombre} onPress={() => navigate(() => setCourse(item))} />)}
          </> : !student ? <>
            <ThemedText>{course.nombre} · Estudiantes</ThemedText>
            <ThemedText>El avance agregado de la API incluye todas las materias. Consulta una lección de Cálculo para ver su resultado específico.</ThemedText>
            {!data.estudiantes.length && <ThemedText>No hay estudiantes en este curso.</ThemedText>}
            {data.estudiantes.map(item => <Button key={item.estudianteId} title={item.nombreCompleto} onPress={() => navigate(() => setStudent(item))} />)}
          </> : !lesson ? <>
            <ThemedText>{student.nombreCompleto} · Lecciones de Cálculo</ThemedText>
            {data.unidades.flatMap(unit => unit.lecciones).map(item =>
              <Button key={item.id} title={item.titulo} onPress={() => navigate(() => setLesson(item))} />)}
          </> : <>
            <ThemedText>{student.nombreCompleto} · {lesson.titulo}</ThemedText>
            <ThemedText>Estado: {data.estadoLeccion}</ThemedText>
            <ThemedText>Nota vigente: {data.notaVigente ?? 'Sin nota'}</ThemedText>
            {data.aciertosTotales != null && <ThemedText>Aciertos: {data.aciertosTotales} · Desaciertos: {data.desaciertosTotales}</ThemedText>}
            {data.detallePreguntas?.map(item => <View key={item.preguntaId}>
              <MathText text={item.enunciado} />
              <ThemedText>Respuesta:</ThemedText>
              <MathText text={item.respuestaDadaTexto ?? 'Sin respuesta'} standalone />
              <ThemedText>Solución:</ThemedText>
              <MathText text={item.respuestaCorrectaTexto} standalone />
              <MathText text={item.solucionExplicacion} />
            </View>)}
          </>}
    </View>
  );
}
