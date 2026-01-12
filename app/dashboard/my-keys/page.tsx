import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ResellerKeysManager } from "@/components/reseller/reseller-keys-manager"

export default async function MyKeysPage() {
  const session = await requireAuth(["RESELLER"])

  if (session.role !== "RESELLER") {
    redirect("/dashboard")
  }

  const reseller = await prisma.reseller.findUnique({
    where: { userId: session.id },
    include: {
      issuedKeys: {
        orderBy: { createdAt: "desc" },
        include: {
          license: {
            include: { user: true },
          },
        },
      },
    },
  })

  if (!reseller) {
    redirect("/dashboard")
  }

  // Get available key types for purchase
  const availableKeyStats = await prisma.licenseKey.groupBy({
    by: ["duration", "price"],
    where: { status: "AVAILABLE", resellerId: null },
    _count: true,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Keys</h1>
        <p className="text-muted-foreground mt-1">Purchase and manage license keys</p>
      </div>
      <ResellerKeysManager reseller={reseller} availableKeyStats={availableKeyStats} />
    </div>
  )
}
