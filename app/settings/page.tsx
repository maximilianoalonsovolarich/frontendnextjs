"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Name</h3>
                <p className="text-gray-600 dark:text-gray-400">{session?.user?.name}</p>
              </div>
              <div>
                <h3 className="font-medium">Email</h3>
                <p className="text-gray-600 dark:text-gray-400">{session?.user?.email}</p>
              </div>
              <div>
                <h3 className="font-medium">Organization</h3>
                <p className="text-gray-600 dark:text-gray-400">{session?.user?.org_name || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium">Phone</h3>
                <p className="text-gray-600 dark:text-gray-400">{session?.user?.telephone || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
