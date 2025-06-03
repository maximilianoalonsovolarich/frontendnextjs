/**
 * @module api/accounts/types
 * @description Tipos e interfaces para el módulo de cuentas
 */

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
