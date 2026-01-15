import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const licenses = await prisma.license.findMany({
      where: { userId: session.id },
      include: {
        licenseKey: true,
      },
    })

    const formattedLicenses = licenses.map((license) => {
      const now = new Date()
      const expiresAt = new Date(license.expiresAt)
      const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: license.id,
        key: license.licenseKey.key,
        productType: license.licenseKey.productType,
        issuedAt: license.activatedAt,
        expiresAt: license.expiresAt,
        status: daysRemaining > 0 ? "ACTIVE" : "EXPIRED",
        daysRemaining: Math.max(0, daysRemaining),
        hwid: license.hwid,
      }
    })

    return NextResponse.json({ licenses: formattedLicenses })
  } catch (error) {
    console.error("Error fetching licenses:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
