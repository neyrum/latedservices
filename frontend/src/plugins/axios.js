import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_URL, // URL base del backend
  timeout: 10000, // Tiempo de espera máximo para una solicitud
  headers: {
    'Content-Type': 'application/json', // Tipo de contenido predeterminado
  },
});

// Interceptor para agregar el token JWT automáticamente en cada solicitud
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Obtener token de la sesión
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Si la solicitud incluye un FormData, no sobrescribir el Content-Type
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
  }, error => Promise.reject(error));

// Interceptor para manejar errores globalmente
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          localStorage.removeItem("token"); // Eliminar token de la sesión

     // ✅ Mostramos una alerta antes de redirigir
          alert("Tu sesión ha expirado. Serás redirigido al login.");
          window.location.href = "/login";
          break;

        case 403:
          alert("No tienes permisos para realizar esta acción.");
          break;

        case 500:
          console.error("Error interno del servidor:", error.response.data);
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default instance;