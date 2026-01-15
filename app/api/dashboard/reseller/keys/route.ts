import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "RESELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const status = request.nextUrl.searchParams.get("status") || "all"
    const product = request.nextUrl.searchParams.get("product") || "all"

    const reseller = await prisma.reseller.findUnique({
      where: { userId: session.id },
    })

    if (!reseller) {
      return NextResponse.json({ error: "Reseller not found" }, { status: 404 })
    }

    let whereClause: any = { resellerId: reseller.id }

    if (status !== "all") {
      whereClause.status = status
    }

    if (product !== "all") {
      whereClause.productType = product
    }

    const keys = await prisma.licenseKey.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    const stats = await prisma.licenseKey.groupBy({
      by: ["status"],
      where: { resellerId: reseller.id },
      _count: true,
    })

    const statsMap = {
      totalKeys: 0,
      availableKeys: 0,
      assignedKeys: 0,
      redeemedKeys: 0,
    }

    stats.forEach((stat) => {
      statsMap.totalKeys += stat._count
      if (stat.status === "AVAILABLE") statsMap.availableKeys = stat._count
      if (stat.status === "ASSIGNED") statsMap.assignedKeys = stat._count
      if (stat.status === "REDEEMED") statsMap.redeemedKeys = stat._count
    })

    const formattedKeys = keys.map((key) => ({
      id: key.id,
      key: key.key,
      productType: key.productType,
      duration: key.duration,
      price: key.price,
      status: key.status,
      createdAt: key.createdAt,
    }))

    return NextResponse.json({
      keys: formattedKeys,
      stats: statsMap,
    })
  } catch (error) {
    console.error("Error fetching reseller keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
