import { NextResponse } from "next/server"
import { config } from "@/lib/config"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET() {
  const envValid = config.validateEnv()

  return NextResponse.json({
    envValid,
    hasOidcClientId: !!config.auth.clientId,
    hasOidcClientSecret: !!config.auth.clientSecret,
    hasOidcIssuer: !!config.auth.issuer,
    hasNextAuthSecret: !!config.auth.secret,
    hasNextAuthUrl: !!config.auth.url,
  })
}
