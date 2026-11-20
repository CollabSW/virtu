import { fireEvent, render, screen } from '@testing-library/react-native';
import UnitsScreen from '@/modules/calculo/screens/UnitsScreen';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({
  useFocusEffect: callback => require('react').useEffect(callback, [callback]),
}));

const content = (estado, quizId) => ({
  slug: 'calculo',
  unidades: [{
    id: 10,
    titulo: 'Derivadas',
    estadoUnidad: estado,
    lecciones: [{ id: 20, titulo: 'Regla de la cadena', estado, tieneCuestionario: quizId !== null, cuestionarioId: quizId }],
  }],
});

test('refreshes official progress and only opens history for a quiz supplied by the API', async () => {
  const request = jest.fn()
    .mockResolvedValueOnce(content('PENDIENTE', null))
    .mockResolvedValueOnce(content('ESTUDIADO', 52))
    .mockResolvedValueOnce([{
      id: 71, numeroIntento: 2, aprobado: true, aciertos: 4, calificacion: 6.1,
      fechaEjecucion: '2026-11-20T00:00:00Z', esNotaVigente: true,
    }]);
  useAuth.mockReturnValue({ request });

  await render(<UnitsScreen />);
  expect(await screen.findByText('Regla de la cadena · PENDIENTE')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /Ver historial/ })).toBeNull();

  await fireEvent.press(screen.getByRole('button', { name: 'Actualizar progreso' }));
  expect(await screen.findByText('Regla de la cadena · ESTUDIADO')).toBeTruthy();
  expect(request).toHaveBeenNthCalledWith(2, '/contenidos/calculo');

  await fireEvent.press(screen.getByRole('button', { name: 'Ver historial de Regla de la cadena' }));
  expect(await screen.findByText('4 de 5 aciertos · Nota 6.1')).toBeTruthy();
  expect(screen.getByText('Nota vigente')).toBeTruthy();
  expect(request).toHaveBeenNthCalledWith(3, '/cuestionarios/52/historial');
});
