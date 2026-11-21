import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/shared/services/database';
import * as authService from '@/shared/services/authService';

/** @type {import('react').Context<{
 * user: { rol: 'ESTUDIANTE' | 'DOCENTE', nombreCompleto: string } | null,
 * restoring: boolean, restoreError: string, notice: string,
 * restore: () => void, login: (username: string, password: string) => Promise<void>,
 * logout: () => Promise<void>, request: (path: string, body?: object) => Promise<unknown>
 * } | null>} */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const token = useRef(null);
  const [user, setUser] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState('');
  const [notice, setNotice] = useState('');

  const logout = useCallback(async () => {
    await authService.logout();
    token.current = null;
    setUser(null);
  }, []);

  const restore = useCallback(async () => {
    try {
      const saved = await authService.getToken();
      if (!saved) return;
      const current = await authService.getMe(saved);
      token.current = saved;
      setUser(current);
    } catch (error) {
      if (error.status === 401 || error.sessionExpired) {
        try {
          await logout();
          setNotice('Tu sesión venció. Vuelve a iniciar sesión.');
        } catch {
          setRestoreError('No se pudo borrar la sesión vencida.');
        }
      } else {
        setRestoreError('No se pudo verificar la sesión. Inténtalo de nuevo.');
      }
    } finally {
      setRestoring(false);
    }
  }, [logout]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return restore();
    });
    return () => { active = false; };
  }, [restore]);

  function retryRestore() {
    if (restoring) return;
    setRestoring(true);
    setRestoreError('');
    void restore();
  }

  async function login(username, password) {
    const result = await authService.login(username, password);
    token.current = result.token;
    setNotice('');
    setUser(result.usuario);
  }

  const request = useCallback(async (path, body) => {
    const active = token.current;
    if (!active) throw new Error('Inicia sesión para continuar.');
    try {
      return await apiRequest(path, { token: active, body });
    } catch (error) {
      if ((error.status === 401 || error.sessionExpired) && token.current === active) {
        token.current = null;
        try {
          await authService.logout();
          setNotice('Tu sesión venció. Vuelve a iniciar sesión.');
        } catch {
          setNotice('Tu sesión venció y no se pudo borrar del dispositivo. Vuelve a iniciar sesión.');
        } finally {
          setUser(null);
        }
      }
      throw error;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, restoring, restoreError, notice, restore: retryRestore, login, logout, request }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('AuthProvider es necesario para usar la sesión.');
  return auth;
}
