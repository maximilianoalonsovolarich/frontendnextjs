/**
 * @route GET /api/account/[accountId]/details
 * @description Obtiene los detalles de una cuenta específica desde el backend
 */
import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import axios, { type AxiosError } from "axios"

export async function GET(request: NextRequest, { params }: { params: { accountId: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Validar el ID de cuenta
    const { accountId } = params
    if (!accountId) {
      return NextResponse.json({ error: "Se requiere el ID de la cuenta" }, { status: 400 })
    }

    // Obtener URL del backend desde variables de entorno
    const backendUrl = process.env.BACKEND_URL
    if (!backendUrl) {
      console.error("BACKEND_URL no está configurado")
      return NextResponse.json({ error: "API no disponible - Error de configuración del servidor" }, { status: 503 })
    }

    // TODO: Implementar la conexión real al backend cuando esté disponible
    console.log(`Solicitud de detalles para la cuenta ${accountId} - Endpoint aun no implementado`)
    
    // Devolver datos ficticios o un mensaje indicando que la funcionalidad aún no está disponible
    return NextResponse.json({
      account: {
        Name: "Datos no disponibles",
        Code: "PLACEHOLDER",
        VATNumber: "No disponible",
        Status: "Pendiente",
        Country: "No disponible"
      },
      contacts: [
        {
          data: {
            FirstName: "Funcionalidad",
            LastName: "No Implementada",
            Email: "api.pendiente@ejemplo.com",
            Phone: "No disponible"
          }
        }
      ],
      addresses: [
        {
          data: {
            Type: "Principal",
            Street: "Endpoint en desarrollo",
            City: "No disponible",
            PostalCode: "00000",
            Country: "No disponible"
          }
        }
      ],
      _placeholder: true, // Indicador de que estos son datos de prueba
      _message: "La API de detalles aún no está implementada en el backend"
    })
    
    // Este código nunca se ejecutará ya que hemos reemplazado la conexión al backend
    // Lo mantenemos comentado como referencia para cuando el endpoint real esté disponible
    /*
    try {
      const response = await axios.get(`${backendUrl}/api/account/${accountId}/details`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        timeout: 10000, // 10 segundos de timeout
      })

      return NextResponse.json(response.data)
    } catch (axiosError) {
      const error = axiosError as AxiosError
      console.error("Error al obtener detalles de la cuenta:", error.message)

      // Manejar diferentes tipos de errores
      if (error.code === "ECONNREFUSED" || error.code === "ECONNABORTED") {
        return NextResponse.json({ error: "API no disponible - Servicio de detalles no accesible" }, { status: 503 })
      }

      if (error.response) {
        // El servidor respondió con un código de error
        const statusCode = error.response.status
        const errorMessage = error.response.data?.error || "Error en el servicio de detalles"

        return NextResponse.json({ error: errorMessage }, { status: statusCode })
      }

      // Error genérico
      return NextResponse.json(
        { error: "API no disponible - Servicio de detalles temporalmente no disponible" },
        { status: 503 },
      )
    }
    */
  } catch (error) {
    // Manejar errores generales
    console.error("Error al obtener detalles de la cuenta:", error)

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
