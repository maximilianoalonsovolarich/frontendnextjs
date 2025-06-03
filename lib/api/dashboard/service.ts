/**
 * @module api/dashboard/service
 * @description Servicios para obtener datos del dashboard
 */
import { AxiosError } from "axios"
import apiClient from "@/lib/http/api-client"
import { handleApiError } from "@/lib/http/error-handler"

// Tipos para los datos del dashboard
interface DashboardMetric {
  title: string
  value: string
  change: string
  icon: any
  description: string
}

interface RecentSale {
  client: string
  date: string
  amount: string
}

interface Automation {
  name: string
  status: string
  update: string
}

interface DashboardData {
  metrics: DashboardMetric[]
  recentSales: RecentSale[]
  automations: Automation[]
}

/**
 * Obtiene los datos del dashboard desde la API
 * @returns Promise con los datos del dashboard
 * @throws {Error} Si la API no está disponible o hay un error al obtener los datos
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    // Llamada a la API para obtener los datos del dashboard
    const response = await apiClient.get<DashboardData>("/dashboard/summary")
    return response.data
  } catch (error) {
    if (error instanceof AxiosError && error.code === "ECONNREFUSED") {
      throw { error: "API no disponible - Servicio de dashboard no accesible" }
    }
    return handleApiError(error, "Error al obtener datos del dashboard")
  }
}
