import { type NextRequest, NextResponse } from "next/server"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get("session_token")?.value

  // Public routes
  const publicRoutes = ["/", "/login", "/register"]
  const apiRoutes = pathname.startsWith("/api/")

  // Allow API routes and public routes
  if (apiRoutes || publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Redirect to login if no session and trying to access dashboard
  if (pathname.startsWith("/dashboard") && !sessionToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Redirect to dashboard if has session and trying to access login/register
  if ((pathname === "/login" || pathname === "/register") && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
