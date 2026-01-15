import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.role !== "RESELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const reseller = await prisma.reseller.findUnique({
      where: { userId: session.id },
    })

    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found" }, { status: 404 })
    }

    // Get all issued keys for earnings calculation
    const issuedKeys = await prisma.licenseKey.findMany({
      where: { resellerId: reseller.id },
    })

    const totalEarnings = issuedKeys.reduce((sum, key) => sum + key.price, 0)

    return NextResponse.json({
      balance: reseller.balance,
      currency: "USD",
      totalEarnings: totalEarnings,
      totalPaid: totalEarnings - reseller.balance,
      totalKeys: issuedKeys.length,
      paymentAddresses: {
        bitcoin: "1A1z7agoat...",
        ethereum: "0x742d35Cc...",
        litecoin: "LdT4Lfz...",
        dogecoin: "DJxhEz...",
        monero: "45E8D...",
        zcash: "t1ZYE...",
      },
    })
  } catch (error) {
    console.error("Error fetching reseller wallet:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
