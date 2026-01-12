"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function toggleResellerStatus(resellerId: string, isActive: boolean) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await prisma.reseller.update({
    where: { id: resellerId },
    data: { isActive },
  })

  await logAudit(
    isActive ? "RESELLER_CREATED" : "RESELLER_REVOKED",
    "Reseller",
    resellerId,
    `Reseller ${isActive ? "activated" : "deactivated"}`,
    session.id,
  )

  revalidatePath("/dashboard/resellers")
}

export async function adjustBalance(resellerId: string, amount: number) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  const reseller = await prisma.reseller.findUnique({ where: { id: resellerId } })
  if (!reseller) throw new Error("Reseller not found")

  await prisma.$transaction([
    prisma.reseller.update({
      where: { id: resellerId },
      data: {
        balance: { increment: amount },
        totalDeposits: amount > 0 ? { increment: amount } : undefined,
      },
    }),
    prisma.walletTransaction.create({
      data: {
        resellerId,
        amount: Math.abs(amount),
        type: amount > 0 ? "DEPOSIT" : "PURCHASE",
        description: `Admin balance adjustment: ${amount > 0 ? "+" : "-"}$${Math.abs(amount).toFixed(2)}`,
      },
    }),
  ])

  await logAudit(
    "WALLET_DEPOSIT",
    "Reseller",
    resellerId,
    `Admin adjusted balance by $${amount.toFixed(2)}`,
    session.id,
  )

  revalidatePath("/dashboard/resellers")
}
