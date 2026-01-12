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

  let users
  if (targetRole === "ALL" || !targetRole) {
    users = await prisma.user.findMany({
      where: { isActive: true },
      select: { id: true },
    })
  } else {
    users = await prisma.user.findMany({
      where: { role: targetRole, isActive: true },
      select: { id: true },
    })
  }

  // Create notifications for all target users
  await prisma.notification.createMany({
    data: users.map((user) => ({
      userId: user.id,
      title,
      message,
      type: "ANNOUNCEMENT",
    })),
  })

  // Log this action
  await prisma.auditLog.create({
    data: {
      userId: session.id,
      action: "BROADCAST_NOTIFICATION",
      details: `Broadcast notification "${title}" to ${targetRole || "ALL"} (${users.length} users)`,
    },
  })

  revalidatePath("/dashboard/notifications")

  return { success: true, count: users.length }
}
