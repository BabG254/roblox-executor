import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const keyId = params.id

    // Get the key to verify ownership
    const key = await prisma.licenseKey.findUnique({
      where: { id: keyId },
      include: {
        license: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!key) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 })
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: session.id },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check ownership: either the key's user or reseller/owner
    const isOwner = key.license?.userId === session.id || user.role === "RESELLER" || user.role === "OWNER"

    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete the key
    await prisma.licenseKey.delete({
      where: { id: keyId },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        action: "KEY_DELETED",
        entityType: "LICENSE_KEY",
        entityId: keyId,
        performedById: session.id,
        details: `Deleted license key ${key.key}`,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting key:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
