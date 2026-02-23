import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Inyecta el JWT automáticamente en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pettime_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el token expira, redirige al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pettime_token');
      localStorage.removeItem('pettime_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
