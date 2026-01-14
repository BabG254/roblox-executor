"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { logAudit } from "@/lib/audit"
import { createDownloadLink, getDownloadLinkUrl } from "@/lib/downloads"
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

export async function generateDownloadLinkAction(releaseId: string, expirationDays: number = 30) {
  const session = await requireAuth(["OWNER", "ADMIN"])

  try {
    const release = await prisma.softwareRelease.findUnique({
      where: { id: releaseId },
    })

    if (!release) {
      return { error: "Release not found" }
    }

    const downloadLink = await createDownloadLink(release.id, release.downloadUrl, expirationDays)

    const downloadUrl = getDownloadLinkUrl(downloadLink.code)

    await logAudit(
      "DOWNLOAD_LINK_GENERATED",
      "SoftwareRelease",
      releaseId,
      `Generated download link: ${downloadLink.code} (expires in ${expirationDays} days)`,
      session.id,
    )

    revalidatePath("/dashboard/releases")
    return { success: true, code: downloadLink.code, url: downloadUrl }
  } catch (error: any) {
    console.error("Generate download link error:", error)
    
    // Handle specific error case for missing migration
    if (error?.message?.includes("migration")) {
      return { error: "Database migration required. Run: npm run db:migrate" }
    }
    
    return { error: error?.message || "Failed to generate download link" }
  }
}
