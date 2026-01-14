"use server"

import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function markNotificationReadAction(notificationId: string) {
  const session = await requireAuth()

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.id,
    },
    data: { read: true },
  })

  revalidatePath("/dashboard/notifications")
}

export async function markAllNotificationsReadAction() {
  const session = await requireAuth()

  await prisma.notification.updateMany({
    where: { userId: session.id },
    data: { read: true },
  })

  revalidatePath("/dashboard/notifications")
}

export async function deleteNotificationAction(notificationId: string) {
  const session = await requireAuth()

  await prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId: session.id,
    },
  })

  revalidatePath("/dashboard/notifications")
}

// Admin function to broadcast notifications
export async function broadcastNotificationAction(
  title: string,
  message: string,
  targetRole?: "ALL" | "RESELLER" | "USER",
) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  // Count users who will see this notification
  let userCount
  if (targetRole === "ALL" || !targetRole) {
    userCount = await prisma.user.count({
      where: { isActive: true },
    })
  } else {
    userCount = await prisma.user.count({
      where: { role: targetRole, isActive: true },
    })
  }

  // Create a single global notification with targetRole
  await prisma.notification.create({
    data: {
      title,
      message,
      type: "UPDATE",
      isGlobal: targetRole === "ALL" || !targetRole,
      targetRole: targetRole && targetRole !== "ALL" ? targetRole : null,
      createdById: session.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  })

  // Log this action
  await prisma.auditLog.create({
    data: {
      action: "BROADCAST_NOTIFICATION",
      entityType: "Notification",
      details: `Broadcast notification "${title}" to ${targetRole || "ALL"} (${userCount} users)`,
      userId: session.id,
      performedById: session.id,
    },
  })

  revalidatePath("/dashboard/notifications")
  revalidatePath("/dashboard")

  return { success: true, count: userCount }
}
