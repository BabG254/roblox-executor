"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, History, Shield, Key, User, Package, AlertTriangle } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  createdAt: Date
  performedBy: { username: string } | null
  user: { username: string } | null
}

interface AuditLogViewerProps {
  logs: AuditLog[]
}

const actionIcons: Record<string, typeof User> = {
  USER: User,
  LICENSE: Key,
  RELEASE: Package,
  KILL_SWITCH: Shield,
  APPEAL: AlertTriangle,
}

const actionColors: Record<string, string> = {
  USER_LOGIN: "bg-blue-500/10 text-blue-400",
  USER_LOGOUT: "bg-muted text-muted-foreground",
  USER_CREATED: "bg-green-500/10 text-green-400",
  USER_UPDATED: "bg-amber-500/10 text-amber-400",
  USER_DELETED: "bg-red-500/10 text-red-400",
  USER_FORCE_LOGOUT: "bg-orange-500/10 text-orange-400",
  LICENSE_KEY_CREATED: "bg-green-500/10 text-green-400",
  LICENSE_KEY_REVOKED: "bg-red-500/10 text-red-400",
  RELEASE_CREATED: "bg-blue-500/10 text-blue-400",
  RELEASE_PUBLISHED: "bg-green-500/10 text-green-400",
  KILL_SWITCH_ENABLED: "bg-red-500/10 text-red-400",
  KILL_SWITCH_DISABLED: "bg-green-500/10 text-green-400",
}

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  const [search, setSearch] = useState("")
  const [entityFilter, setEntityFilter] = useState<string>("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details?.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy?.username.toLowerCase().includes(search.toLowerCase())
    const matchesEntity = entityFilter === "all" || log.entityType === entityFilter
    return matchesSearch && matchesEntity
  })

  const entityTypes = [...new Set(logs.map((l) => l.entityType))]

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Activity Log
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-32 bg-secondary/50 border-border/50">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {entityTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const Icon = actionIcons[log.entityType] || History
            return (
              <div
                key={log.id}
                className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className={actionColors[log.action] || "bg-muted text-muted-foreground"}>
                      {log.action.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{log.entityType}</span>
                  </div>
                  {log.details && <p className="text-sm text-foreground mb-1">{log.details}</p>}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>by {log.performedBy?.username || "System"}</span>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
