/**
 * Environment variable validation utility
 * Checks if required environment variables are set and logs errors
 */

export function validateEnvironmentVariables() {
  const requiredVariables = [
    "BACKEND_URL",
    "NEXT_PUBLIC_API_BASE_URL",
    "OIDC_CLIENT_ID",
    "OIDC_CLIENT_SECRET",
    "OIDC_ISSUER",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ]

  const missingVariables = requiredVariables.filter((variable) => !process.env[variable])

  if (missingVariables.length > 0) {
    console.error("❌ Missing required environment variables:")
    missingVariables.forEach((variable) => {
      console.error(`  - ${variable}`)
    })
    console.error("Please set these variables in your .env file or environment")
    return false
  }

  return true
}
