import { prisma } from "@/lib/db"

/**
 * Generate a random short code for download links
 * e.g., "uh3uih128"
 */
export function generateDownloadCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Create a new download link for a release
 * This generates a unique URL like getvision.cx/download/uh3uih128
 */
export async function createDownloadLink(releaseId: string, downloadUrl: string, expirationDays: number = 30) {
  try {
    // Generate unique code
    let code = generateDownloadCode()
    let attempts = 0
    
    // Ensure uniqueness
    while (attempts < 5) {
      const existing = await prisma.shortLink.findUnique({
        where: { code },
      })
      
      if (!existing) break
      code = generateDownloadCode()
      attempts++
    }

    if (attempts >= 5) {
      throw new Error("Failed to generate unique download code")
    }

    // Create expiration date
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)

    const downloadLink = await prisma.shortLink.create({
      data: {
        code,
        releaseId,
        downloadUrl,
        expiresAt,
        isActive: true,
      },
      include: {
        release: true,
      },
    })

    console.log(`✅ Download link created: getvision.cx/download/${code}`)
    return downloadLink
  } catch (error) {
    console.error("Error creating download link:", error)
    throw error
  }
}

/**
 * Get a download link by code and verify it's valid
 */
export async function getDownloadLink(code: string) {
  try {
    const downloadLink = await prisma.shortLink.findUnique({
      where: { code },
      include: {
        release: true,
      },
    })

    if (!downloadLink) {
      return { error: "Download link not found", status: 404 }
    }

    if (!downloadLink.isActive) {
      return { error: "Download link is inactive", status: 403 }
    }

    if (downloadLink.expiresAt < new Date()) {
      // Mark as inactive if expired
      await prisma.shortLink.update({
        where: { id: downloadLink.id },
        data: { isActive: false },
      })
      return { error: "Download link has expired", status: 410 }
    }

    return { success: true, downloadLink }
  } catch (error) {
    console.error("Error retrieving download link:", error)
    return { error: "Internal server error", status: 500 }
  }
}

/**
 * Validate and track a download
 */
export async function recordDownload(downloadCode: string, userId: string, licenseId: string, ipAddress?: string) {
  try {
    const downloadLink = await prisma.shortLink.findUnique({
      where: { code: downloadCode },
    })

    if (!downloadLink) {
      return { error: "Invalid download link" }
    }

    // Record the download
    await prisma.download.create({
      data: {
        userId,
        licenseId,
        releaseId: downloadLink.releaseId,
        ipAddress,
      },
    })

    return { success: true, url: downloadLink.downloadUrl }
  } catch (error) {
    console.error("Error recording download:", error)
    return { error: "Failed to process download" }
  }
}

/**
 * Generate a download link URL
 */
export function getDownloadLinkUrl(code: string, domain: string = "getvision.cx"): string {
  return `https://${domain}/download/${code}`
}
