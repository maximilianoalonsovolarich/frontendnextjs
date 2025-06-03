"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react"

export default function PerfilPage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    org_name: session?.user?.org_name || "",
    telephone: session?.user?.telephone || "",
  })

  const displayName = session?.user?.name || "Usuario"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Perfil</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Actualice su información personal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-medium">{displayName}</h3>
                <p className="text-sm text-gray-500">{session?.user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
