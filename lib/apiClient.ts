import axios, { AxiosError } from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://hollow-lucretia-rodrigo-de-prat-9197ad55.koyeb.app/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token
apiClient.interceptors.request.use(
  config => {
    try {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    return config;
  },
  error => Promise.reject(error),
);

// Interceptor para manejar errores 401 y refrescar el token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        // Solicitar un nuevo access_token
        const { data } = await apiClient.post('/auth/refresh', {
          refresh_token: refreshToken,
        });

        // Guardar el nuevo access_token
        localStorage.setItem('access_token', data.access_token);

        // Actualizar el header Authorization y reintentar la solicitud original
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Error al refrescar el token:', refreshError);

        // Type guard to check if refreshError is an AxiosError
        if (axios.isAxiosError(refreshError)) {
          if (
            refreshError.response?.status === 401 ||
            refreshError.response?.status === 403
          ) {
            // Si el refresh token es inválido, eliminar ambos tokens
            if (typeof window !== "undefined") {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              window.location.href = '/login';
            }
          }
        }
      }
    }

    return Promise.reject(error);
  },
);
