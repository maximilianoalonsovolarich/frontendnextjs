import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { NextAuthProvider } from "@/components/providers/next-auth-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { EnvProvider } from "@/components/providers/env-provider"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Aurora Grass Dashboard",
  description: "Modern dashboard for synthetic grass management",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <EnvProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </EnvProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
