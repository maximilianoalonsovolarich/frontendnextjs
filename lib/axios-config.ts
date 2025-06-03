import axios from 'axios';

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor solo para cliente (para evitar problemas con serverExternalPackages)
if (typeof window !== 'undefined') {
  // Importamos getSession dinámicamente solo en el cliente
  import('next-auth/react').then(({ getSession }) => {
    axiosInstance.interceptors.request.use(
      async (config) => {
        try {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        } catch (error) {
          console.error('Error getting session:', error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const session = await getSession();
            
            if (session?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${session.accessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            window.location.href = '/';
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  });
}

export default axiosInstance;
