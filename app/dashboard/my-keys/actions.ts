"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function purchaseKeysAction(duration: number, price: number, quantity: number) {
  const session = await requireAuth(["RESELLER"])

  const totalCost = price * quantity

  try {
    const reseller = await prisma.reseller.findUnique({
      where: { userId: session.id },
    })

    if (!reseller) {
      return { error: "Reseller account not found" }
    }

    if (reseller.balance < totalCost) {
      return { error: "Insufficient balance" }
    }

    // Find available keys matching criteria
    const availableKeys = await prisma.licenseKey.findMany({
      where: {
        status: "AVAILABLE",
        duration,
        price,
        resellerId: null,
      },
      take: quantity,
    })

    if (availableKeys.length < quantity) {
      return { error: `Only ${availableKeys.length} keys available` }
    }

    // Perform transaction
    await prisma.$transaction([
      // Deduct balance
      prisma.reseller.update({
        where: { id: reseller.id },
        data: {
          balance: { decrement: totalCost },
          totalPurchases: { increment: totalCost },
        },
      }),
      // Record transaction
      prisma.walletTransaction.create({
        data: {
          resellerId: reseller.id,
          amount: totalCost,
          type: "PURCHASE",
          description: `Purchased ${quantity} x ${duration}-day license keys`,
        },
      }),
      // Assign keys to reseller
      prisma.licenseKey.updateMany({
        where: { id: { in: availableKeys.map((k) => k.id) } },
        data: {
          resellerId: reseller.id,
          status: "ASSIGNED",
        },
      }),
    ])

    await logAudit(
      "WALLET_PURCHASE",
      "LicenseKey",
      undefined,
      `Purchased ${quantity} x ${duration}-day keys for $${totalCost.toFixed(2)}`,
      session.id,
    )

    revalidatePath("/dashboard/my-keys")
    revalidatePath("/dashboard/wallet")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Purchase error:", error)
    return { error: "Failed to purchase keys" }
  }
}
