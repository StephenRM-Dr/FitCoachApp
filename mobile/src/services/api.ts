import axios from "axios";

import { useAuthStore } from "../store/authStore";

// En desarrollo con Expo, 'localhost' no funciona para el backend.
// Se debe usar la IP de la máquina o la URL de NGROK.
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
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
  },
);

// Interceptor de respuesta: logging solo en desarrollo y cierre de sesión
// automático si el token fue revocado o expiró (401).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.error("API Error:", error.response?.data || error.message);
    }

    const { isAuthenticated, logout } = useAuthStore.getState();
    const isAuthRoute = ["/login", "/register", "/password/reset"].some(
      (path) => error.config?.url?.includes(path),
    );

    if (error.response?.status === 401 && isAuthenticated && !isAuthRoute) {
      logout();
    }

    return Promise.reject(error);
  },
);

export default api;
