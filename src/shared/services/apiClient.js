import { create } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../config/apiConfig';

export const TOKEN_KEY = 'auth_token';

export const apiClient = create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
