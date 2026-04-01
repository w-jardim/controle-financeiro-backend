import axios from 'axios';
import { getToken, clearToken } from '../../utils/storage';

// Se `VITE_API_URL` não estiver definido em desenvolvimento, usar o prefixo `/api`
// isso faz com que chamadas relativas sejam encaminhadas ao backend (ex: http://localhost:3000/api/... via proxy ou reverse)
const baseURL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      if (logoutCallback) {
        logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

