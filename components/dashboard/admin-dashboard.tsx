import { prisma } from "@/lib/db"
import { getKillSwitchState } from "@/lib/kill-switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Key, Download, AlertTriangle, TrendingUp, Shield, Activity, Package } from "lucide-react"
import type { UserRole } from "@/lib/auth"

interface AdminDashboardProps {
  userId: string
  role: UserRole
}

export async function AdminDashboard({ role }: AdminDashboardProps) {
  const [
    totalUsers,
    activeUsers,
    totalResellers,
    totalLicenseKeys,
    activeLicenses,
    totalDownloads,
    pendingAppeals,
    latestRelease,
    killSwitch,
    recentLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.reseller.count(),
    prisma.licenseKey.count(),
    prisma.license.count({ where: { isActive: true, expiresAt: { gt: new Date() } } }),
    prisma.download.count(),
    prisma.appeal.count({ where: { status: "PENDING" } }),
    prisma.softwareRelease.findFirst({ where: { isLatest: true } }),
    getKillSwitchState(),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { performedBy: true },
    }),
  ])

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users className="w-5 h-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Active Licenses",
      value: activeLicenses,
      icon: <Key className="w-5 h-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Resellers",
      value: totalResellers,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Total Downloads",
      value: totalDownloads,
      icon: <Download className="w-5 h-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s your system overview.</p>
      </div>

      {/* Kill Switch Alert */}
      {killSwitch?.isEnabled && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-destructive">Kill Switch Active</h3>
              <p className="text-sm text-destructive/80">
                All executor functions are disabled. {killSwitch.reason || "No reason provided."}
              </p>
            </div>
            {role === "OWNER" && (
              <Badge variant="destructive" className="animate-pulse">
                ACTIVE
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Key className="w-4 h-4" />
              License Keys
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicenseKeys}</div>
            <p className="text-xs text-muted-foreground mt-1">Total generated keys</p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((activeUsers / totalUsers) * 100) || 0}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Pending Appeals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAppeals}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Release & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Latest Release
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestRelease ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{latestRelease.version}</span>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                    Latest
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{latestRelease.changelog}</p>
                <p className="text-xs text-muted-foreground">
                  Published {latestRelease.publishedAt?.toLocaleDateString() || "N/A"}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No releases yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground">by {log.performedBy?.username || "System"}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
