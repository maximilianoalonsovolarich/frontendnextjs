import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Bypass auth check for public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/system/test-keycloak") ||
    pathname.startsWith("/api/system/env-check")
  ) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Redirect to home page if not authenticated
    if (!token) {
      const url = new URL("/", request.url)
      url.searchParams.set("callbackUrl", encodeURI(request.url))
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of error, allow the request to proceed
    // This prevents authentication errors from blocking the entire site
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
