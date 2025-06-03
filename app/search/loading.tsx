import { Loader2 } from "lucide-react"

/**
 * @component SearchLoading
 * @description Componente de carga para la página de búsqueda en inglés
 */
export default function SearchLoading() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-xl font-medium text-gray-700">Loading...</h2>
        <p className="text-gray-500 mt-2">Please wait while we load the search page</p>
      </div>
    </div>
  )
}
