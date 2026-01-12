"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { revalidatePath } from "next/cache"

export async function createReleaseAction(formData: FormData) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  const version = formData.get("version") as string
  const changelog = formData.get("changelog") as string
  const downloadUrl = formData.get("downloadUrl") as string
  const fileSizeStr = formData.get("fileSize") as string

  if (!version || !changelog || !downloadUrl) {
    return { error: "All fields are required" }
  }

  try {
    const release = await prisma.softwareRelease.create({
      data: {
        version,
        changelog,
        downloadUrl,
        fileSize: fileSizeStr ? Number.parseInt(fileSizeStr) : null,
        createdById: session.id,
      },
    })

    await logAudit("RELEASE_CREATED", "SoftwareRelease", release.id, `Version ${version}`, session.id)

    revalidatePath("/dashboard/releases")
    return { success: true }
  } catch (error) {
    console.error("Create release error:", error)
    return { error: "Failed to create release" }
  }
}

export async function togglePublishAction(releaseId: string, publish: boolean) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  await prisma.softwareRelease.update({
    where: { id: releaseId },
    data: {
      isPublished: publish,
      publishedAt: publish ? new Date() : null,
    },
  })

  await logAudit(
    publish ? "RELEASE_PUBLISHED" : "RELEASE_ROLLBACK",
    "SoftwareRelease",
    releaseId,
    `Release ${publish ? "published" : "unpublished"}`,
    session.id,
  )

  revalidatePath("/dashboard/releases")
}

export async function setLatestAction(releaseId: string) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  // Remove latest from all releases
  await prisma.softwareRelease.updateMany({
    where: { isLatest: true },
    data: { isLatest: false },
  })

  // Set new latest
  await prisma.softwareRelease.update({
    where: { id: releaseId },
    data: { isLatest: true },
  })

  await logAudit("RELEASE_PUBLISHED", "SoftwareRelease", releaseId, "Set as latest release", session.id)

  revalidatePath("/dashboard/releases")
}
