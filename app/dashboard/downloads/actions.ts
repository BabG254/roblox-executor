"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

export async function recordDownloadAction(releaseId: string, licenseId: string, userId: string) {
  await requireAuth()

  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for") || "unknown"

  await prisma.download.create({
    data: {
      userId,
      releaseId,
      licenseId,
      ipAddress: ip,
    },
  })

  await logAudit("DOWNLOAD_INITIATED", "Download", releaseId, `User downloaded release`, userId, userId, ip)

  revalidatePath("/dashboard/downloads")
}
