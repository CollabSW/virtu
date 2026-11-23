import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider, useAuth } from '@/shared/context/AuthContext';
import { API_BASE_URL } from '@/config/apiConfig';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const originalFetch = global.fetch;
const student = { rol: 'ESTUDIANTE', nombreCompleto: 'Estudiante de prueba' };
const teacher = { rol: 'DOCENTE', nombreCompleto: 'Docente de prueba' };

function response(status, data) {
  return { ok: status === 200, status, json: async () => ({ status: 'success', data }) };
}

beforeEach(() => {
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

afterEach(() => { global.fetch = originalFetch; });

test('restores from /auth/me and discards a session rejected by a protected request', async () => {
  SecureStore.getItemAsync.mockResolvedValue('stored-test-token');
  global.fetch.mockResolvedValueOnce(response(200, student)).mockResolvedValueOnce(response(401));
  const { result } = await renderHook(useAuth, { wrapper: AuthProvider });

  await waitFor(() => expect(result.current.user).toEqual(student));
  expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/auth/me', expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer stored-test-token' }),
  }));

  await act(async () => {
    await expect(result.current.request('/contenidos/calculo')).rejects.toMatchObject({ status: 401 });
  });
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('virtu_session');
  expect(result.current.user).toBeNull();
});

test('uses the official login envelope and persists only the token', async () => {
  SecureStore.getItemAsync.mockResolvedValue(null);
  global.fetch.mockResolvedValueOnce(response(200, { token: 'teacher-test-token', usuario: teacher }));
  const { result } = await renderHook(useAuth, { wrapper: AuthProvider });

  await waitFor(() => expect(result.current.restoring).toBe(false));
  await act(async () => { await result.current.login('docente-test', 'test-only-password'); });

  expect(result.current.user).toEqual(teacher);
  expect(SecureStore.setItemAsync).toHaveBeenCalledWith('virtu_session', 'teacher-test-token');
  expect(global.fetch).toHaveBeenCalledWith(API_BASE_URL + '/auth/login', expect.objectContaining({ method: 'POST' }));
});

test.each([
  ['El token proporcionado no es válido', true],
  ['Permisos insuficientes. Se requiere rol: DOCENTE', false],
])('distinguishes expired sessions from permission errors: %s', async (message, expired) => {
  SecureStore.getItemAsync.mockResolvedValue('stored-test-token');
  global.fetch.mockResolvedValueOnce(response(200, student)).mockResolvedValueOnce({
    ok: false, status: 403, json: async () => ({ message }),
  });
  const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.user).toEqual(student));
  await act(async () => { await expect(result.current.request('/contenidos/calculo')).rejects.toMatchObject({ status: 403 }); });
  expect(result.current.user).toEqual(expired ? null : student);
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(expired ? 1 : 0);
});

test.each([student, teacher])('restores $rol after remount and removes the saved session on logout', async user => {
  let saved = null;
  SecureStore.getItemAsync.mockImplementation(async () => saved);
  SecureStore.setItemAsync.mockImplementation(async (_key, value) => { saved = value; });
  SecureStore.deleteItemAsync.mockImplementation(async () => { saved = null; });
  global.fetch.mockResolvedValueOnce(response(200, { token: 'session-test-token', usuario: user }))
    .mockResolvedValueOnce(response(200, user));
  const initial = await renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(initial.result.current.restoring).toBe(false));
  await act(async () => { await initial.result.current.login('test-user', 'test-only-password'); });
  await initial.unmount();
  const restored = await renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(restored.result.current.user).toEqual(user));
  expect(global.fetch).toHaveBeenLastCalledWith(API_BASE_URL + '/auth/me', expect.objectContaining({
    headers: expect.objectContaining({ Authorization: 'Bearer session-test-token' }),
  }));
  await act(async () => { await restored.result.current.logout(); });
  expect(saved).toBeNull();
  expect(restored.result.current.user).toBeNull();
  await expect(restored.result.current.request('/contenidos/calculo')).rejects.toThrow('Inicia sesión');
});

test('rejects an expired session during restore without opening a protected screen', async () => {
  SecureStore.getItemAsync.mockResolvedValue('expired-test-token');
  global.fetch.mockResolvedValueOnce({ ok: false, status: 403,
    json: async () => ({ message: 'El token ha expirado' }) });
  const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.restoring).toBe(false));
  expect(result.current.user).toBeNull();
  expect(result.current.notice).toMatch(/sesión venció/);
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('virtu_session');
});

test('keeps a saved session on network failure and verifies it on retry', async () => {
  SecureStore.getItemAsync.mockResolvedValue('stored-test-token');
  global.fetch.mockRejectedValueOnce(new Error('Network unavailable')).mockResolvedValueOnce(response(200, student));
  const { result } = await renderHook(useAuth, { wrapper: AuthProvider });
  await waitFor(() => expect(result.current.restoreError).toBeTruthy());
  expect(result.current.user).toBeNull();
  expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  await act(async () => { result.current.restore(); });
  await waitFor(() => expect(result.current.user).toEqual(student));
  expect(result.current.restoreError).toBe('');
});
