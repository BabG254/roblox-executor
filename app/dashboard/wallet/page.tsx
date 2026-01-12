import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { WalletManager } from "@/components/reseller/wallet-manager"

export default async function WalletPage() {
  const session = await requireAuth(["RESELLER"])

  if (session.role !== "RESELLER") {
    redirect("/dashboard")
  }

  const reseller = await prisma.reseller.findUnique({
    where: { userId: session.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  })

  if (!reseller) {
    redirect("/dashboard")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Wallet</h1>
        <p className="text-muted-foreground mt-1">Manage your reseller balance and transactions</p>
      </div>
      <WalletManager reseller={reseller} />
    </div>
  )
}
