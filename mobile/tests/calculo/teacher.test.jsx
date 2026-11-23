import { fireEvent, render, screen } from '@testing-library/react-native';
import TeacherDashboard from '@/shared/features/teacher-dashboard/TeacherDashboard';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));

const courses = [
  { id: 1, nombre: '4to Medio A', colegio: { id: 1, nombre: 'Colegio Virtu Central' }, totalEstudiantes: 1 },
  { id: 2, nombre: '4to Medio B', colegio: { id: 1, nombre: 'Colegio Virtu Central' }, totalEstudiantes: 0 },
];
const students = {
  curso: { id: 1, nombre: '4to Medio A' },
  totalEstudiantes: 1,
  estudiantes: [{
    estudianteId: 2, nombreCompleto: 'Sofía Valenzuela', username: 'alumno1',
    totalUnidades: 6, unidadesEstudiadas: 2, porcentajeAvance: 33.3, promedioNotas: 7,
  }],
};
const calculus = {
  slug: 'calculo',
  unidades: [{
    id: 10, titulo: 'Derivadas', lecciones: [{
      id: 22, titulo: 'Regla de la cadena', estado: 'ESTUDIADO',
      tieneCuestionario: true, cuestionarioId: 52,
    }],
  }],
};
const report = {
  estudiante: { id: 2, nombreCompleto: 'Sofía Valenzuela', username: 'alumno1' },
  leccion: { id: 22, titulo: 'Regla de la cadena' },
  tieneCuestionario: true,
  estadoLeccion: 'ESTUDIADO',
  notaVigente: 4.5,
  aprobado: true,
  aciertosTotales: 4,
  desaciertosTotales: 1,
  detallePreguntas: [{
    preguntaId: 1, orden: 1, enunciado: 'Deriva $x^2$.', acerto: false,
    respuestaDadaTexto: '$x$', respuestaCorrectaTexto: '$2x$',
    solucionExplicacion: 'La regla de la potencia.',
  }],
};
const docente = { rol: 'DOCENTE', nombreCompleto: 'Prof. Ejemplo' };

function assertReadOnly() {
  expect(screen.queryByText(/editar|eliminar|recalificar|crear cuestionario|crear lección/i)).toBeNull();
}

test('docente revisa sus cursos, alumno y detalle de Cálculo sin controles de edición', async () => {
  const request = jest.fn()
    .mockResolvedValueOnce(courses)
    .mockResolvedValueOnce(students)
    .mockResolvedValueOnce(calculus)
    .mockResolvedValueOnce(report);
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  expect(await screen.findByText('Mis cursos')).toBeTruthy();
  expect(screen.getByRole('button', { name: /4to Medio A.*1 estudiantes/ })).toBeTruthy();
  expect(screen.getByRole('button', { name: /4to Medio B.*0 estudiantes/ })).toBeTruthy();
  assertReadOnly();

  await fireEvent.press(screen.getByRole('button', { name: /Abrir curso 4to Medio A/ }));
  expect(await screen.findByText(/agregados de todas las materias/)).toBeTruthy();
  expect(screen.getByText('Avance global')).toBeTruthy();
  expect(screen.getByText('33.3%')).toBeTruthy();
  expect(screen.getByText('Promedio global')).toBeTruthy();
  assertReadOnly();

  await fireEvent.changeText(screen.getByLabelText('Buscar estudiante por nombre o usuario'), 'alumno1');
  await fireEvent.press(screen.getByRole('button', { name: 'Revisar lecciones de Cálculo de Sofía Valenzuela' }));
  expect(await screen.findByText('Lecciones disponibles en Cálculo')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ver resultados de Regla de la cadena' }));

  expect(await screen.findByText('Nota vigente')).toBeTruthy();
  expect(screen.getByText('4.5')).toBeTruthy();
  expect(screen.getByText('Aciertos')).toBeTruthy();
  expect(screen.getByText('4')).toBeTruthy();
  expect(screen.getByText('Desaciertos')).toBeTruthy();
  expect(screen.getByText('1')).toBeTruthy();
  expect(screen.getByText('Deriva')).toBeTruthy();
  expect(screen.getByLabelText('Fórmula: x^2')).toBeTruthy();
  expect(screen.getByText('Incorrecta')).toBeTruthy();
  expect(screen.getByText('Respuesta elegida')).toBeTruthy();
  expect(screen.getByLabelText('Fórmula: x')).toBeTruthy();
  expect(screen.getByLabelText('Fórmula: 2x')).toBeTruthy();
  expect(screen.getByText('La regla de la potencia.')).toBeTruthy();
  assertReadOnly();
  expect(request.mock.calls).toEqual([
    ['/docente/cursos'],
    ['/docente/cursos/1/estudiantes'],
    ['/contenidos/calculo'],
    ['/docente/estudiantes/2/lecciones/22'],
  ]);
});

test('shows an explicit empty state for the course with no students', async () => {
  const request = jest.fn()
    .mockResolvedValueOnce(courses)
    .mockResolvedValueOnce({
      curso: { id: 2, nombre: '4to Medio B' },
      totalEstudiantes: 0,
      estudiantes: [],
    });
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  await fireEvent.press(await screen.findByRole('button', { name: /Abrir curso 4to Medio B/ }));
  expect(await screen.findByText('Este curso aún no tiene estudiantes registrados.')).toBeTruthy();
  assertReadOnly();
  expect(request).toHaveBeenNthCalledWith(2, '/docente/cursos/2/estudiantes');
});

test('shows a no-attempt state when a Cálculo lesson has no report data', async () => {
  const request = jest.fn()
    .mockResolvedValueOnce(courses)
    .mockResolvedValueOnce(students)
    .mockResolvedValueOnce(calculus)
    .mockResolvedValueOnce({
      estudiante: { id: 2 }, leccion: { id: 22 }, tieneCuestionario: true,
      estadoLeccion: 'PENDIENTE', notaVigente: null, aciertosTotales: 0,
      desaciertosTotales: 0, detallePreguntas: [],
    });
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  await fireEvent.press(await screen.findByRole('button', { name: /Abrir curso 4to Medio A/ }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Revisar lecciones de Cálculo de Sofía Valenzuela' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Ver resultados de Regla de la cadena' }));
  expect(await screen.findByText('Este estudiante aún no tiene intentos registrados para esta lección.')).toBeTruthy();
  assertReadOnly();
});

