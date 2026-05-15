import axios from 'axios';

// En desarrollo con Expo, 'localhost' no funciona para el backend.
// Se debe usar la IP de la máquina o la URL de NGROK.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1'; 

import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para incluir el token en las peticiones
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para debugging (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
