"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Key, Copy, Check, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { generateKeysAction, revokeKeyAction } from "@/app/dashboard/keys/actions"
import type { UserRole } from "@/lib/auth"

interface LicenseKey {
  id: string
  key: string
  duration: number
  price: number
  status: string
  createdAt: Date
  license: {
    user: { username: string; email: string }
    expiresAt: Date
  } | null
  reseller: {
    user: { username: string }
  } | null
}

interface LicenseKeysManagerProps {
  licenseKeys: LicenseKey[]
  role: UserRole
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500/10 text-green-400",
  ASSIGNED: "bg-blue-500/10 text-blue-400",
  REDEEMED: "bg-purple-500/10 text-purple-400",
  REVOKED: "bg-red-500/10 text-red-400",
}

export function LicenseKeysManager({ licenseKeys, role }: LicenseKeysManagerProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isPurging, setIsPurging] = useState(false)

  const filteredKeys = licenseKeys.filter((key) => {
    const matchesSearch = key.key.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || key.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleGenerateKeys(formData: FormData) {
    setIsGenerating(true)
    try {
      const result = await generateKeysAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Generated ${result.count} license keys`)
        setGenerateDialogOpen(false)
      }
    } catch {
      toast.error("Failed to generate keys")
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleCopyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success("Key copied to clipboard")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  async function handleRevokeKey(keyId: string) {
    try {
      await revokeKeyAction(keyId)
      toast.success("Key revoked successfully")
    } catch {
      toast.error("Failed to revoke key")
    }
  }

  async function handlePurgeAll() {
    const confirmed = window.confirm("Purge ALL license keys? This cannot be undone.")
    if (!confirmed) return
    setIsPurging(true)
    try {
      const res = await fetch("/api/dashboard/keys/purge-all", { method: "DELETE" })
      if (!res.ok) {
        toast.error("Failed to purge keys")
      } else {
        toast.success("All license keys purged")
      }
    } catch (error) {
      toast.error("Error purging keys")
    } finally {
      setIsPurging(false)
    }
  }

  const stats = {
    total: licenseKeys.length,
    available: licenseKeys.filter((k) => k.status === "AVAILABLE").length,
    redeemed: licenseKeys.filter((k) => k.status === "REDEEMED").length,
    revoked: licenseKeys.filter((k) => k.status === "REVOKED").length,
  }

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Keys", value: stats.total, color: "text-foreground" },
          { label: "Available", value: stats.available, color: "text-green-400" },
          { label: "Redeemed", value: stats.redeemed, color: "text-purple-400" },
          { label: "Revoked", value: stats.revoked, color: "text-red-400" },
        ].map((stat) => (
          <Card key={stat.label} className="glass border-border/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              All License Keys
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search keys..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-secondary/50 border-border/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="REDEEMED">Redeemed</SelectItem>
                  <SelectItem value="REVOKED">Revoked</SelectItem>
                </SelectContent>
              </Select>
              {role === "OWNER" && (
                <Button
                  variant="outline"
                  onClick={handlePurgeAll}
                  disabled={isPurging}
                  className="whitespace-nowrap"
                >
                  {isPurging ? "Purging..." : "Purge All"}
                </Button>
              )}
              <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Keys
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass border-border/50">
                  <DialogHeader>
                    <DialogTitle>Generate License Keys</DialogTitle>
                    <DialogDescription>Create new license keys with specified duration and price.</DialogDescription>
                  </DialogHeader>
                  <form action={handleGenerateKeys}>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="count">Number of Keys</Label>
                        <Input
                          id="count"
                          name="count"
                          type="number"
                          min={1}
                          max={100}
                          defaultValue={1}
                          className="bg-secondary/50 border-border/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (Days)</Label>
                        <Select name="duration" defaultValue="30">
                          <SelectTrigger className="bg-secondary/50 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 Days</SelectItem>
                            <SelectItem value="30">30 Days</SelectItem>
                            <SelectItem value="90">90 Days</SelectItem>
                            <SelectItem value="365">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min={0}
                          step={0.01}
                          defaultValue={10}
                          className="bg-secondary/50 border-border/50"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setGenerateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? "Generating..." : "Generate"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Key</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Price</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">User / Reseller</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <code className="text-sm font-mono text-primary">{key.key}</code>
                    </td>
                    <td className="p-4 text-sm">{key.duration} days</td>
                    <td className="p-4 text-sm">${key.price.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className={statusColors[key.status]}>
                        {key.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {key.license?.user ? (
                        <span className="text-foreground">{key.license.user.username}</span>
                      ) : key.reseller?.user ? (
                        <span className="text-amber-400">{key.reseller.user.username} (Reseller)</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyKey(key.key)}>
                          {copiedKey === key.key ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        {key.status === "AVAILABLE" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No license keys found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
