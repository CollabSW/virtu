import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthNavigator from '@/navigation/AuthNavigator';
import { API_BASE_URL } from '@/config/apiConfig';

jest.mock('@/shared/context/AuthContext', () => ({
  useAuth: () => ({ user: null, restoring: false, restoreError: '', notice: '' }),
}));

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test('validates the course, handles duplicate usernames and returns to login after registration', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({ ok: false, status: 409, json: async () => ({ message: 'El nombre de usuario ya está en uso' }) })
    .mockResolvedValueOnce({ ok: true, status: 201, json: async () => ({ status: 'success', data: {} }) });
  await render(
    <SafeAreaProvider initialMetrics={{
      frame: { x: 0, y: 0, width: 360, height: 800 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    }}>
      <AuthNavigator />
    </SafeAreaProvider>,
  );

  await fireEvent.press(screen.getByRole('button', { name: 'Crear cuenta' }));
  await fireEvent.changeText(screen.getByLabelText('Nombre completo'), 'Nombre de prueba');
  await fireEvent.changeText(screen.getByLabelText('Usuario'), 'usuario_prueba');
  await fireEvent.changeText(screen.getByLabelText('Contraseña'), 'test-only-password');
  await fireEvent.changeText(screen.getByLabelText('ID de colegio'), '12');
  await fireEvent.changeText(screen.getByLabelText('ID de curso'), '3.5');
  await fireEvent.press(screen.getByRole('button', { name: 'Registrarme' }));
  expect(screen.getByText('Ingresa un ID de colegio y de curso válido.')).toBeTruthy();
  expect(global.fetch).not.toHaveBeenCalled();

  await fireEvent.changeText(screen.getByLabelText('ID de curso'), '35');
  await fireEvent.press(screen.getByRole('button', { name: 'Registrarme' }));
  expect(await screen.findByText('El nombre de usuario ya está en uso')).toBeTruthy();
  const [[url, { method, body }]] = global.fetch.mock.calls;
  expect(url).toBe(API_BASE_URL + '/auth/register');
  expect(method).toBe('POST');
  expect(JSON.parse(body)).toEqual({
    rol: 'ESTUDIANTE', nombreCompleto: 'Nombre de prueba', username: 'usuario_prueba',
    password: 'test-only-password', colegioId: 12, cursoId: 35,
  });

  await fireEvent.changeText(screen.getByLabelText('Usuario'), 'usuario_nuevo');
  await fireEvent.press(screen.getByRole('button', { name: 'Registrarme' }));
  expect(await screen.findByText('Cuenta creada. Ya puedes iniciar sesión.')).toBeTruthy();
  expect(screen.getByLabelText('Usuario').props.value).toBe('usuario_nuevo');
  expect(screen.getByLabelText('Contraseña').props.value).toBe('');
});
