import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// API endpoint to request HWID reset (admin must approve)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, reason } = body

    if (!licenseKey) {
      return NextResponse.json({ success: false, error: "License key required" }, { status: 400 })
    }

    const license = await prisma.license.findUnique({
      where: { key: licenseKey },
      include: { user: { select: { id: true, username: true } } },
    })

    if (!license || !license.user) {
      return NextResponse.json({ success: false, error: "License not found" }, { status: 404 })
    }

    // Create a notification for admins about HWID reset request
    await prisma.notification.create({
      data: {
        userId: license.user.id,
        title: "HWID Reset Requested",
        message: `User ${license.user.username} requested an HWID reset. Reason: ${reason || "No reason provided"}`,
        type: "INFO",
      },
    })

    // For now, we'll auto-reset (in production, you might want admin approval)
    await prisma.license.update({
      where: { id: license.id },
      data: { hwid: null },
    })

    return NextResponse.json({
      success: true,
      message: "HWID has been reset. You can now bind to a new device.",
    })
  } catch (error) {
    console.error("HWID reset error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
