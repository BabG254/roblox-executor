"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Info, AlertTriangle, AlertCircle, Megaphone } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: string
  isGlobal: boolean
  createdAt: Date
  expiresAt: Date | null
}

interface NotificationsViewerProps {
  notifications: Notification[]
}

const typeIcons: Record<string, typeof Info> = {
  INFO: Info,
  WARNING: AlertTriangle,
  ALERT: AlertCircle,
  UPDATE: Megaphone,
}

const typeColors: Record<string, { bg: string; text: string; border: string }> = {
  INFO: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  WARNING: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
  ALERT: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  UPDATE: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20" },
}

export function NotificationsViewer({ notifications }: NotificationsViewerProps) {
  const activeNotifications = notifications.filter((n) => !n.expiresAt || new Date(n.expiresAt) > new Date())

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          All Notifications ({activeNotifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeNotifications.length > 0 ? (
          <div className="space-y-4">
            {activeNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Info
              const colors = typeColors[notification.type] || typeColors.INFO

              return (
                <div key={notification.id} className={`p-4 rounded-lg ${colors.bg} border ${colors.border}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${colors.text}`}>{notification.title}</h3>
                        <Badge variant="outline" className={`${colors.border} ${colors.text}`}>
                          {notification.type}
                        </Badge>
                        {notification.isGlobal && (
                          <Badge variant="secondary" className="bg-muted text-muted-foreground">
                            Global
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No notifications at this time</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
