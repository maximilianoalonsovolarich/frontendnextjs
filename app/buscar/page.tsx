"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, X, AlertCircle } from "lucide-react"
import { searchAccounts, getAccountDetails, type Account, type AccountDetail } from "@/lib/api/accounts"
import { Alert, AlertDescription } from "@/components/ui/alert"

/**
 * @component BuscarPage
 * @description Página de búsqueda de cuentas/clientes en español
 */
export default function BuscarPage() {
  // Estados para la búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<AccountDetail | null>(null)
  const [selectedAccountName, setSelectedAccountName] = useState<string>("")

  // Estados de UI
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiUnavailable, setApiUnavailable] = useState(false)

  // Referencias para manejo de UI
  const searchResultsRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cerrar resultados cuando se hace clic fuera del área de búsqueda
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchResultsRef.current &&
        searchInputRef.current &&
        !searchResultsRef.current.contains(e.target as Node) &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Función para limpiar la búsqueda
  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setResults([])
    setShowResults(false)
    setError(null)
    setApiUnavailable(false)
    setSelectedAccount(null)
  }, [])

  // Efecto para realizar la búsqueda cuando cambia el término
  useEffect(() => {
    const controller = new AbortController()

    const performSearch = async () => {
      if (searchTerm.length >= 2) {
        setLoading(true)
        setError(null)
        setApiUnavailable(false)
        setShowResults(true)

        try {
          const data = await searchAccounts(searchTerm)
          if (!controller.signal.aborted) {
            setResults(data)
          }
        } catch (err: any) {
          if (!controller.signal.aborted) {
            console.error("Error en la búsqueda:", err)

            // Verificar si el error indica que la API no está disponible
            if (err.error && err.error.includes("API no disponible")) {
              setApiUnavailable(true)
              setError("El servicio de búsqueda no está disponible en este momento. Por favor, inténtelo más tarde.")
            } else {
              setError(err.error || "Error al buscar cuentas. Por favor, intente nuevamente.")
            }

            setResults([])
          }
        } finally {
          if (!controller.signal.aborted) {
            setLoading(false)
          }
        }
      } else {
        setResults([])
        setShowResults(false)
      }
    }

    // Cancelar la búsqueda anterior
    const searchTimeout = setTimeout(performSearch, 300) // Debounce de 300ms para evitar demasiadas llamadas

    return () => {
      clearTimeout(searchTimeout)
      controller.abort()
    }
  }, [searchTerm])

  // Función para seleccionar una cuenta y cargar sus detalles
  const selectAccount = async (accountId: string, accountName: string) => {
    setSearchTerm(accountName)
    setSelectedAccountName(accountName)
    setShowResults(false)
    setLoadingDetails(true)
    setError(null)
    setApiUnavailable(false)

    try {
      const details = await getAccountDetails(accountId)
      setSelectedAccount(details)
    } catch (err: any) {
      console.error("Error al cargar detalles:", err)

      // Verificar si el error indica que la API no está disponible
      if (err.error && err.error.includes("API no disponible")) {
        setApiUnavailable(true)
        setError("El servicio de detalles no está disponible en este momento. Por favor, inténtelo más tarde.")
      } else {
        setError(err.error || "No se pudieron cargar los detalles de la cuenta")
      }

      setSelectedAccount(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Renderizar un mensaje de "No disponible" para datos faltantes
  const renderNoDisponible = (label: string) => (
    <div className="p-2 bg-gray-50 rounded">
      <span className="font-medium">{label}:</span> <span className="text-gray-500 italic">No disponible</span>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="my-4">
        <h1 className="text-2xl font-bold">Panel de Búsqueda</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="mb-4 sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Menú</CardTitle>
            </CardHeader>
            <div className="divide-y">
              <div className="px-4 py-2 bg-primary/10 font-medium">Buscar Clientes</div>
              <div className="px-4 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Ver Pedidos
              </div>
              <div className="px-4 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Informes
              </div>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle>Búsqueda de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Client search section */}
                <div className="mb-6">
                  <label htmlFor="client-search" className="block text-sm font-medium mb-2">
                    Cliente
                  </label>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="client-search"
                        ref={searchInputRef}
                        type="text"
                        placeholder="Buscar clientes..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                        className="w-full pl-10 pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                        aria-label="Buscar clientes"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-3 p-1 rounded-full hover:bg-gray-100"
                          aria-label="Limpiar búsqueda"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                        </button>
                      )}
                    </div>

                    {/* Search results dropdown */}
                    {showResults && (
                      <div
                        ref={searchResultsRef}
                        className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md border overflow-hidden animate-in fade-in duration-200"
                        role="listbox"
                      >
                        {loading ? (
                          <div className="flex justify-center items-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-gray-600">Buscando...</span>
                          </div>
                        ) : apiUnavailable ? (
                          <div className="p-4 text-center text-amber-600 flex flex-col items-center">
                            <AlertCircle className="h-5 w-5 mb-1" />
                            <span>API no disponible</span>
                          </div>
                        ) : results.length > 0 ? (
                          <ul className="max-h-60 overflow-auto divide-y">
                            {results.map((account) => (
                              <li
                                key={account.id}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => selectAccount(account.id, account.name)}
                                role="option"
                                aria-selected={selectedAccountName === account.name}
                              >
                                <div className="font-medium">{account.name}</div>
                                <div className="text-xs text-gray-500">ID: {account.id}</div>
                              </li>
                            ))}
                          </ul>
                        ) : searchTerm.length >= 2 ? (
                          <div className="p-4 text-center text-gray-500">
                            No se encontraron resultados para "{searchTerm}"
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Ingrese al menos 2 caracteres para buscar</p>
                </div>

                {/* API Unavailable Alert */}
                {apiUnavailable && (
                  <Alert variant="warning" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      API no disponible - El servicio de datos no está disponible en este momento. Por favor, inténtelo
                      más tarde.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Selected account details */}
                {selectedAccount && (
                  <div className="mt-6">
                    <Card className="border-2 border-primary/20 shadow-sm">
                      <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="text-lg flex items-center">
                          <span className="mr-2">{selectedAccountName}</span>
                          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                            {selectedAccount.account?.Status || "No disponible"}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {/* Account details */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Información de la Cuenta</h6>
                            {selectedAccount.account ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Nombre:</span>{" "}
                                  {selectedAccount.account?.Name || "No disponible"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Código:</span>{" "}
                                  {selectedAccount.account?.Code || "No disponible"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">NIF/CIF:</span>{" "}
                                  {selectedAccount.account?.VATNumber || "No disponible"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Estado:</span>{" "}
                                  {selectedAccount.account?.Status || "No disponible"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">País:</span>{" "}
                                  {selectedAccount.account?.Country || "No disponible"}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {renderNoDisponible("Nombre")}
                                {renderNoDisponible("Código")}
                                {renderNoDisponible("NIF/CIF")}
                                {renderNoDisponible("Estado")}
                                {renderNoDisponible("País")}
                              </div>
                            )}
                          </div>

                          {/* Contacts */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Contactos</h6>
                            {selectedAccount.contacts && selectedAccount.contacts.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedAccount.contacts.map((contact: any, idx: number) => (
                                  <div key={idx} className="text-sm border rounded p-3 bg-gray-50">
                                    <div className="font-medium text-primary">
                                      {contact.data?.FirstName || "No disponible"} {contact.data?.LastName || ""}
                                    </div>
                                    <div className="mt-1 flex items-center">
                                      <span className="mr-1" aria-hidden="true">
                                        📧
                                      </span>
                                      <span>{contact.data?.Email || "No disponible"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="mr-1" aria-hidden="true">
                                        📱
                                      </span>
                                      <span>{contact.data?.Phone || "No disponible"}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-gray-500">No hay contactos disponibles</div>
                            )}
                          </div>

                          {/* Addresses */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Direcciones</h6>
                            {selectedAccount.addresses && selectedAccount.addresses.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedAccount.addresses.map((address: any, idx: number) => (
                                  <div key={idx} className="text-sm border rounded p-3 bg-gray-50">
                                    <div className="font-medium text-primary">
                                      {address.data?.Type || "No disponible"}
                                    </div>
                                    <div className="mt-1">{address.data?.Street || "No disponible"}</div>
                                    <div>
                                      {address.data?.City || "No disponible"}
                                      {address.data?.PostalCode ? `, ${address.data.PostalCode}` : ""}
                                    </div>
                                    <div>{address.data?.Country || "No disponible"}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-gray-500">No hay direcciones disponibles</div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Loading indicator for details */}
                {loadingDetails && (
                  <div
                    className="flex justify-center items-center py-6 my-4 bg-gray-50 rounded-lg border border-gray-200"
                    aria-live="polite"
                  >
                    <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                    <span className="ml-3 text-gray-600">Cargando detalles...</span>
                  </div>
                )}

                {/* Error message */}
                {error && !apiUnavailable && (
                  <div
                    className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded mb-6 mt-4 flex items-start"
                    role="alert"
                  >
                    <span className="mr-3" aria-hidden="true">
                      ⚠️
                    </span>
                    <span>{error}</span>
                  </div>
                )}

                {!selectedAccount && !loadingDetails && searchTerm.length < 2 && !apiUnavailable && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 mt-4">
                    Busque y seleccione un cliente para ver sus detalles
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
