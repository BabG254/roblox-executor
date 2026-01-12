"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function submitAppealAction(targetUserId: string, type: string, reason: string) {
  const session = await requireAuth(["RESELLER"])

  if (!targetUserId || !type || !reason.trim()) {
    return { error: "All fields are required" }
  }

  try {
    // Verify the target user exists and has redeemed a key from this reseller
    const reseller = await prisma.reseller.findUnique({
      where: { userId: session.id },
      include: {
        issuedKeys: {
          where: {
            status: "REDEEMED",
            license: { userId: targetUserId },
          },
        },
      },
    })

    if (!reseller || reseller.issuedKeys.length === 0) {
      return { error: "You can only appeal users who have redeemed your license keys" }
    }

    // Check for existing pending appeal
    const existingAppeal = await prisma.appeal.findFirst({
      where: {
        targetUserId,
        submitterId: session.id,
        status: "PENDING",
      },
    })

    if (existingAppeal) {
      return { error: "You already have a pending appeal for this user" }
    }

    const appeal = await prisma.appeal.create({
      data: {
        targetUserId,
        submitterId: session.id,
        type,
        reason,
      },
    })

    await logAudit("APPEAL_CREATED", "Appeal", appeal.id, `Appeal type: ${type}`, session.id, targetUserId)

    revalidatePath("/dashboard/submit-appeal")
    return { success: true }
  } catch (error) {
    console.error("Submit appeal error:", error)
    return { error: "Failed to submit appeal" }
  }
}
