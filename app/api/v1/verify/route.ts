import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { isKillSwitchActive } from "@/lib/kill-switch"

// API endpoint for executor client to verify license
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, hwid } = body

    if (!licenseKey) {
      return NextResponse.json({ success: false, error: "License key required" }, { status: 400 })
    }

    // Check kill switch first
    const killSwitch = await isKillSwitchActive()
    if (killSwitch.isEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: "Service temporarily unavailable",
          code: "KILL_SWITCH_ACTIVE",
          reason: killSwitch.reason,
        },
        { status: 503 },
      )
    }

    // Find the license
    const license = await prisma.license.findUnique({
      where: { key: licenseKey },
      include: {
        user: {
          select: { id: true, username: true, isActive: true },
        },
      },
    })

    if (!license) {
      return NextResponse.json({ success: false, error: "Invalid license key", code: "INVALID_KEY" }, { status: 404 })
    }

    // Check if license is active
    if (license.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: `License is ${license.status.toLowerCase()}`, code: `LICENSE_${license.status}` },
        { status: 403 },
      )
    }

    // Check if expired
    if (license.expiresAt && license.expiresAt < new Date()) {
      await prisma.license.update({
        where: { id: license.id },
        data: { status: "EXPIRED" },
      })
      return NextResponse.json(
        { success: false, error: "License has expired", code: "LICENSE_EXPIRED" },
        { status: 403 },
      )
    }

    // Check user status
    if (license.user && !license.user.isActive) {
      return NextResponse.json(
        { success: false, error: "User account suspended", code: "USER_SUSPENDED" },
        { status: 403 },
      )
    }

    // HWID verification
    if (hwid) {
      if (license.hwid && license.hwid !== hwid) {
        // HWID mismatch - possible sharing
        return NextResponse.json(
          { success: false, error: "Hardware ID mismatch", code: "HWID_MISMATCH" },
          { status: 403 },
        )
      }

      // Bind HWID if not already bound
      if (!license.hwid) {
        await prisma.license.update({
          where: { id: license.id },
          data: { hwid, lastUsedAt: new Date() },
        })
      } else {
        await prisma.license.update({
          where: { id: license.id },
          data: { lastUsedAt: new Date() },
        })
      }
    }

    // Get latest release
    const latestRelease = await prisma.release.findFirst({
      where: { isLatest: true, isPublished: true },
      select: { version: true, downloadUrl: true, changelog: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        licenseId: license.id,
        expiresAt: license.expiresAt,
        type: license.type,
        username: license.user?.username || null,
        latestVersion: latestRelease?.version || null,
        downloadUrl: latestRelease?.downloadUrl || null,
      },
    })
  } catch (error) {
    console.error("License verification error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
