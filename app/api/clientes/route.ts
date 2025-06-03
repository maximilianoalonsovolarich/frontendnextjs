import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import axios from "axios"

/**
 * Handler para GET /api/clientes
 * Obtiene la lista de clientes desde el backend
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const apiUrl = process.env.BACKEND_URL
    if (!apiUrl) {
      return NextResponse.json({ error: "API no disponible - Error de configuración del servidor" }, { status: 503 })
    }

    try {
      const response = await axios.get(`${apiUrl}/clientes`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })

      return NextResponse.json(response.data)
    } catch (axiosError: any) {
      console.error("Error al obtener clientes:", axiosError)

      // Respuesta genérica para evitar mostrar datos hardcodeados
      return NextResponse.json(
        { error: "API no disponible - Servicio de clientes temporalmente no disponible" },
        { status: 503 },
      )
    }
  } catch (error: any) {
    console.error("Error al obtener clientes:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
