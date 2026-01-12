"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Megaphone, Send } from "lucide-react"
import { toast } from "sonner"
import { broadcastNotificationAction } from "@/app/dashboard/notifications/actions"

export function BroadcastNotification() {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetRole, setTargetRole] = useState<"ALL" | "RESELLER" | "USER">("ALL")
  const [isSending, setIsSending] = useState(false)

  async function handleBroadcast() {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message")
      return
    }

    setIsSending(true)
    try {
      const result = await broadcastNotificationAction(title, message, targetRole)
      toast.success(`Notification sent to ${result.count} users`)
      setTitle("")
      setMessage("")
    } catch {
      toast.error("Failed to send broadcast")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card className="glass border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-primary" />
          Broadcast Notification
        </CardTitle>
        <CardDescription>Send announcements to all users or specific roles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="target">Target Audience</Label>
          <Select value={targetRole} onValueChange={(v) => setTargetRole(v as typeof targetRole)}>
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Users</SelectItem>
              <SelectItem value="RESELLER">Resellers Only</SelectItem>
              <SelectItem value="USER">Regular Users Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Notification title"
            className="bg-secondary/50 border-border/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Notification message..."
            className="bg-secondary/50 border-border/50 min-h-24"
          />
        </div>
        <Button onClick={handleBroadcast} disabled={isSending || !title.trim() || !message.trim()} className="w-full">
          {isSending ? (
            "Sending..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