test('handles forbidden lesson reports without exposing previous report data', async () => {
  const forbidden = Object.assign(new Error('Permisos insuficientes.'), { status: 403 });
  const request = jest.fn()
    .mockResolvedValueOnce(courses)
    .mockResolvedValueOnce(students)
    .mockResolvedValueOnce(calculus)
    .mockRejectedValueOnce(forbidden);
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  await fireEvent.press(await screen.findByRole('button', { name: /Abrir curso 4to Medio A/ }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Revisar lecciones de Cálculo de Sofía Valenzuela' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Ver resultados de Regla de la cadena' }));
  expect(await screen.findByText('No tienes autorización para consultar este curso, estudiante o lección.')).toBeTruthy();
  expect(screen.queryByText('Sofía Valenzuela · Regla de la cadena')).toBeNull();
  expect(screen.queryByText('Nota vigente')).toBeNull();
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  assertReadOnly();
});

test('handles a missing lesson report with a retry state', async () => {
  const missing = Object.assign(new Error('No encontrado.'), { status: 404 });
  const request = jest.fn()
    .mockResolvedValueOnce(courses)
    .mockResolvedValueOnce(students)
    .mockResolvedValueOnce(calculus)
    .mockRejectedValueOnce(missing);
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  await fireEvent.press(await screen.findByRole('button', { name: /Abrir curso 4to Medio A/ }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Revisar lecciones de Cálculo de Sofía Valenzuela' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Ver resultados de Regla de la cadena' }));
  expect(await screen.findByText('El curso, estudiante o lección solicitado ya no está disponible.')).toBeTruthy();
  expect(screen.queryByText('Nota vigente')).toBeNull();
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
});

test('shows a course empty state and allows retry when no courses are assigned', async () => {
  const request = jest.fn().mockResolvedValue([]);
  useAuth.mockReturnValue({ request, user: docente });

  await render(<TeacherDashboard name="Prof. Ejemplo" />);
  expect(await screen.findByText('No tienes cursos asignados actualmente.')).toBeTruthy();
  assertReadOnly();
});

test('does not make requests for non-teacher roles', async () => {
  const request = jest.fn();
  useAuth.mockReturnValue({ request, user: { rol: 'ESTUDIANTE' } });

  await render(<TeacherDashboard name="Estudiante" />);
  expect(screen.getByText('Acceso disponible solo para docentes.')).toBeTruthy();
  expect(request).not.toHaveBeenCalled();
});
