import { NextResponse } from "next/server"
import { isKillSwitchActive } from "@/lib/kill-switch"
import { prisma } from "@/lib/db"

// API endpoint for executor to check service status
export async function GET() {
  try {
    const killSwitch = await isKillSwitchActive()

    const latestRelease = await prisma.release.findFirst({
      where: { isLatest: true, isPublished: true },
      select: { version: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        serviceActive: !killSwitch.isEnabled,
        killSwitchEnabled: killSwitch.isEnabled,
        killSwitchReason: killSwitch.reason,
        latestVersion: latestRelease?.version || null,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
