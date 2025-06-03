"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Search, X, AlertCircle } from "lucide-react"
import { searchAccounts, getAccountDetails, type Account, type AccountDetail } from "@/lib/api/accounts"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

/**
 * @component SearchPage
 * @description Página de búsqueda de cuentas/clientes en inglés
 */
export default function SearchPage() {
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
            console.error("Search error:", err)

            // Verificar si el error indica que la API no está disponible
            if (err.error && err.error.includes("API no disponible")) {
              setApiUnavailable(true)
              setError("The search service is currently unavailable. Please try again later.")
            } else {
              setError(err.error || "Error searching for accounts. Please try again.")
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
      console.error("Error loading details:", err)

      // Verificar si el error indica que la API no está disponible
      if (err.error && err.error.includes("API no disponible")) {
        setApiUnavailable(true)
        setError("The details service is currently unavailable. Please try again later.")
      } else {
        setError(err.error || "Could not load account details")
      }

      setSelectedAccount(null)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Renderizar un mensaje de "Not available" para datos faltantes
  const renderNotAvailable = (label: string) => (
    <div className="p-2 bg-gray-50 rounded">
      <span className="font-medium">{label}:</span> <span className="text-gray-500 italic">Not available</span>
    </div>
  )

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <header className="my-4">
        <h1 className="text-2xl font-bold">Order Dashboard</h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="mb-4 sticky top-4">
            <CardHeader>
              <CardTitle className="text-base">Menu</CardTitle>
            </CardHeader>
            <div className="divide-y">
              <div className="px-4 py-2 bg-primary/10 font-medium">Create Order</div>
              <div className="px-4 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                View Orders
              </div>
              <div className="px-4 py-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                Reports
              </div>
            </div>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:col-span-3">
          <Card className="shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle>Create New Order</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={(e) => e.preventDefault()}>
                {/* Client search section */}
                <div className="mb-6">
                  <label htmlFor="client-search" className="block text-sm font-medium mb-2">
                    Client
                  </label>
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="client-search"
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search for a client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                        className="w-full pl-10 pr-10 focus:ring-2 focus:ring-primary/20 transition-all"
                        aria-label="Search for a client"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="absolute right-3 p-1 rounded-full hover:bg-gray-100"
                          aria-label="Clear search"
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
                            <span className="ml-2 text-sm text-gray-600">Searching...</span>
                          </div>
                        ) : apiUnavailable ? (
                          <div className="p-4 text-center text-amber-600 flex flex-col items-center">
                            <AlertCircle className="h-5 w-5 mb-1" />
                            <span>API unavailable</span>
                          </div>
                        ) : results.length > 0 ? (
                          <ul className="max-h-60 overflow-auto divide-y">
                            {results.map((account) => (
                              <li
                                key={account.ID}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => selectAccount(account.ID, account.Name)}
                                role="option"
                                aria-selected={selectedAccountName === account.Name}
                              >
                                <div className="font-medium">{account.Name}</div>
                                {/* Ocultamos el ID como solicitado */}
                              </li>
                            ))}
                          </ul>
                        ) : searchTerm.length >= 2 ? (
                          <div className="p-4 text-center text-gray-500">No results found for "{searchTerm}"</div>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Enter at least 2 characters to search</p>
                </div>

                {/* API Unavailable Alert */}
                {apiUnavailable && (
                  <Alert variant="warning" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      API unavailable - The data service is currently unavailable. Please try again later.
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
                            {selectedAccount.account?.Status || "Not available"}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {/* Account details */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Account Information</h6>
                            {selectedAccount.account ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Name:</span>{" "}
                                  {selectedAccount.account?.Name || "Not available"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Code:</span>{" "}
                                  {selectedAccount.account?.Code || "Not available"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">VAT Number:</span>{" "}
                                  {selectedAccount.account?.VATNumber || "Not available"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Status:</span>{" "}
                                  {selectedAccount.account?.Status || "Not available"}
                                </div>
                                <div className="p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Country:</span>{" "}
                                  {selectedAccount.account?.Country || "Not available"}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                {renderNotAvailable("Name")}
                                {renderNotAvailable("Code")}
                                {renderNotAvailable("VAT Number")}
                                {renderNotAvailable("Status")}
                                {renderNotAvailable("Country")}
                              </div>
                            )}
                          </div>

                          {/* Contacts */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Contacts</h6>
                            {selectedAccount.contacts && selectedAccount.contacts.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedAccount.contacts.map((contact: any, idx: number) => (
                                  <div key={idx} className="text-sm border rounded p-3 bg-gray-50">
                                    <div className="font-medium text-primary">
                                      {contact.data?.FirstName || "Not available"} {contact.data?.LastName || ""}
                                    </div>
                                    <div className="mt-1 flex items-center">
                                      <span className="mr-1" aria-hidden="true">
                                        📧
                                      </span>
                                      <span>{contact.data?.Email || "Not available"}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <span className="mr-1" aria-hidden="true">
                                        📱
                                      </span>
                                      <span>{contact.data?.Phone || "Not available"}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-gray-500">No contacts available</div>
                            )}
                          </div>

                          {/* Addresses */}
                          <div className="p-4">
                            <h6 className="font-semibold mb-3 text-primary">Addresses</h6>
                            {selectedAccount.addresses && selectedAccount.addresses.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedAccount.addresses.map((address: any, idx: number) => (
                                  <div key={idx} className="text-sm border rounded p-3 bg-gray-50">
                                    <div className="font-medium text-primary">
                                      {address.data?.Type || "Not available"}
                                    </div>
                                    <div className="mt-1">{address.data?.Street || "Not available"}</div>
                                    <div>
                                      {address.data?.City || "Not available"}
                                      {address.data?.PostalCode ? `, ${address.data.PostalCode}` : ""}
                                    </div>
                                    <div>{address.data?.Country || "Not available"}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-3 text-gray-500">No addresses available</div>
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
                    <span className="ml-3 text-gray-600">Loading details...</span>
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
                    Search and select a client to view their details
                  </div>
                )}

                <div className="flex justify-end mt-6">
                  <Button
                    type="button"
                    disabled={!selectedAccount}
                    className="px-6 py-2 bg-primary text-white rounded-md disabled:opacity-50 hover:bg-primary/90 transition-colors shadow-sm flex items-center"
                    onClick={() => alert("Order creation functionality will be implemented in the next phase.")}
                  >
                    <span>Continue</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 ml-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
