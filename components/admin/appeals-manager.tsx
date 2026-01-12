"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Clock, CheckCircle, XCircle, User, FileText } from "lucide-react"
import { toast } from "sonner"
import { resolveAppealAction } from "@/app/dashboard/appeals/actions"

interface Appeal {
  id: string
  reason: string
  type: string
  status: string
  resolution: string | null
  createdAt: Date
  resolvedAt: Date | null
  targetUser: { id: string; username: string; email: string }
  submitter: { username: string }
}

interface AppealsManagerProps {
  appeals: Appeal[]
}

const statusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle,
  REJECTED: XCircle,
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-400",
  APPROVED: "bg-green-500/10 text-green-400",
  REJECTED: "bg-red-500/10 text-red-400",
}

const typeColors: Record<string, string> = {
  CHARGEBACK: "bg-red-500/10 text-red-400 border-red-500/20",
  ABUSE: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FRAUD: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  OTHER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
}

export function AppealsManager({ appeals }: AppealsManagerProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [resolution, setResolution] = useState("")
  const [resolutionStatus, setResolutionStatus] = useState<"APPROVED" | "REJECTED">("APPROVED")
  const [isResolving, setIsResolving] = useState(false)

  const filteredAppeals = appeals.filter((appeal) => statusFilter === "all" || appeal.status === statusFilter)

  const stats = {
    pending: appeals.filter((a) => a.status === "PENDING").length,
    approved: appeals.filter((a) => a.status === "APPROVED").length,
    rejected: appeals.filter((a) => a.status === "REJECTED").length,
  }

  async function handleResolve() {
    if (!selectedAppeal || !resolution.trim()) {
      toast.error("Please provide a resolution")
      return
    }

    setIsResolving(true)
    try {
      await resolveAppealAction(selectedAppeal.id, resolutionStatus, resolution, selectedAppeal.targetUser.id)
      toast.success(`Appeal ${resolutionStatus.toLowerCase()}`)
      setSelectedAppeal(null)
      setResolution("")
    } catch {
      toast.error("Failed to resolve appeal")
    } finally {
      setIsResolving(false)
    }
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400/50" />
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400/50" />
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400/50" />
          </CardContent>
        </Card>
      </div>

      {/* Appeals List */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              All Appeals
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppeals.length > 0 ? (
            <div className="space-y-4">
              {filteredAppeals.map((appeal) => {
                const StatusIcon = statusIcons[appeal.status]
                return (
                  <div
                    key={appeal.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-border transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-foreground">{appeal.targetUser.username}</span>
                            <Badge variant="outline" className={typeColors[appeal.type]}>
                              {appeal.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Submitted by {appeal.submitter.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={statusColors[appeal.status]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {appeal.status}
                        </Badge>
                        {appeal.status === "PENDING" && (
                          <Button size="sm" onClick={() => setSelectedAppeal(appeal)}>
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-2">{appeal.reason}</p>
                    {appeal.resolution && (
                      <div className="p-2 rounded bg-secondary/50 mb-2">
                        <p className="text-xs text-muted-foreground">Resolution: {appeal.resolution}</p>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">{new Date(appeal.createdAt).toLocaleString()}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No appeals found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={!!selectedAppeal} onOpenChange={() => setSelectedAppeal(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Resolve Appeal</DialogTitle>
            <DialogDescription>
              Review appeal against <strong>{selectedAppeal?.targetUser.username}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Appeal Reason</p>
              <p className="text-foreground">{selectedAppeal?.reason}</p>
            </div>
            <div className="space-y-2">
              <Label>Decision</Label>
              <Select value={resolutionStatus} onValueChange={(v) => setResolutionStatus(v as "APPROVED" | "REJECTED")}>
                <SelectTrigger className="bg-secondary/50 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">Approve (Terminate User)</SelectItem>
                  <SelectItem value="REJECTED">Reject (Keep User Active)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution Notes</Label>
              <Textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Provide reasoning for your decision..."
                className="bg-secondary/50 border-border/50 min-h-24"
              />
            </div>
            {resolutionStatus === "APPROVED" && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">Approving this appeal will deactivate the user account.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAppeal(null)}>
              Cancel
            </Button>
            <Button
              variant={resolutionStatus === "APPROVED" ? "destructive" : "default"}
              onClick={handleResolve}
              disabled={isResolving || !resolution.trim()}
            >
              {isResolving
                ? "Processing..."
                : resolutionStatus === "APPROVED"
                  ? "Approve & Terminate"
                  : "Reject Appeal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
