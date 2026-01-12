"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function depositAction(amount: number) {
  const session = await requireAuth(["RESELLER"])

  if (amount <= 0) {
    return { error: "Invalid amount" }
  }

  try {
    const reseller = await prisma.reseller.findUnique({
      where: { userId: session.id },
    })

    if (!reseller) {
      return { error: "Reseller account not found" }
    }

    await prisma.$transaction([
      prisma.reseller.update({
        where: { id: reseller.id },
        data: {
          balance: { increment: amount },
          totalDeposits: { increment: amount },
        },
      }),
      prisma.walletTransaction.create({
        data: {
          resellerId: reseller.id,
          amount,
          type: "DEPOSIT",
          description: `Wallet deposit of $${amount.toFixed(2)}`,
        },
      }),
    ])

    await logAudit("WALLET_DEPOSIT", "Reseller", reseller.id, `Deposit of $${amount.toFixed(2)}`, session.id)

    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Deposit error:", error)
    return { error: "Failed to process deposit" }
  }
}
