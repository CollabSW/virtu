import { API_BASE_URL } from '@/config/apiConfig';

// Data access goes through the Virtu API.

export async function apiRequest(path, { token = '', body = undefined } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(API_BASE_URL + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw Object.assign(new Error(payload?.message || 'Virtu no pudo completar la solicitud.'), {
        status: response.status,
        sessionExpired: response.status === 401 || (response.status === 403
          && /token.*(inv[aá]lido|no es v[aá]lido|expir|venc)|jwt.*(expired|invalid)/i.test(payload?.message || '')),
      });
    }
    if (payload?.status !== 'success' || !('data' in payload)) {
      throw Object.assign(new Error('Virtu devolvió una respuesta inválida.'), { status: response.status });
    }
    return payload.data;
  } catch (error) {
    if (error.status) throw error;
    throw new Error('No se pudo conectar con Virtu. Revisa tu conexión e inténtalo de nuevo.');
  } finally {
    clearTimeout(timeout);
  }
}
