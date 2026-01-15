import { prisma } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({ error: "Email not verified. Please check your email." }, { status: 403 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account has been deactivated" }, { status: 403 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown"

    const sessionToken = await createSession(user.id, ip, userAgent)

    await logAudit("USER_LOGIN", "User", user.id, undefined, user.id, user.id, ip)

    return NextResponse.json({
      success: true,
      sessionToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
