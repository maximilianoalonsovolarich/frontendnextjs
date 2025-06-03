import { NextResponse } from "next/server"
import { validateEnvironmentVariables } from "@/lib/env-validation"

export async function GET() {
  const isValid = validateEnvironmentVariables()

  return NextResponse.json({
    status: isValid ? "ok" : "error",
    message: isValid ? "All required environment variables are set" : "Missing required environment variables",
    timestamp: new Date().toISOString(),
  })
}
