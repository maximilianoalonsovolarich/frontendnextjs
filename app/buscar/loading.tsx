import { Loader2 } from "lucide-react"

/**
 * @component BuscarLoading
 * @description Componente de carga para la página de búsqueda en español
 */
export default function BuscarLoading() {
  return (
    <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-4 text-xl font-medium text-gray-700">Cargando...</h2>
        <p className="text-gray-500 mt-2">Por favor espere mientras cargamos la página de búsqueda</p>
      </div>
    </div>
  )
}
