/**
 * @module http/error-handler
 * @description Manejo centralizado de errores de API
 */
import { AxiosError } from "axios"

/**
 * Maneja errores de API de manera centralizada
 * @param error Error capturado
 * @param defaultMessage Mensaje por defecto si no se puede determinar el error
 * @returns Error formateado para mostrar al usuario
 */
export const handleApiError = (error: unknown, defaultMessage = "Error en la solicitud") => {
  // Si es un error de Axios, extraer información relevante
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const message = error.response?.data?.message || error.message

    // Manejar diferentes tipos de errores según el código de estado
    switch (status) {
      case 401:
        throw { error: "No autorizado. Por favor, inicie sesión nuevamente." }
      case 403:
        throw { error: "No tiene permisos para acceder a este recurso." }
      case 404:
        throw { error: "Recurso no encontrado." }
      case 500:
        throw { error: "Error interno del servidor. Intente nuevamente más tarde." }
      default:
        throw { error: message || defaultMessage }
    }
  }

  // Para otros tipos de errores
  throw { error: defaultMessage }
}
