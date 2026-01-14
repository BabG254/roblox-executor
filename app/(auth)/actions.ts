"use server"

import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword, createSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { sendVerificationEmail } from "@/lib/email"
import { headers } from "next/headers"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    console.log("🔍 Login Debug:", {
      email: email.toLowerCase(),
      userExists: !!user,
      userActive: user?.isActive,
      hasPasswordHash: !!user?.passwordHash,
      passwordHashLength: user?.passwordHash?.length,
      inputPasswordLength: password.length
    })

    if (!user) {
      console.log("❌ User not found")
      return { error: "Invalid credentials" }
    }

    if (!user.isActive) {
      console.log("❌ User not active")
      return { error: "Account has been deactivated" }
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    console.log("🔑 Password verification result:", isValid)

    if (!isValid) {
      console.log("❌ Password mismatch")
      return { error: "Invalid credentials" }
    }

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    await createSession(user.id, ip, userAgent)

    await logAudit("USER_LOGIN", "User", user.id, undefined, user.id, user.id, ip)

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "An error occurred during login" }
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!username || !email || !password) {
    return { error: "All fields are required" }
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return { error: "Email already in use" }
      }
      return { error: "Username already taken" }
    }

    const passwordHash = await hashPassword(password)
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours

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

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Send verification email
    console.log(`📧 Sending verification email to ${user.email}...`)
    const emailResult = await sendVerificationEmail(user.email, verificationCode, username)
    
    if (!emailResult.success) {
      console.error(`⚠️ Email send failed: ${emailResult.error}`)
      // Note: We still allow registration even if email fails, but log it
    } else {
      console.log(`✅ Verification email sent successfully`)
    }
    
    await logAudit("USER_CREATED", "User", user.id, "Self-registration", user.id, user.id, ip)

    console.log("✅ Registration successful for:", user.email)
    return { success: true, userId: user.id, requiresVerification: true }
  } catch (error) {
    console.error("❌ Registration error:", error)
    return { error: error instanceof Error ? error.message : "An error occurred during registration" }
  }
}

export async function verifyEmailAction(userId: string, code: string) {
  if (!userId || !code) {
    return { error: "User ID and verification code are required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: "User not found" }
    }

    if (user.emailVerified) {
      return { error: "Email already verified" }
    }

    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      return { error: "No verification code found. Please register again." }
    }

    if (user.verificationCodeExpiresAt < new Date()) {
      return { error: "Verification code has expired. Please register again." }
    }

    if (user.verificationCode !== code) {
      return { error: "Invalid verification code" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    })

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"

    await logAudit("EMAIL_VERIFIED", "User", userId, "Email verification completed", userId, userId, ip)

    return { success: true }
  } catch (error) {
    console.error("❌ Email verification error:", error)
    return { error: error instanceof Error ? error.message : "An error occurred during verification" }
  }
}

export async function resendVerificationCodeAction(userId: string) {
  if (!userId) {
    return { error: "User ID is required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { error: "User not found" }
    }

    if (user.emailVerified) {
      return { error: "Email already verified" }
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationCodeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode,
        verificationCodeExpiresAt,
      },
    })

    // Send the new verification email
    console.log(`📧 Sending new verification email to ${user.email}...`)
    const emailResult = await sendVerificationEmail(user.email, verificationCode, user.username)
    
    if (!emailResult.success) {
      console.error(`⚠️ Email send failed: ${emailResult.error}`)
      return { error: "Failed to send verification email. Please try again." }
    }

    console.log(`✅ Verification email resent successfully`)
    return { success: true }
  } catch (error) {
    console.error("❌ Resend verification error:", error)
    return { error: error instanceof Error ? error.message : "An error occurred" }
  }
}

export async function logoutAction() {
  const { logout } = await import("@/lib/auth")
  await logout()
  return { success: true }
}
