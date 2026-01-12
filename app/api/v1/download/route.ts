import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isKillSwitchActive } from "@/lib/kill-switch"

// API endpoint for authorized download tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, version } = body

    if (!licenseKey) {
      return NextResponse.json({ success: false, error: "License key required" }, { status: 400 })
    }

    // Check kill switch
    const killSwitch = await isKillSwitchActive()
    if (killSwitch.isEnabled) {
      return NextResponse.json({ success: false, error: "Service temporarily unavailable" }, { status: 503 })
    }

    // Verify license
    const license = await prisma.license.findUnique({
      where: { key: licenseKey },
      select: { id: true, status: true, userId: true },
    })

    if (!license || license.status !== "ACTIVE") {
      return NextResponse.json({ success: false, error: "Invalid or inactive license" }, { status: 403 })
    }

    // Find release
    const release = version
      ? await prisma.release.findFirst({ where: { version, isPublished: true } })
      : await prisma.release.findFirst({ where: { isLatest: true, isPublished: true } })

    if (!release) {
      return NextResponse.json({ success: false, error: "Release not found" }, { status: 404 })
    }

    // Record download
    await prisma.download.create({
      data: {
        userId: license.userId,
        releaseId: release.id,
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        version: release.version,
        downloadUrl: release.downloadUrl,
        changelog: release.changelog,
        fileSize: release.fileSize,
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
