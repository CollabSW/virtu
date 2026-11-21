import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import UnitsScreen from '@/modules/calculo/screens/UnitsScreen';
import LessonScreen from '@/modules/calculo/screens/LessonScreen';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ useFocusEffect: callback => require('react').useEffect(callback, [callback]) }));
jest.mock('@/shared/features/quiz/components/FeedbackModal', () => ({
  FeedbackModal: ({ visible, onContinue }) => {
    const { Pressable, Text } = require('react-native');
    return visible ? <Pressable accessibilityRole="button" accessibilityLabel="Continuar"
      onPress={onContinue}><Text>Continuar</Text></Pressable> : null;
  },
}));
const content = state => ({ slug: 'calculo', unidades: [{ id: 2, titulo: 'Derivadas', estadoUnidad: state,
  lecciones: [{ id: 22, titulo: 'La regla', estado: state, tieneCuestionario: false, cuestionarioId: null }] }] });
const lesson = state => ({ id: 22, titulo: 'La regla', unidad: { materiaSlug: 'calculo' },
  definicion: 'Teoría', ejemplo: 'Ejemplo', estadoEstudiante: state, tieneCuestionario: false });

test('refreshes the backend state after marking a lesson and returns to updated units', async () => {
  let state = 'PENDIENTE';
  const request = jest.fn(async (path) => {
    if (path.endsWith('/marcar-estudiado')) { state = 'ESTUDIADO'; return { estado: state }; }
    return path === '/contenidos/calculo' ? content(state) : lesson(state);
  });
  useAuth.mockReturnValue({ request });
  await render(<UnitsScreen />);
  await fireEvent.press(await screen.findByRole('button', { name: 'Abrir La regla' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Marcar como estudiada' }));
  await waitFor(() => expect(request).toHaveBeenCalledWith('/lecciones/22/marcar-estudiado', {}));
  expect(await screen.findByText('Estado: ESTUDIADO')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Volver a unidades' }));
  expect(await screen.findByText('La regla · ESTUDIADO')).toBeTruthy();
});

test('rejects a lesson from another subject', async () => {
  useAuth.mockReturnValue({ request: jest.fn().mockResolvedValue({ ...lesson('PENDIENTE'), unidad: { materiaSlug: 'historia' } }) });
  await render(<LessonScreen id={22} close={jest.fn()} onProgressChanged={jest.fn()} />);
  expect(await screen.findByText('La lección recibida no pertenece a Cálculo.')).toBeTruthy();
  expect(screen.queryByText('Teoría')).toBeNull();
});

test('refreshes units and history after completing the remote quiz through the lesson screen', async () => {
  let state = 'PENDIENTE';
  const questions = Array.from({ length: 5 }, (_, i) => ({ id: 100 + i, orden: i + 1,
    enunciado: `Pregunta ${i + 1}`, opciones: Array.from({ length: 4 }, (_, j) => ({
      id: 1000 + i * 4 + j, texto: `Alternativa ${i + 1}-${j + 1}`,
    })) }));
  const request = jest.fn(async (path, body) => {
    if (path === '/contenidos/calculo') {
      const data = content(state);
      Object.assign(data.unidades[0].lecciones[0], { tieneCuestionario: true, cuestionarioId: 52 });
      return data;
    }
    if (path === '/lecciones/22') return { ...lesson(state), tieneCuestionario: true, cuestionarioId: 52 };
    if (path.endsWith('/iniciar')) return { intentoId: 71, totalPreguntas: 5, leccion: { id: 22 }, preguntas: questions };
    if (path.endsWith('/responder')) return { preguntaId: body.preguntaId, esCorrecta: true, explicacion: 'Respuesta del servidor' };
    if (path.endsWith('/finalizar')) {
      state = 'ESTUDIADO';
      return { intentoId: 71, totalPreguntas: 5, aciertos: 4, aprobado: true, calificacion: '5.8' };
    }
    if (path.endsWith('/historial')) return [{ id: 71, numeroIntento: 1, aciertos: 4,
      aprobado: true, calificacion: '5.8', esNotaVigente: true, fechaEjecucion: '2026-11-21T05:17:11Z' }];
    throw new Error(`Unexpected request: ${path}`);
  });
  useAuth.mockReturnValue({ request });
  await render(<UnitsScreen />);
  expect(await screen.findByText('La regla · PENDIENTE')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Abrir La regla' }));
  await fireEvent.press(await screen.findByRole('button', { name: 'Abrir cuestionario' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Comenzar intento' }));
  for (let i = 1; i <= 5; i++) {
    await fireEvent.press(await screen.findByRole('radio', { name: `Alternativa ${i}-1` }));
    await fireEvent.press(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Continuar' }));
  }
  expect(await screen.findByText('Nota oficial: 5.8')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Volver a la lección' }));
  expect(await screen.findByText('Estado: ESTUDIADO')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Volver a unidades' }));
  expect(await screen.findByText('La regla · ESTUDIADO')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ver historial de La regla' }));
  expect(await screen.findByText('4 de 5 aciertos')).toBeTruthy();
  expect(screen.getByText('Nota 5.8')).toBeTruthy();
  expect(screen.getByText('Nota vigente')).toBeTruthy();
});
