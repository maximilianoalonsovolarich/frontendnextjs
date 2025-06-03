import { z } from "zod"

const envSchema = z.object({
  OIDC_CLIENT_ID: z.string().min(1),
  OIDC_CLIENT_SECRET: z.string().min(1),
  OIDC_ISSUER: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
})

export const config = {
  auth: {
    clientId: process.env.OIDC_CLIENT_ID,
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    issuer: process.env.OIDC_ISSUER,
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  },
  validateEnv() {
    try {
      envSchema.parse(process.env)
      return true
    } catch (error) {
      console.error("❌ Invalid environment variables:", error)
      return false
    }
  },
}
