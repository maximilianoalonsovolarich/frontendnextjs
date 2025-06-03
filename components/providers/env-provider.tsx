"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type EnvContextType = {
  NEXT_PUBLIC_HAS_OIDC_CLIENT_ID: boolean
  NEXT_PUBLIC_HAS_OIDC_CLIENT_SECRET: boolean
  NEXT_PUBLIC_HAS_OIDC_ISSUER: boolean
  NEXT_PUBLIC_HAS_NEXTAUTH_SECRET: boolean
  NEXT_PUBLIC_HAS_NEXTAUTH_URL: boolean
}

const EnvContext = createContext<EnvContextType>({
  NEXT_PUBLIC_HAS_OIDC_CLIENT_ID: false,
  NEXT_PUBLIC_HAS_OIDC_CLIENT_SECRET: false,
  NEXT_PUBLIC_HAS_OIDC_ISSUER: false,
  NEXT_PUBLIC_HAS_NEXTAUTH_SECRET: false,
  NEXT_PUBLIC_HAS_NEXTAUTH_URL: false,
})

export function EnvProvider({ children }: { children: ReactNode }) {
  const [envState, setEnvState] = useState<EnvContextType>({
    NEXT_PUBLIC_HAS_OIDC_CLIENT_ID: false,
    NEXT_PUBLIC_HAS_OIDC_CLIENT_SECRET: false,
    NEXT_PUBLIC_HAS_OIDC_ISSUER: false,
    NEXT_PUBLIC_HAS_NEXTAUTH_SECRET: false,
    NEXT_PUBLIC_HAS_NEXTAUTH_URL: false,
  })

  useEffect(() => {
    // Fetch environment variable status
    fetch("/api/system/env-check")
      .then((res) => res.json())
      .then((data) => {
        setEnvState({
          NEXT_PUBLIC_HAS_OIDC_CLIENT_ID: data.hasOidcClientId,
          NEXT_PUBLIC_HAS_OIDC_CLIENT_SECRET: data.hasOidcClientSecret,
          NEXT_PUBLIC_HAS_OIDC_ISSUER: data.hasOidcIssuer,
          NEXT_PUBLIC_HAS_NEXTAUTH_SECRET: data.hasNextAuthSecret,
          NEXT_PUBLIC_HAS_NEXTAUTH_URL: data.hasNextAuthUrl,
        })
      })
      .catch((error) => {
        console.error("Failed to check environment variables:", error)
      })
  }, [])

  return <EnvContext.Provider value={envState}>{children}</EnvContext.Provider>
}

export const useEnv = () => useContext(EnvContext)
