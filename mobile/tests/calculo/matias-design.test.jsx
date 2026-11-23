import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from '@/navigation/AuthNavigator';
import UnitsScreen from '@/modules/calculo/screens/UnitsScreen';
import { useAuth } from '@/shared/context/AuthContext';

jest.mock('@/shared/context/AuthContext', () => ({ useAuth: jest.fn() }));
jest.mock('expo-router', () => ({ useFocusEffect: callback => require('react').useEffect(callback, [callback]) }));

test('login keeps JWT authentication and makes password visibility optional', async () => {
  const login = jest.fn().mockRejectedValue(Object.assign(new Error('Credenciales inválidas'), { status: 401 }));
  useAuth.mockReturnValue({ user: null, login });
  await render(<SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 360, height: 800 },
    insets: { top: 0, right: 0, bottom: 0, left: 0 } }}><AuthNavigator /></SafeAreaProvider>);
  expect(screen.queryByText('Seis materias, un solo lugar.')).toBeNull();
  expect(screen.queryByText('¿La olvidaste?')).toBeNull();
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  await fireEvent.press(screen.getByRole('button', { name: 'Mostrar contraseña' }));
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(false);
  await fireEvent.press(screen.getByRole('button', { name: 'Ocultar contraseña' }));
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  await fireEvent.changeText(screen.getByLabelText('Usuario'), ' estudiante-prueba ');
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'clave-solo-prueba');
  await fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));
  expect(await screen.findByText('Usuario o contraseña incorrectos.')).toBeTruthy();
  expect(login).toHaveBeenCalledWith('estudiante-prueba', 'clave-solo-prueba');
});

test('progress uses server states and history grades without illustrative Figma values', async () => {
  const pending = { slug: 'calculo', unidades: [{ id: 9, titulo: 'Unidad real', estadoUnidad: 'PENDIENTE',
    lecciones: [{ id: 17, titulo: 'Lección real', estado: 'PENDIENTE', tieneCuestionario: true, cuestionarioId: 44 }] }] };
  const studied = JSON.parse(JSON.stringify(pending));
  studied.unidades[0].estadoUnidad = 'ESTUDIADO';
  studied.unidades[0].lecciones[0].estado = 'ESTUDIADO';
  const request = jest.fn().mockResolvedValueOnce(pending).mockResolvedValueOnce(studied)
    .mockResolvedValueOnce([{ id: 8, numeroIntento: 3, aprobado: true, aciertos: 4, calificacion: '5.8',
      fechaEjecucion: '2026-11-20T00:00:00Z', esNotaVigente: true }]);
  useAuth.mockReturnValue({ request });
  const onClose = jest.fn();
  await render(<UnitsScreen progressOnly onClose={onClose} />);
  expect(await screen.findByText('0 / 1')).toBeTruthy();
  expect(screen.getByText('PENDIENTE')).toBeTruthy();
  expect(screen.queryByText(/68%|8\.8|Bloqueada|Octubre 2024|Promedio/)).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Actualizar progreso' }));
  expect(await screen.findByText('1 / 1')).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Ver historial de Lección real' }));
  expect(await screen.findByText('Nota 5.8')).toBeTruthy();
  expect(screen.getByText('4 de 5 aciertos')).toBeTruthy();
  expect(screen.getByText('Nota vigente')).toBeTruthy();
  expect(request.mock.calls).toEqual([['/contenidos/calculo'], ['/contenidos/calculo'], ['/cuestionarios/44/historial']]);
  await fireEvent.press(screen.getByRole('button', { name: 'Volver a mi progreso' }));
  await fireEvent.press(screen.getByRole('button', { name: 'Volver al inicio' }));
  expect(onClose).toHaveBeenCalledTimes(1);
});
