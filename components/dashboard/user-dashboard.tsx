import { prisma } from "@/lib/db"
import { getKillSwitchState } from "@/lib/kill-switch"
import { getUserActiveLicense } from "@/lib/license"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Key, Download, Clock, Shield, Package, Bell } from "lucide-react"
import Link from "next/link"

interface UserDashboardProps {
  userId: string
}

export async function UserDashboard({ userId }: UserDashboardProps) {
  const [license, killSwitch, latestRelease, notifications, downloads] = await Promise.all([
    getUserActiveLicense(userId),
    getKillSwitchState(),
    prisma.softwareRelease.findFirst({
      where: { isLatest: true, isPublished: true },
    }),
    prisma.notification.findMany({
      where: {
        OR: [{ isGlobal: true }, { targetRole: "USER" }],
        expiresAt: { gt: new Date() },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.download.count({ where: { userId } }),
  ])

  const daysRemaining = license
    ? Math.max(0, Math.ceil((license.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome Back</h1>
        <p className="text-muted-foreground mt-1">Here&apos;s your account overview.</p>
      </div>

      {/* Kill Switch Alert */}
      {killSwitch?.isEnabled && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-destructive">Service Temporarily Unavailable</h3>
              <p className="text-sm text-destructive/80">
                The executor is currently disabled for maintenance. Please check back later.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* License Status */}
      <Card className="glass border-border/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground">License Status</h2>
                {license ? (
                  <>
                    <p className="text-muted-foreground">Expires on {license.expiresAt.toLocaleDateString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="bg-green-500/10 text-green-400">
                        Active
                      </Badge>
                      <Badge variant="outline">{daysRemaining} days remaining</Badge>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-muted-foreground">No active license</p>
                    <Badge variant="secondary" className="mt-2 bg-red-500/10 text-red-400">
                      Inactive
                    </Badge>
                  </>
                )}
              </div>
            </div>
            <Link href="/dashboard/license">
              <Button variant="secondary">{license ? "View Details" : "Redeem Key"}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Downloads */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Download className="w-4 h-4" />
              Total Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downloads}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        {/* License Duration */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Days Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysRemaining}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {daysRemaining > 0 ? "Until expiration" : "License expired"}
            </p>
          </CardContent>
        </Card>

        {/* Latest Version */}
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              Latest Version
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestRelease?.version || "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">{latestRelease ? "Available" : "No releases"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Download */}
        {latestRelease && license && !killSwitch?.isEnabled && (
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Quick Download
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">{latestRelease.version}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{latestRelease.changelog}</p>
                </div>
                <Link href="/dashboard/downloads">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Latest
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={
                          notification.type === "WARNING"
                            ? "border-amber-500 text-amber-500"
                            : notification.type === "ALERT"
                              ? "border-red-500 text-red-500"
                              : "border-blue-500 text-blue-500"
                        }
                      >
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No notifications</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
