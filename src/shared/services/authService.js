import * as SecureStore from 'expo-secure-store';
import { ROLES } from '../../config/roles';
import { apiClient, TOKEN_KEY } from './apiClient';

export const USE_MOCK = true;

// Referencia local del contrato: src/shared/context/AuthContext.jsx.
// Solo se persiste el token; nunca las credenciales ni el usuario.
function getMockUsuario(token) {
  const colegio = { id: 1, nombre: 'Colegio Virtu Central' };
  if (token === 'mock-token-2') {
    return {
      id: 2,
      username: 'alumno1',
      nombreCompleto: 'Sofía Valenzuela',
      rol: ROLES.ESTUDIANTE,
      colegio,
      curso: { id: 1, nombre: '4to Medio A' },
    };
  }
  if (token === 'mock-token-1') {
    return {
      id: 1,
      username: 'profesor1',
      nombreCompleto: 'Prof. Carlos Mendoza',
      rol: ROLES.DOCENTE,
      colegio,
      cursos: [
        { id: 1, nombre: '4to Medio A' },
        { id: 2, nombre: '4to Medio B' },
      ],
    };
  }
  throw new Error('Sesión no válida. Inicia sesión nuevamente.');
}

function authError(error, fallback) {
  const apiMessage = error?.response?.data?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return new Error(apiMessage);
  }
  if (error?.request && !error.response) {
    return new Error('No se pudo conectar con el servidor. Intenta nuevamente.');
  }
  // No propagar objetos Axios: pueden contener la contraseña en config.data.
  return new Error(fallback);
}

export async function login(username, password) {
  if (USE_MOCK) {
    let token;
    if (username === 'alumno1' && password === 'Estudiante123!') {
      token = 'mock-token-2';
    } else if (username === 'profesor1' && password === 'Docente123!') {
      token = 'mock-token-1';
    } else {
      throw new Error('Usuario o contraseña incorrectos');
    }
    const data = { token, usuario: getMockUsuario(token) };
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      return data.usuario;
    } catch {
      throw new Error('No se pudo guardar la sesión. Intenta nuevamente.');
    }
  }

  try {
    const { data } = await apiClient.post('/auth/login', { username, password });
    if (typeof data?.token !== 'string' || !data.token || !data.usuario) {
      throw new Error('Respuesta de autenticación no válida.');
    }
    await SecureStore.setItemAsync(TOKEN_KEY, data.token);
    return data.usuario;
  } catch (error) {
    throw authError(error, 'No se pudo iniciar sesión. Intenta nuevamente.');
  }
}

export async function getMe() {
  if (USE_MOCK) {
    return getMockUsuario(await getToken());
  }
  try {
    const { data } = await apiClient.get('/auth/me');
    if (!data?.usuario) {
      throw new Error('Respuesta de usuario no válida.');
    }
    return data.usuario;
  } catch (error) {
    throw authError(error, 'No se pudo obtener el usuario actual.');
  }
}

export async function getToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    throw new Error('No se pudo leer la sesión guardada.');
  }
}

export async function logout() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    throw new Error('No se pudo eliminar la sesión. Intenta nuevamente.');
  }
}

export const authService = { login, getMe, getToken, logout };

export default authService;
