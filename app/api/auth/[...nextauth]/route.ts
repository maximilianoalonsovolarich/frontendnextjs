import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

// Create a handler that properly catches and logs errors
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
