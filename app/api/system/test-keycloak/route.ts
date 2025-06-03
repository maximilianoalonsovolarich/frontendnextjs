import { NextResponse } from "next/server"
import axios from "axios"
import { config } from "@/lib/config"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET() {
  try {
    const envValid = config.validateEnv()
    if (!envValid) {
      return NextResponse.json(
        {
          status: "error",
          message: "Invalid environment configuration",
        },
        { status: 500 },
      )
    }

    // Test connection to Keycloak server
    let keycloakStatus = "Unknown"
    let keycloakError = null

    if (config.auth.issuer) {
      try {
        // Just try to access the well-known configuration
        const wellKnownUrl = `${config.auth.issuer}/.well-known/openid-configuration`
        const response = await axios.get(wellKnownUrl, {
          timeout: 5000,
          headers: {
            Accept: "application/json",
          },
        })

        if (response.status === 200) {
          keycloakStatus = "Connected"
        } else {
          keycloakStatus = `Error: Status ${response.status}`
        }
      } catch (error) {
        keycloakStatus = "Failed"
        keycloakError = error.message
      }
    } else {
      keycloakStatus = "OIDC_ISSUER not configured"
    }

    return NextResponse.json({
      status: "success",
      environmentValid: envValid,
      keycloak: {
        status: keycloakStatus,
        error: keycloakError,
        issuerUrl: config.auth.issuer ? `${config.auth.issuer}` : null,
      },
    })
  } catch (error) {
    console.error("Test Keycloak API error:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
