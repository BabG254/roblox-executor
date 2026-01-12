"use server"

import { requireAuth, hashPassword, verifyPassword } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function updateProfileAction(username: string, email: string) {
  const session = await requireAuth()

  if (!username.trim() || !email.trim()) {
    return { error: "Username and email are required" }
  }

  try {
    // Check for existing username/email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase(), id: { not: session.id } },
          { email: email.toLowerCase(), id: { not: session.id } },
        ],
      },
    })

    if (existing) {
      if (existing.username === username.toLowerCase()) {
        return { error: "Username already taken" }
      }
      return { error: "Email already in use" }
    }

    await prisma.user.update({
      where: { id: session.id },
      data: {
        username: username.toLowerCase(),
        email: email.toLowerCase(),
      },
    })

    await logAudit("USER_UPDATED", "User", session.id, "Profile updated", session.id, session.id)

    revalidatePath("/dashboard/settings")
    return { success: true }
  } catch (error) {
    console.error("Update profile error:", error)
    return { error: "Failed to update profile" }
  }
}

export async function changePasswordAction(currentPassword: string, newPassword: string) {
  const session = await requireAuth()

  if (!currentPassword || !newPassword) {
    return { error: "All fields are required" }
  }

  if (newPassword.length < 8) {
    return { error: "Password must be at least 8 characters" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return { error: "User not found" }
    }

    const isValid = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValid) {
      return { error: "Current password is incorrect" }
    }

    const newHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: newHash },
    })

    await logAudit("USER_UPDATED", "User", session.id, "Password changed", session.id, session.id)

    return { success: true }
  } catch (error) {
    console.error("Change password error:", error)
    return { error: "Failed to change password" }
  }
}
