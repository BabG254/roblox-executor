import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { sendVerificationEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 })
      }
      return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    }

    const passwordHash = await hashPassword(password)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        role: "USER",
        isActive: true,
        emailVerified: false,
        verificationCode,
        verificationCodeExpiresAt,
      },
    })

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    // Send verification email
    const emailResult = await sendVerificationEmail(user.email, verificationCode, username)

    if (!emailResult.success) {
      console.error(`Email send failed: ${emailResult.error}`)
    }

    await logAudit("USER_CREATED", "User", user.id, "API registration", user.id, user.id, ip)

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email for verification code.",
      userId: user.id,
      email: user.email,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
