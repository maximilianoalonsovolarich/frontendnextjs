import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string
      email?: string
      image?: string
      sub: string
      email_verified?: boolean
      preferred_username?: string
      given_name?: string
      family_name?: string
      org_name?: string
      telephone?: string
    }
    accessToken: string
    error?: string
  }

  interface User {
    id: string
    name?: string
    email?: string
    image?: string
    sub: string
    email_verified?: boolean
    preferred_username?: string
    given_name?: string
    family_name?: string
    org_name?: string
    telephone?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: {
      id: string
      name?: string
      email?: string
      image?: string
      sub: string
      email_verified?: boolean
      preferred_username?: string
      given_name?: string
      family_name?: string
      org_name?: string
      telephone?: string
    }
    accessToken?: string
    accessTokenExpires?: number
    refreshToken?: string
    error?: string
  }
}
