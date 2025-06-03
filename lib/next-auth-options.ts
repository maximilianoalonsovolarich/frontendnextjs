import { refreshTokenRequest } from "@/lib/oidc"
import { config } from "@/lib/config"
import type { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.OIDC_CLIENT_ID!,
      clientSecret: process.env.OIDC_CLIENT_SECRET!,
      issuer: process.env.OIDC_ISSUER!,
      authorization: { params: { scope: "openid email profile" } },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name ?? profile.preferred_username,
          email: profile.email,
          image: profile.picture,
          sub: profile.sub,
          email_verified: profile.email_verified,
          preferred_username: profile.preferred_username,
          given_name: profile.given_name || "",
          family_name: profile.family_name || "",
          org_name: profile.org_name || "",
          telephone: profile.telephone || "",
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      try {
        if (account && user) {
          return {
            accessToken: account.access_token,
            accessTokenExpires: account.expires_in ? Date.now() + (account.expires_in as number) * 1000 : 0,
            refreshToken: account.refresh_token,
            user,
          }
        }

        if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
          return token
        }

        if (!token.refreshToken) {
          console.error("No refresh token available")
          return { ...token, error: "RefreshAccessTokenError" }
        }

        const response = await refreshTokenRequest(token.refreshToken as string)

        if (!response || response.status !== 200 || !response.data) {
          console.error("Invalid response from token refresh:", response)
          return { ...token, error: "RefreshAccessTokenError" }
        }

        const refreshedTokens = response.data

        return {
          ...token,
          accessToken: refreshedTokens.access_token,
          accessTokenExpires: refreshedTokens.expires_in ? Date.now() + (refreshedTokens.expires_in as number) * 1000 : 0,
          refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
        }
      } catch (error) {
        console.error("Error in jwt callback:", error)
        return { ...token, error: "RefreshAccessTokenError" }
      }
    },
    async session({ session, token }) {
      try {
        if (token.user) {
          session.user = token.user as any
        }
        if (token.accessToken) {
          session.accessToken = token.accessToken as string
        }
        if (token.error) {
          session.error = token.error as string
        }
        return session
      } catch (error) {
        console.error("Error in session callback:", error)
        return { ...session, error: "SessionError" }
      }
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  debug: true, // Enable debug mode to see more detailed error messages
  secret: process.env.NEXTAUTH_SECRET,
}
