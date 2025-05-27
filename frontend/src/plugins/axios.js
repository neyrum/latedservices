import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://10.4.27.11:3000/api', // URL base del backend
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido predeterminado
  },
});

// Interceptor para agregar el token JWT automáticamente en cada solicitud
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si la solicitud incluye un FormData, no sobrescribir el Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// Interceptor para manejar errores globalmente
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Elimina token si está vencido
      window.location.href = "/login"; // Redirige al usuario al login
    }
    return Promise.reject(error);
  }
);

export default instance;
