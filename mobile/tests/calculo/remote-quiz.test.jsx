import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import RemoteQuizScreen from '@/shared/features/quiz/screens/RemoteQuizScreen';
import { startQuiz } from '@/shared/features/quiz/quizService';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('@/shared/features/quiz/components/FeedbackModal', () => ({
  FeedbackModal: ({ visible, onContinue, explanation }) => {
    const { Text, Pressable } = require('react-native');
    return visible ? <><Text>{explanation}</Text><Pressable accessibilityRole="button"
      accessibilityLabel="Continuar" onPress={onContinue}><Text>Continuar</Text></Pressable></> : null;
  },
}));

const questions = Array.from({ length: 5 }, (_, i) => ({
  id: 101 + i, orden: i + 1, enunciado: `Pregunta ${i + 1}`,
  opciones: Array.from({ length: 4 }, (_, j) => ({ id: 1001 + i * 4 + j, texto: `Opción ${i + 1}-${j + 1}` })),
}));
const attempt = { intentoId: 71, leccion: { id: 22 }, totalPreguntas: 5,
  tiempoLimiteSegundos: null, preguntas: questions };

test('rejects a malformed quiz before rendering any answers', async () => {
  await expect(startQuiz(jest.fn().mockResolvedValue({ ...attempt, preguntas: questions.slice(0, 4) }), 52, 22))
    .rejects.toThrow(/cuestionario inválido/);
});

test('confirms five answers, shows the server grade and refreshes progress before a retry', async () => {
  const request = jest.fn(async (path, body) => {
    if (path.endsWith('/iniciar')) return attempt;
    if (path.endsWith('/responder')) return { preguntaId: body.preguntaId, esCorrecta: true,
      explicacion: 'Explicación oficial' };
    return { intentoId: 71, totalPreguntas: 5, aciertos: 4, aprobado: true, calificacion: '5.8' };
  });
  useAuth.mockReturnValue({ request });
  const refresh = jest.fn().mockResolvedValue(undefined);
  await render(<RemoteQuizScreen quizId={52} lessonId={22} close={jest.fn()} onProgressChanged={refresh} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Comenzar intento' }));
  for (let i = 1; i <= 5; i++) {
    await fireEvent.press(await screen.findByRole('radio', { name: `Opción ${i}-1` }));
    await fireEvent.press(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    expect(await screen.findByText('Explicación oficial')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
  }
  expect(await screen.findByText('Nota oficial: 5.8')).toBeTruthy();
  expect(screen.getByText('4 de 5 aciertos')).toBeTruthy();
  expect(refresh).toHaveBeenCalledTimes(1);
  expect(request).toHaveBeenCalledWith('/intentos/71/finalizar', {});
  expect(screen.queryByText(/Tiempo restante/)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar cuestionario' }));
  expect(await screen.findByRole('radio', { name: 'Opción 1-1' })).toBeTruthy();
});

test('uses a countdown only when supplied by the server and allows finalization on expiry', async () => {
  jest.useFakeTimers();
  try {
    const request = jest.fn().mockResolvedValue({ ...attempt, tiempoLimiteSegundos: 2 });
    useAuth.mockReturnValue({ request });
    await render(<RemoteQuizScreen quizId={52} lessonId={22} close={jest.fn()} onProgressChanged={jest.fn()} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Comenzar intento' }));
    await act(async () => { jest.advanceTimersByTime(3000); });
    expect(screen.getByText('Se agotó el tiempo establecido por el servidor.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Comprobar respuesta' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Finalizar intento' })).toBeTruthy();
  } finally { jest.useRealTimers(); }
});

test('keeps an uncertain submitted answer locked and retries only the same selection', async () => {
  const request = jest.fn().mockResolvedValueOnce(attempt).mockRejectedValueOnce(new Error('Sin conexión'));
  useAuth.mockReturnValue({ request });
  await render(<RemoteQuizScreen quizId={52} lessonId={22} close={jest.fn()} onProgressChanged={jest.fn()} />);
  await fireEvent.press(screen.getByRole('button', { name: 'Comenzar intento' }));
  await fireEvent.press(await screen.findByRole('radio', { name: 'Opción 1-1' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Comprobar respuesta' }));
  expect(await screen.findByText(/La selección queda bloqueada/)).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Opción 1-2' }).props.accessibilityState.disabled).toBe(true);
  request.mockRejectedValueOnce(new Error('Sin conexión'));
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar confirmación' }));
  await waitFor(() => expect(request).toHaveBeenCalledTimes(3));
  expect(request.mock.calls[1]).toEqual(request.mock.calls[2]);
  expect(request.mock.calls[1]).toEqual(['/intentos/71/responder', { preguntaId: 101, opcionSeleccionadaId: 1001 }]);
});
