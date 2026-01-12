"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertTriangle, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"
import { submitAppealAction } from "@/app/dashboard/submit-appeal/actions"

interface User {
  id: string
  username: string
  email: string
}

interface Appeal {
  id: string
  reason: string
  type: string
  status: string
  resolution: string | null
  createdAt: Date
  resolvedAt: Date | null
  targetUser: { username: string }
}

interface AppealSubmissionProps {
  users: User[]
  appeals: Appeal[]
}

const appealTypes = [
  { value: "CHARGEBACK", label: "Chargeback" },
  { value: "ABUSE", label: "Terms of Service Abuse" },
  { value: "FRAUD", label: "Fraud" },
  { value: "OTHER", label: "Other" },
]

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

export function AppealSubmission({ users, appeals }: AppealSubmissionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [appealType, setAppealType] = useState("")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    if (!selectedUser || !appealType || !reason.trim()) {
      toast.error("Please fill all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitAppealAction(selectedUser, appealType, reason)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Appeal submitted successfully")
        setDialogOpen(false)
        setSelectedUser("")
        setAppealType("")
        setReason("")
      }
    } catch {
      toast.error("Failed to submit appeal")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* Submit Appeal */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            New Appeal
          </CardTitle>
          <CardDescription>Submit a request to terminate a user account for policy violations</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Appeal
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50">
                <DialogHeader>
                  <DialogTitle>Submit User Appeal</DialogTitle>
                  <DialogDescription>
                    Request admin review to terminate a user account. Provide detailed reasoning.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.username} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Appeal Type</Label>
                    <Select value={appealType} onValueChange={setAppealType}>
                      <SelectTrigger className="bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {appealTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Detailed Reason</Label>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Provide detailed reasoning for this appeal..."
                      className="bg-secondary/50 border-border/50 min-h-32"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Appeal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No users available. You can only appeal users who have redeemed your license keys.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appeal History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle>My Appeals ({appeals.length})</CardTitle>
          <CardDescription>Track the status of your submitted appeals</CardDescription>
        </CardHeader>
        <CardContent>
          {appeals.length > 0 ? (
            <div className="space-y-4">
              {appeals.map((appeal) => {
                const StatusIcon = statusIcons[appeal.status]
                return (
                  <div key={appeal.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon
                          className={`w-5 h-5 ${
                            appeal.status === "PENDING"
                              ? "text-amber-400"
                              : appeal.status === "APPROVED"
                                ? "text-green-400"
                                : "text-red-400"
                          }`}
                        />
                        <span className="font-medium text-foreground">{appeal.targetUser.username}</span>
                        <Badge variant="outline">{appeal.type}</Badge>
                      </div>
                      <Badge variant="secondary" className={statusColors[appeal.status]}>
                        {appeal.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{appeal.reason}</p>
                    {appeal.resolution && (
                      <div className="p-2 rounded bg-secondary/50 mb-2">
                        <p className="text-xs text-muted-foreground">Resolution: {appeal.resolution}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Submitted {new Date(appeal.createdAt).toLocaleDateString()}</span>
                      {appeal.resolvedAt && <span>Resolved {new Date(appeal.resolvedAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No appeals submitted yet</div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
