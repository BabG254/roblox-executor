"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ShieldAlert, ShieldCheck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { toggleKillSwitchAction } from "@/app/dashboard/kill-switch/actions"

interface KillSwitch {
  id: string
  isEnabled: boolean
  enabledAt: Date | null
  reason: string | null
}

interface KillSwitchControlProps {
  killSwitch: KillSwitch
}

export function KillSwitchControl({ killSwitch }: KillSwitchControlProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  async function handleToggle() {
    if (killSwitch.isEnabled) {
      // Disabling - no confirmation needed beyond dialog
      setIsLoading(true)
      try {
        await toggleKillSwitchAction(false)
        toast.success("Kill switch disabled. All services restored.")
      } catch {
        toast.error("Failed to disable kill switch")
      } finally {
        setIsLoading(false)
        setShowDialog(false)
      }
    } else {
      // Enabling - needs confirmation text
      if (confirmText !== "ENABLE KILL SWITCH") {
        toast.error("Please type the confirmation text exactly")
        return
      }
      setIsLoading(true)
      try {
        await toggleKillSwitchAction(true, reason)
        toast.success("Kill switch enabled. All executors are now disabled.")
      } catch {
        toast.error("Failed to enable kill switch")
      } finally {
        setIsLoading(false)
        setShowDialog(false)
        setConfirmText("")
        setReason("")
      }
    }
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Card */}
        <Card className={`glass border-2 ${killSwitch.isEnabled ? "border-destructive" : "border-green-500/50"}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {killSwitch.isEnabled ? (
                <>
                  <ShieldAlert className="w-6 h-6 text-destructive" />
                  <span className="text-destructive">Kill Switch ACTIVE</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6 text-green-400" />
                  <span className="text-green-400">System Operational</span>
                </>
              )}
            </CardTitle>
            <CardDescription>
              {killSwitch.isEnabled
                ? "All executor functions are currently disabled globally."
                : "All systems are running normally."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge
                  variant={killSwitch.isEnabled ? "destructive" : "secondary"}
                  className={killSwitch.isEnabled ? "" : "bg-green-500/10 text-green-400"}
                >
                  {killSwitch.isEnabled ? "ENABLED" : "DISABLED"}
                </Badge>
              </div>
              {killSwitch.isEnabled && killSwitch.enabledAt && (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                    <span className="text-sm text-muted-foreground">Enabled At</span>
                    <span className="text-sm">{new Date(killSwitch.enabledAt).toLocaleString()}</span>
                  </div>
                  {killSwitch.reason && (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-muted-foreground mb-1">Reason</p>
                      <p className="text-sm text-destructive">{killSwitch.reason}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Control Card */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Emergency Controls
            </CardTitle>
            <CardDescription>Use these controls only in emergency situations.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-sm text-amber-400">
                  {killSwitch.isEnabled
                    ? "The kill switch is currently active. Disabling it will restore all executor functionality."
                    : "Enabling the kill switch will immediately disable all executor functions for all users. Use only in emergencies."}
                </p>
              </div>
              <Button
                variant={killSwitch.isEnabled ? "default" : "destructive"}
                size="lg"
                className="w-full"
                onClick={() => setShowDialog(true)}
              >
                {killSwitch.isEnabled ? (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Disable Kill Switch
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-5 h-5 mr-2" />
                    Enable Kill Switch
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="glass border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle className={killSwitch.isEnabled ? "" : "text-destructive"}>
              {killSwitch.isEnabled ? "Disable Kill Switch?" : "Enable Kill Switch?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {killSwitch.isEnabled
                ? "This will restore all executor functionality for all users."
                : "This will immediately disable all executor functions globally. All users will lose access until the kill switch is disabled."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!killSwitch.isEnabled && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Input
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is the kill switch being enabled?"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-destructive">
                  Type &quot;ENABLE KILL SWITCH&quot; to confirm
                </Label>
                <Input
                  id="confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="ENABLE KILL SWITCH"
                  className="bg-secondary/50 border-border/50"
                />
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggle}
              disabled={isLoading || (!killSwitch.isEnabled && confirmText !== "ENABLE KILL SWITCH")}
              className={killSwitch.isEnabled ? "" : "bg-destructive hover:bg-destructive/90"}
            >
              {isLoading ? "Processing..." : killSwitch.isEnabled ? "Disable" : "Enable Kill Switch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
