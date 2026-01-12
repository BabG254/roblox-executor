import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Key, TrendingUp, Clock } from "lucide-react"

interface ResellerDashboardProps {
  userId: string
}

export async function ResellerDashboard({ userId }: ResellerDashboardProps) {
  const reseller = await prisma.reseller.findUnique({
    where: { userId },
    include: {
      transactions: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
      issuedKeys: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  })

  const totalKeysIssued = await prisma.licenseKey.count({
    where: { resellerId: reseller?.id },
  })

  const pendingAppeals = await prisma.appeal.count({
    where: { submitterId: userId, status: "PENDING" },
  })

  if (!reseller) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="glass border-border/50 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Reseller Account Not Active</h2>
            <p className="text-muted-foreground">
              Your reseller account is not yet activated. Please contact an administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      label: "Wallet Balance",
      value: `$${reseller.balance.toFixed(2)}`,
      icon: <Wallet className="w-5 h-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Total Deposits",
      value: `$${reseller.totalDeposits.toFixed(2)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Keys Issued",
      value: totalKeysIssued,
      icon: <Key className="w-5 h-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Pending Appeals",
      value: pendingAppeals,
      icon: <Clock className="w-5 h-5" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reseller Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your wallet, keys, and transactions.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass border-border/50 hover:border-border transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Transactions */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reseller.transactions.length > 0 ? (
                reseller.transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{tx.description || "No description"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "DEPOSIT" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No transactions yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Keys */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Recent Keys Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reseller.issuedKeys.length > 0 ? (
                reseller.issuedKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <code className="text-sm font-mono text-primary">{key.key}</code>
                      <p className="text-xs text-muted-foreground">{key.duration} days</p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        key.status === "AVAILABLE"
                          ? "bg-green-500/10 text-green-400"
                          : key.status === "ASSIGNED"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-muted text-muted-foreground"
                      }
                    >
                      {key.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No keys purchased yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
