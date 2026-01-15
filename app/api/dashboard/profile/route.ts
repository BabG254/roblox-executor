import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        licenses: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let profile: any = {
      balance: 0,
      licenseCount: user.licenses.length,
      issuedKeysCount: 0,
      totalSpent: 0,
    }

    // If reseller, get reseller-specific data
    if (user.role === "RESELLER") {
      const reseller = await prisma.reseller.findUnique({
        where: { userId: user.id },
        include: {
          issuedKeys: true,
        },
      })

      if (reseller) {
        profile.balance = reseller.balance
        profile.issuedKeysCount = reseller.issuedKeys.length
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      profile,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
