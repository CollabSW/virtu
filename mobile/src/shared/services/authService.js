import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { apiRequest } from './database';

const TOKEN_KEY = 'virtu_session';
const native = Platform.OS !== 'web';

function validateUser(user) {
  if (user?.rol !== 'ESTUDIANTE' && user?.rol !== 'DOCENTE') {
    throw new Error('Esta cuenta no tiene un rol habilitado en Virtu.');
  }
  return user;
}

export async function login(username, password) {
  const result = await apiRequest('/auth/login', { body: { username, password } });
  const usuario = validateUser(result?.usuario);
  if (typeof result.token !== 'string' || !result.token) {
    throw new Error('Virtu no devolvió una sesión válida.');
  }
  if (native) await SecureStore.setItemAsync(TOKEN_KEY, result.token);
  return { token: result.token, usuario };
}

export async function registerStudent({ username, password, nombreCompleto, colegioId, cursoId }) {
  return apiRequest('/auth/register', {
    body: { username, password, nombreCompleto, colegioId, cursoId, rol: 'ESTUDIANTE' },
  });
}

export async function getMe(token) {
  return validateUser(await apiRequest('/auth/me', { token }));
}

export async function getToken() {
  return native ? SecureStore.getItemAsync(TOKEN_KEY) : null;
}

export async function logout() {
  if (native) await SecureStore.deleteItemAsync(TOKEN_KEY);
}
