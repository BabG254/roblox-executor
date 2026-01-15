import { prisma } from "@/lib/db"
import { getSessionFromToken } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const session = await getSessionFromToken(token)

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    const activeLicense = await prisma.license.findFirst({
      where: {
        userId: session.userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: {
        licenseKey: true,
      },
    })

    if (!activeLicense) {
      return NextResponse.json({
        success: true,
        hasLicense: false,
      })
    }

    const now = new Date()
    const expiresAt = new Date(activeLicense.expiresAt)
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    return NextResponse.json({
      success: true,
      hasLicense: true,
      license: {
        key: activeLicense.licenseKey.key,
        productType: activeLicense.licenseKey.productType,
        expiresAt: activeLicense.expiresAt,
        isExpired: false,
        daysRemaining: Math.max(0, daysRemaining),
        hwid: activeLicense.hwid,
      },
    })
  } catch (error) {
    console.error("Check license error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
