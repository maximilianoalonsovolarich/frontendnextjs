"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Leaf } from "lucide-react"

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  useEffect(() => {
    // Log the error for debugging
    if (error) {
      console.error("Authentication error:", error)
    }
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 dark:from-gray-900 dark:to-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Leaf className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Login Error</AlertTitle>
            <AlertDescription>
              {error === "Configuration"
                ? "There is a problem with the server configuration. Please contact the administrator."
                : error === "AccessDenied"
                  ? "You don't have permission to access this application."
                  : "An error occurred during the authentication process. Please try again."}
            </AlertDescription>
          </Alert>
          <p className="text-center text-sm text-muted-foreground">
            If the problem persists, contact the system administrator or check the Keycloak configuration.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
