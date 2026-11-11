import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// ---------------------------------------------------------------------------
// MOCK DE AUTENTICACIÓN
// TODO C1-06: reemplazar por authService.login / authService.logout
//   1. Importar: import { authService } from '../services/authService';
//   2. Cambiar `authApi` por `authService` (o borrar este bloque completo).
// El mock respeta el formato del contrato de la API: { token, usuario }.
// ---------------------------------------------------------------------------
const MOCK_COLEGIO = { id: 1, nombre: 'Colegio Virtu Central' };

const MOCK_USUARIOS = {
  alumno1: {
    password: 'Estudiante123!',
    usuario: {
      id: 2,
      username: 'alumno1',
      nombreCompleto: 'Sofía Valenzuela',
      rol: 'ESTUDIANTE',
      colegio: MOCK_COLEGIO,
      curso: { id: 1, nombre: '4to Medio A' },
    },
  },
  profesor1: {
    password: 'Docente123!',
    usuario: {
      id: 1,
      username: 'profesor1',
      nombreCompleto: 'Prof. Carlos Mendoza',
      rol: 'DOCENTE',
      colegio: MOCK_COLEGIO,
      cursos: [
        { id: 1, nombre: '4to Medio A' },
        { id: 2, nombre: '4to Medio B' },
      ],
    },
  },
};

const authApi = {
  async login(username, password) {
    const registro = MOCK_USUARIOS[username];
    if (!registro || registro.password !== password) {
      throw new Error('Usuario o contraseña incorrectos');
    }
    return { token: `mock-token-${registro.usuario.id}`, usuario: registro.usuario };
  },
  async logout() {},
};
// --------------------------- FIN DEL MOCK ----------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  const login = useCallback(async (username, password) => {
    const respuesta = await authApi.login(username, password);
    setToken(respuesta.token);
    setUsuario(respuesta.usuario);
    return respuesta.usuario;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setToken(null);
      setUsuario(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      token,
      rol: usuario?.rol ?? null,
      estaAutenticado: Boolean(token && usuario),
      login,
      logout,
    }),
    [usuario, token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
