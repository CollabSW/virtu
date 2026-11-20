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
