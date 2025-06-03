"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { useState, useEffect } from "react"

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="p-4 bg-red-50 text-red-900 rounded-md">
      <p className="font-bold">Error:</p>
      <pre className="mt-2 text-sm">{error.message}</pre>
      <p className="mt-2 text-sm">Please check if the backend service is running and try again.</p>
    </div>
  )
}

export function NextAuthProvider({ children }: { children: ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error("NextAuth Error:", error)
      }}
    >
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false} refetchWhenOffline={false}>
        {children}
      </SessionProvider>
    </ErrorBoundary>
  )
}
