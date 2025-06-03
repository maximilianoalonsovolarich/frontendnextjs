/**
 * @module http/api-client
 * @description Cliente HTTP centralizado para todas las llamadas a la API
 */
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios"

/**
 * Cliente API centralizado para todas las llamadas al backend
 * Configurado con la URL base definida en las variables de entorno
 */
const apiClient = axios.create({
  baseURL: "/api", // Usamos la URL base fija para evitar problemas con las variables de entorno
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
})

/**
 * Interceptor de peticiones para logging y manejo de headers
 */
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig): AxiosRequestConfig => {
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        method: config.method,
        url: config.url,
        params: config.params,
      })
    }
    return config
  },
  (error): Promise<never> => {
    console.error("API Request Error:", error.message || error)
    return Promise.reject(error)
  },
)

/**
 * Interceptor de respuestas para logging y manejo de errores
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        status: response.status,
        url: response.config.url,
      })
    }
    return response
  },
  (error): Promise<never> => {
    if (error.response) {
      console.error("API Response Error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      })
    } else if (error.request) {
      console.error("API No Response Error:", error.message || error)
    } else {
      console.error("API Config Error:", error.message || error)
    }
    return Promise.reject(error)
  },
)

export default apiClient
