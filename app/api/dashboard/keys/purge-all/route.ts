import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Only OWNER can purge all keys
    if (user.role !== "OWNER") {
      return NextResponse.json({ error: "Only owners can purge all keys" }, { status: 403 })
    }

    // Delete all license keys
    const result = await prisma.licenseKey.deleteMany({})

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "KEYS_PURGED",
        entityType: "LICENSE_KEYS",
        performedById: session.id,
        details: `Purged ${result.count} license keys`,
      },
    })

    return NextResponse.json({ success: true, deletedCount: result.count })
  } catch (error) {
    console.error("Error purging keys:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
