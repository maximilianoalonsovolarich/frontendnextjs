"use client"

import { signIn } from "next-auth/react"
import { Leaf, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react"

export function LoginPage({ error }: { error?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(error || null)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      setErrorMessage(null)

      // Use a direct approach without redirects first
      const result = await signIn("keycloak", {
        redirect: false,
        callbackUrl: "/", // Default to home page, the auth system will handle proper redirection
      })

      if (result?.error) {
        setErrorMessage(`Authentication error: ${result.error}`)
        console.error("Sign in error:", result.error)
      } else if (result?.url) {
        // If we got a URL, redirect manually
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Sign in exception:", error)
      setErrorMessage("Unexpected error during authentication")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4 dark:from-gray-900 dark:to-gray-950">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg dark:bg-gray-900 dark:border-gray-800">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center justify-center rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <Leaf className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Aurora Grass Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Management platform for your synthetic grass business</p>
          </div>

          {errorMessage && (
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
            onClick={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Espacio en blanco intencionalmente */}
        </div>
      </div>
    </div>
  )
}
