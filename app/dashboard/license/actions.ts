"use server"

import { requireAuth } from "@/lib/auth"
import { redeemLicenseKey } from "@/lib/license"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function redeemKeyAction(key: string) {
  const session = await requireAuth()

  try {
    const license = await redeemLicenseKey(session.id, key)

    await logAudit("LICENSE_ACTIVATED", "License", license.id, `Key redeemed: ${key}`, session.id, session.id)

    revalidatePath("/dashboard/license")
    revalidatePath("/dashboard/downloads")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Redeem key error:", error)
    return { error: error instanceof Error ? error.message : "Failed to redeem key" }
  }
}
