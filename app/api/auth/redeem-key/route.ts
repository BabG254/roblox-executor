import { prisma } from "@/lib/db"
import { getSessionFromToken } from "@/lib/auth"
import { logAudit } from "@/lib/audit"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { licenseKey, hwid } = body

    if (!licenseKey) {
      return NextResponse.json({ error: "License key is required" }, { status: 400 })
    }

    const key = await prisma.licenseKey.findUnique({
      where: { key: licenseKey },
      include: { license: true },
    })

    if (!key) {
      return NextResponse.json({ error: "Invalid license key" }, { status: 404 })
    }

    if (key.status !== "AVAILABLE") {
      return NextResponse.json({ error: "License key already used" }, { status: 400 })
    }

    // Check if user already has an active license
    const existingLicense = await prisma.license.findFirst({
      where: {
        userId: session.userId,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingLicense) {
      return NextResponse.json({ error: "You already have an active license" }, { status: 400 })
    }

    // Create license and update key status
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + key.duration)

    const license = await prisma.license.create({
      data: {
        userId: session.userId,
        licenseKeyId: key.id,
        expiresAt,
        isActive: true,
        hwid: hwid || null,
      },
    })

    await prisma.licenseKey.update({
      where: { id: key.id },
      data: { status: "REDEEMED" },
    })

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"

    await logAudit(
      "LICENSE_ACTIVATED",
      "License",
      license.id,
      `Key: ${key.key}, Duration: ${key.duration} days`,
      session.userId,
      session.userId,
      ip,
    )

    return NextResponse.json({
      success: true,
      message: "License activated successfully",
      license: {
        key: key.key,
        productType: key.productType,
        duration: key.duration,
        expiresAt: license.expiresAt,
        hwid: license.hwid,
      },
    })
  } catch (error) {
    console.error("Redeem key error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
