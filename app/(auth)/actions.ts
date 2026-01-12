"use server"

import { prisma } from "@/lib/db"
import { hashPassword, verifyPassword, createSession } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
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

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        role: "USER",
        isActive: true,
      },
    })

    const headersList = await headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    await createSession(user.id, ip, userAgent)

    await logAudit("USER_CREATED", "User", user.id, "Self-registration", user.id, user.id, ip)

    return { success: true }
  } catch (error) {
    console.error("Registration error:", error)
    return { error: "An error occurred during registration" }
  }
}

export async function logoutAction() {
  const { logout } = await import("@/lib/auth")
  await logout()
  return { success: true }
}
