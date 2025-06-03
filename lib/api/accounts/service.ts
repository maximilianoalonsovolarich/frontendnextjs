/**
 * @module api/accounts/service
 * @description Servicios para la gestión de cuentas/clientes
 */
import { AxiosError } from "axios"
import apiClient from "@/lib/http/api-client"
import { handleApiError } from "@/lib/http/error-handler"
import type { Account, AccountDetail } from "./types"

/**
 * Busca cuentas usando la API
 * @param term Término de búsqueda (mínimo 2 caracteres)
 * @returns Promise con array de cuentas que coinciden con el término
 * @throws {Error} Si la API no está disponible o hay un error en la búsqueda
 */
export const searchAccounts = async (term: string): Promise<Account[]> => {
  try {
    // Validación del término de búsqueda
    if (!term || term.length < 2) {
      return []
    }

    // Llamada a la API usando el nuevo formato de solicitud para el backend actualizado
    // Usamos la ruta correcta según la estructura de directorios
    const response = await apiClient.post<{ results: Account[], total: number }>("/accounts/search", {
      term // La ruta de la API se encargará de agregar el resto de los parámetros
    })

    // Manejo defensivo de la respuesta para evitar el error "Cannot read properties of undefined"
    console.log("Respuesta recibida del servidor:", response.data)
    
    // Si la respuesta tiene la estructura esperada, devolver results
    if (response.data && Array.isArray(response.data.results)) {
      return response.data.results
    }
    
    // Si la respuesta es un array directamente
    if (Array.isArray(response.data)) {
      return response.data
    }
    
    // Si la respuesta es un objeto con la propiedad 'results' que no es un array
    if (response.data && response.data.results) {
      return [response.data.results].flat()
    }
    
    // En caso de que no podamos extraer resultados válidos
    console.error("Formato de respuesta inesperado:", response.data)
    return []
  } catch (error) {
    if (error instanceof AxiosError && error.code === "ECONNREFUSED") {
      throw { error: "API no disponible - Servicio de búsqueda no accesible" }
    }
    // Manejo directo del error sin depender de la función handleApiError
    if (error instanceof AxiosError && error.response) {
      throw { error: error.response.data?.error || "Error en el servidor" }
    } else {
      throw { error: "Error en la búsqueda de cuentas" }
    }
  }
}

/**
 * Obtiene los detalles de una cuenta específica
 * @param accountId ID de la cuenta
 * @returns Promise con los detalles de la cuenta
 * @throws {Error} Si la API no está disponible o hay un error al obtener los detalles
 */
export const getAccountDetails = async (accountId: string): Promise<AccountDetail> => {
  try {
    // Validación del ID de cuenta
    if (!accountId) {
      throw new Error("Se requiere el ID de la cuenta")
    }

    // Llamada a la API usando la ruta correcta según la documentación
    const response = await apiClient.get<AccountDetail>(`/account/${accountId}/details`)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.code === "ECONNREFUSED") {
      throw { error: "API no disponible - Servicio de detalles no accesible" }
    }
    return handleApiError(error, "Error al obtener detalles de la cuenta")
  }
}
