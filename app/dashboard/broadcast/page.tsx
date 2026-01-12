import { requireAuth } from "@/lib/auth"
import { BroadcastNotification } from "@/components/admin/broadcast-notification"
import { prisma } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Users, UserCog, User } from "lucide-react"

export default async function BroadcastPage() {
  await requireAuth(["OWNER", "ADMIN"])

  const [totalUsers, totalResellers, regularUsers] = await Promise.all([
    prisma.user.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "RESELLER", isActive: true } }),
    prisma.user.count({ where: { role: "USER", isActive: true } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Broadcast Center</h1>
        <p className="text-muted-foreground mt-1">Send announcements to your users</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Active Users</p>
              <p className="text-2xl font-bold text-foreground">{totalUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <UserCog className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resellers</p>
              <p className="text-2xl font-bold text-foreground">{totalResellers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold text-foreground">{regularUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <BroadcastNotification />
    </div>
  )
}
