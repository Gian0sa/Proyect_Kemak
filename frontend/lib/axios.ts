import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://localhost:7143/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* =========================
   INTERCEPTOR REQUEST
========================= */
api.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const { token } = JSON.parse(auth);
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          localStorage.removeItem('auth');
        }
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

/* =========================
   INTERCEPTOR RESPONSE
========================= */
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('auth');
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
