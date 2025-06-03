import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, DollarSign, Users } from "lucide-react"
import { redirect } from "next/navigation"
import { fetchDashboardData } from "@/lib/api/dashboard/service"

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

export default async function Dashboard() {
  const session = await getServerSession(authOptions)

  // Si no hay sesión, redirigir a la página de login
  if (!session) {
    redirect("/")
  }

  // Intentar obtener datos del dashboard desde la API
  let dashboardData: DashboardData | null = null

  try {
    dashboardData = await fetchDashboardData()
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error)
    // No hacemos nada más aquí, usaremos el valor null para mostrar "No-disp"
  }

  // Iconos para las métricas
  const icons = {
    sales: DollarSign,
    customers: Users,
    projects: BarChart3,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Sales summary and automations for your synthetic grass business.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Métricas - Mostrar "No-disp" si no hay datos */}
        {[
          { key: "sales", title: "Total Sales", description: "Compared to last month" },
          { key: "customers", title: "New Customers", description: "Last 30 days" },
          { key: "projects", title: "Active Projects", description: "Currently in progress" },
        ].map((metric, i) => {
          const Icon = icons[metric.key as keyof typeof icons]
          return (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">No-disp</div>
                <p className="flex items-center text-xs text-muted-foreground">
                  <span className="mr-1 text-muted">No-disp</span>
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Latest completed sales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ventas recientes - Mostrar "No-disp" si no hay datos */}
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">No-disp</p>
                    <p className="text-sm text-muted-foreground">No-disp</p>
                  </div>
                  <div className="font-medium">No-disp</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Active Automations</CardTitle>
            <CardDescription>Status of your automated systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Automatizaciones - Mostrar "No-disp" si no hay datos */}
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">No-disp</p>
                    <p className="text-sm text-muted-foreground">Last update: No-disp</p>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 h-2 w-2 rounded-full bg-gray-300"></span>
                    <span className="text-sm font-medium">No-disp</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
