"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Key, Calendar, Clock, Shield, Plus, History } from "lucide-react"
import { toast } from "sonner"
import { redeemKeyAction } from "@/app/dashboard/license/actions"

interface LicenseKey {
  key: string
  duration: number
}

interface License {
  id: string
  activatedAt: Date
  expiresAt: Date
  isActive: boolean
  licenseKey: LicenseKey
}

interface LicenseManagerProps {
  activeLicense: License | null
  allLicenses: License[]
}

export function LicenseManager({ activeLicense, allLicenses }: LicenseManagerProps) {
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [licenseKey, setLicenseKey] = useState("")
  const [isRedeeming, setIsRedeeming] = useState(false)

  const daysRemaining = activeLicense
    ? Math.max(0, Math.ceil((activeLicense.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const totalDays = activeLicense?.licenseKey.duration || 0
  const progress = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0

  async function handleRedeem() {
    if (!licenseKey.trim()) {
      toast.error("Please enter a license key")
      return
    }

    setIsRedeeming(true)
    try {
      const result = await redeemKeyAction(licenseKey.trim())
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("License key redeemed successfully!")
        setRedeemDialogOpen(false)
        setLicenseKey("")
      }
    } catch {
      toast.error("Failed to redeem key")
    } finally {
      setIsRedeeming(false)
    }
  }

  return (
    <>
      {/* Active License Card */}
      <Card className={`glass border-2 ${activeLicense ? "border-primary/50" : "border-border/50"} overflow-hidden`}>
        {activeLicense && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />}
        <CardContent className="p-6 relative">
          <div className="flex items-center gap-6">
            <div
              className={`w-20 h-20 rounded-2xl ${activeLicense ? "bg-primary/10" : "bg-secondary"} flex items-center justify-center`}
            >
              {activeLicense ? (
                <Shield className="w-10 h-10 text-primary" />
              ) : (
                <Key className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeLicense ? "License Active" : "No Active License"}
                </h2>
                {activeLicense && <Badge className="bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>}
              </div>
              {activeLicense ? (
                <>
                  <p className="text-muted-foreground mb-4">
                    Your license expires on {activeLicense.expiresAt.toLocaleDateString()}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span className="font-medium text-foreground">{daysRemaining} days</span>
                    </div>
                    <Progress value={100 - progress} className="h-2" />
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Redeem a license key to access the executor.</p>
              )}
            </div>
            <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="w-5 h-5 mr-2" />
                  {activeLicense ? "Extend License" : "Redeem Key"}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass border-border/50">
                <DialogHeader>
                  <DialogTitle>Redeem License Key</DialogTitle>
                  <DialogDescription>Enter your license key to activate or extend your subscription.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="key">License Key</Label>
                    <Input
                      id="key"
                      value={licenseKey}
                      onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="bg-secondary/50 border-border/50 font-mono text-center text-lg tracking-wider"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRedeemDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleRedeem} disabled={isRedeeming || !licenseKey.trim()}>
                    {isRedeeming ? "Redeeming..." : "Redeem"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* License Details */}
      {activeLicense && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Key</p>
                  <code className="text-sm font-mono text-foreground">{activeLicense.licenseKey.key}</code>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Activated</p>
                  <p className="font-medium text-foreground">{activeLicense.activatedAt.toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground">{activeLicense.licenseKey.duration} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* License History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            License History
          </CardTitle>
          <CardDescription>Your past and present licenses</CardDescription>
        </CardHeader>
        <CardContent>
          {allLicenses.length > 0 ? (
            <div className="space-y-3">
              {allLicenses.map((license) => {
                const isExpired = license.expiresAt < new Date()
                return (
                  <div
                    key={license.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${isExpired ? "bg-muted" : "bg-green-500/10"} flex items-center justify-center`}
                      >
                        <Key className={`w-5 h-5 ${isExpired ? "text-muted-foreground" : "text-green-400"}`} />
                      </div>
                      <div>
                        <code className="text-sm font-mono text-foreground">{license.licenseKey.key}</code>
                        <p className="text-xs text-muted-foreground">
                          {license.licenseKey.duration} days | Activated{" "}
                          {new Date(license.activatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        isExpired
                          ? "bg-muted text-muted-foreground"
                          : license.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                      }
                    >
                      {isExpired ? "Expired" : license.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No license history</div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
