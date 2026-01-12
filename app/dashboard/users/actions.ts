"use server"

import { prisma } from "@/lib/db"
import { requireAuth, forceLogoutUser } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  })

  if (!isActive) {
    await forceLogoutUser(userId)
  }

  await logAudit(
    isActive ? "USER_UPDATED" : "USER_DELETED",
    "User",
    userId,
    `User ${isActive ? "activated" : "deactivated"}`,
    session.id,
  )

  revalidatePath("/dashboard/users")
}

export async function forceLogoutUserAction(userId: string) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await forceLogoutUser(userId)

  await logAudit("USER_FORCE_LOGOUT", "User", userId, "Forced logout by admin", session.id)

  revalidatePath("/dashboard/users")
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await requireAuth(["OWNER"])

  const oldUser = await prisma.user.findUnique({ where: { id: userId } })

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  // Create or remove reseller record based on role
  if (newRole === "RESELLER") {
    const existingReseller = await prisma.reseller.findUnique({ where: { userId } })
    if (!existingReseller) {
      await prisma.reseller.create({
        data: { userId },
      })
      await logAudit("RESELLER_CREATED", "Reseller", userId, "Reseller account created", session.id)
    }
  }

  await logAudit("USER_UPDATED", "User", userId, `Role changed from ${oldUser?.role} to ${newRole}`, session.id)

  revalidatePath("/dashboard/users")
}
