"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { usePathname, useRouter } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { LoginPage } from "./login-page"
import { useEffect, useState } from "react"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Redirect to error page if there's a session error
    if (session?.error) {
      router.push(`/auth/error?error=${encodeURIComponent(session.error)}`)
    }
  }, [session?.error, router])

  // Show login page if not authenticated
  if (status === "unauthenticated") {
    return <LoginPage />
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
