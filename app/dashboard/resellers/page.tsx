import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ResellersManager } from "@/components/admin/resellers-manager"

export default async function ResellersPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const resellers = await prisma.reseller.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      _count: { select: { issuedKeys: true, transactions: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Resellers</h1>
        <p className="text-muted-foreground mt-1">Manage reseller accounts and balances</p>
      </div>
      <ResellersManager resellers={resellers} />
    </div>
  )
}
