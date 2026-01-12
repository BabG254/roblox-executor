"use server"

import { requireAuth } from "@/lib/auth"
import { createLicenseKeys } from "@/lib/license"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function generateKeysAction(formData: FormData) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  const count = Number.parseInt(formData.get("count") as string) || 1
  const duration = Number.parseInt(formData.get("duration") as string) || 30
  const price = Number.parseFloat(formData.get("price") as string) || 0

  if (count < 1 || count > 100) {
    return { error: "Count must be between 1 and 100" }
  }

  try {
    const keys = await createLicenseKeys(count, duration, price, session.id)

    await logAudit(
      "LICENSE_KEY_CREATED",
      "LicenseKey",
      undefined,
      `Generated ${keys.length} keys (${duration} days, $${price})`,
      session.id,
    )

    revalidatePath("/dashboard/keys")
    return { success: true, count: keys.length }
  } catch (error) {
    console.error("Generate keys error:", error)
    return { error: "Failed to generate keys" }
  }
}

export async function revokeKeyAction(keyId: string) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await prisma.licenseKey.update({
    where: { id: keyId },
    data: { status: "REVOKED" },
  })

  await logAudit("LICENSE_KEY_REVOKED", "LicenseKey", keyId, "Key revoked by admin", session.id)

  revalidatePath("/dashboard/keys")
}
