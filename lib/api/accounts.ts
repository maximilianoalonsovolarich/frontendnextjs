/**
 * @module api/accounts
 * @description Módulo de API para la gestión de cuentas/clientes
 */
import apiClient from "@/lib/http/api-client"
import { AxiosError } from "axios"

/**
 * Interfaz para los resultados de búsqueda de cuentas
 */
export interface Account {
  id: string
  key?: string
  name: string
}

/**
 * Interfaz para los detalles de una cuenta
 */
export interface AccountDetail {
  account: {
    Name: string
    Code: string
    VATNumber: string
    Status: string
    Country: string
    // Otros campos que puedan venir del backend
  } | null
  contacts:
    | Array<{
        data: {
          FirstName: string
          LastName: string
          Email: string
          Phone: string
        }
      }>
    | []
  addresses:
    | Array<{
        data: {
          Type: string
          Street: string
          City: string
          PostalCode: string
          Country: string
        }
      }>
    | []
}

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

    // Llamada a la API usando el nuevo formato de solicitud
    // Usamos la ruta correcta según la estructura de directorios
    const response = await apiClient.post<{ results: Account[], total: number }>("/accounts/search", {
      term // La ruta de la API se encargará de agregar el resto de los parámetros
    })

    // Manejo defensivo de la respuesta para evitar el error "Cannot read properties of undefined"
    console.log("Respuesta recibida del servidor (accounts.ts):", response.data)
    
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
    console.error("Formato de respuesta inesperado (accounts.ts):", response.data)
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
    // Manejo directo del error sin depender de la función handleApiError
    if (error instanceof AxiosError && error.response) {
      throw { error: error.response.data?.error || "Error en el servidor" }
    } else {
      throw { error: "Error al obtener detalles de la cuenta" }
    }
  }
}
