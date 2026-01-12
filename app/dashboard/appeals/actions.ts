"use server"

import { requireAuth, forceLogoutUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function resolveAppealAction(
  appealId: string,
  status: "APPROVED" | "REJECTED",
  resolution: string,
  targetUserId: string,
) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await prisma.appeal.update({
    where: { id: appealId },
    data: {
      status,
      resolution,
      resolvedAt: new Date(),
      resolvedById: session.id,
    },
  })

  // If approved, deactivate the target user
  if (status === "APPROVED") {
    await prisma.user.update({
      where: { id: targetUserId },
      data: { isActive: false },
    })

    // Deactivate their licenses
    await prisma.license.updateMany({
      where: { userId: targetUserId },
      data: { isActive: false },
    })

    // Force logout
    await forceLogoutUser(targetUserId)

    await logAudit(
      "USER_DELETED",
      "User",
      targetUserId,
      `Account terminated via approved appeal`,
      session.id,
      targetUserId,
    )
  }

  await logAudit("APPEAL_RESOLVED", "Appeal", appealId, `Appeal ${status.toLowerCase()}: ${resolution}`, session.id)

  revalidatePath("/dashboard/appeals")
  revalidatePath("/dashboard/users")
}
