/**
 * @route GET/POST /api/accounts/search
 * @description Busca cuentas en el backend según el término de búsqueda proporcionado
 * @note Soporta tanto GET (parámetros de URL) como POST (JSON en body)
 */
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import axios, { type AxiosError } from "axios"

/**
 * Maneja solicitudes GET para búsqueda de cuentas
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Extraer el término de búsqueda de la URL
    const searchTerm = request.nextUrl.searchParams.get("term")
    if (!searchTerm) {
      return NextResponse.json({ error: "Se requiere un término de búsqueda" }, { status: 400 })
    }

    // Obtener URL del backend desde variables de entorno
    const apiUrl = process.env.BACKEND_URL
    if (!apiUrl) {
      console.error("BACKEND_URL no está configurado")
      return NextResponse.json({ error: "API no disponible - Error de configuración del servidor" }, { status: 503 })
    }

    try {
      // Intentar realizar la llamada al backend
      const response = await axios.get(`${apiUrl}/api/search/accounts`, {
        params: { term: searchTerm },
        headers: { Authorization: `Bearer ${session.accessToken}` },
        timeout: 10000, // 10 segundos de timeout
      })

      return NextResponse.json(response.data)
    } catch (axiosError) {
      const error = axiosError as AxiosError
      console.error("Error en la búsqueda de cuentas:", error.message)

      // Manejar diferentes tipos de errores
      if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
        return NextResponse.json({ error: "API no disponible - Servicio de búsqueda no accesible" }, { status: 503 })
      }

      if (error.response) {
        // El servidor respondió con un código de error
        const statusCode = error.response.status
        const errorMessage = error.response.data?.error || "Error en el servicio de búsqueda"

        return NextResponse.json({ error: errorMessage }, { status: statusCode })
      }

      // Error genérico
      return NextResponse.json(
        { error: "API no disponible - Servicio de búsqueda temporalmente no disponible" },
        { status: 503 },
      )
    }
  } catch (error) {
    // Manejar errores generales
    console.error("Error en /api/accounts/search:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

/**
 * Maneja solicitudes POST para búsqueda de cuentas
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Extraer el término de búsqueda del cuerpo de la solicitud
    const requestData = await request.json()
    const terminoBusqueda = requestData.term || ""
    
    console.log("Datos recibidos en POST:", requestData) // Log para depuración
    
    if (!terminoBusqueda || terminoBusqueda.length < 2) {
      return NextResponse.json({ error: "Se requiere un término de búsqueda de al menos 2 caracteres" }, { status: 400 })
    }

    // Obtener URL del backend desde variables de entorno
    const backendUrl = process.env.BACKEND_URL
    if (!backendUrl) {
      console.error("BACKEND_URL no está configurado")
      return NextResponse.json({ error: "API no disponible - Error de configuración del servidor" }, { status: 503 })
    }

    try {
      // Llamada al backend con el nuevo formato
      const response = await axios.post(
        `${backendUrl}/search`,
        {
          user: session.user.id, // ID del usuario de la sesión
          search_index: "find:Account",
          search_parameter: "Name",
          search_value: terminoBusqueda,
          search_type: "TEXT",
          return_values: ["Name", "ID"]
        },
        {
          headers: {
            "Content-Type": "application/json",
            ...(session.accessToken && { Authorization: `Bearer ${session.accessToken}` }),
          },
          timeout: 10000, // 10 segundos de timeout
        }
      )

      return NextResponse.json(response.data)
    } catch (axiosError) {
      const error = axiosError as AxiosError
      console.error("Error en la búsqueda de cuentas POST:", error.message)

      // Manejar diferentes tipos de errores
      if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
        return NextResponse.json({ error: "API no disponible - Servicio de búsqueda no accesible" }, { status: 503 })
      }

      if (error.response) {
        // El servidor respondió con un código de error
        const statusCode = error.response.status
        const errorMessage = error.response.data?.error || "Error en el servicio de búsqueda"

        return NextResponse.json({ error: errorMessage }, { status: statusCode })
      }

      // Error genérico
      return NextResponse.json(
        { error: "API no disponible - Servicio de búsqueda temporalmente no disponible" },
        { status: 503 },
      )
    }
  } catch (error) {
    // Manejar errores generales
    console.error("Error en /api/accounts/search POST:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
