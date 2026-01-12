"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, MoreHorizontal, UserCog, DollarSign, Ban, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { toggleResellerStatus, adjustBalance } from "@/app/dashboard/resellers/actions"

interface Reseller {
  id: string
  balance: number
  totalDeposits: number
  totalPurchases: number
  isActive: boolean
  createdAt: Date
  user: {
    id: string
    username: string
    email: string
  }
  _count: {
    issuedKeys: number
    transactions: number
  }
}

interface ResellersManagerProps {
  resellers: Reseller[]
}

export function ResellersManager({ resellers }: ResellersManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null)
  const [adjustmentAmount, setAdjustmentAmount] = useState("")
  const [dialogType, setDialogType] = useState<"adjust" | "toggle" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredResellers = resellers.filter(
    (r) =>
      r.user.username.toLowerCase().includes(search.toLowerCase()) ||
      r.user.email.toLowerCase().includes(search.toLowerCase()),
  )

  async function handleAction() {
    if (!selectedReseller) return
    setIsLoading(true)

    try {
      if (dialogType === "toggle") {
        await toggleResellerStatus(selectedReseller.id, !selectedReseller.isActive)
        toast.success(`Reseller ${selectedReseller.isActive ? "deactivated" : "activated"}`)
      } else if (dialogType === "adjust") {
        const amount = Number.parseFloat(adjustmentAmount)
        if (Number.isNaN(amount)) {
          toast.error("Invalid amount")
          return
        }
        await adjustBalance(selectedReseller.id, amount)
        toast.success(`Balance adjusted by $${amount.toFixed(2)}`)
      }
    } catch {
      toast.error("Action failed")
    } finally {
      setIsLoading(false)
      setSelectedReseller(null)
      setDialogType(null)
      setAdjustmentAmount("")
    }
  }

  const totalBalance = resellers.reduce((acc, r) => acc + r.balance, 0)
  const totalKeys = resellers.reduce((acc, r) => acc + r._count.issuedKeys, 0)

  return (
    <>
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Resellers</p>
            <p className="text-2xl font-bold text-foreground">{resellers.length}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Combined Balance</p>
            <p className="text-2xl font-bold text-green-400">${totalBalance.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="glass border-border/50">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Keys Issued</p>
            <p className="text-2xl font-bold text-purple-400">{totalKeys}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-primary" />
              All Resellers
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search resellers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-secondary/50 border-border/50"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Reseller</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Balance</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Keys Issued</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredResellers.map((reseller) => (
                  <tr key={reseller.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{reseller.user.username}</p>
                        <p className="text-sm text-muted-foreground">{reseller.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-green-400">${reseller.balance.toFixed(2)}</span>
                    </td>
                    <td className="p-4 text-sm">{reseller._count.issuedKeys}</td>
                    <td className="p-4">
                      <Badge
                        variant="secondary"
                        className={reseller.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}
                      >
                        {reseller.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {new Date(reseller.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReseller(reseller)
                              setDialogType("adjust")
                            }}
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            Adjust Balance
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReseller(reseller)
                              setDialogType("toggle")
                            }}
                          >
                            {reseller.isActive ? (
                              <>
                                <Ban className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {filteredResellers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No resellers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Balance Dialog */}
      <Dialog open={dialogType === "adjust"} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>
              Adjust balance for <strong>{selectedReseller?.user.username}</strong>. Use negative values to deduct.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <span className="text-muted-foreground">Current Balance</span>
              <span className="font-semibold text-green-400">${selectedReseller?.balance.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <Label>Adjustment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="number"
                  step={0.01}
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">Use negative values to deduct from balance</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button onClick={handleAction} disabled={isLoading || !adjustmentAmount}>
              {isLoading ? "Processing..." : "Adjust Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={dialogType === "toggle"} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>{selectedReseller?.isActive ? "Deactivate Reseller" : "Activate Reseller"}</DialogTitle>
            <DialogDescription>
              {selectedReseller?.isActive
                ? `This will prevent ${selectedReseller?.user.username} from purchasing keys and accessing reseller features.`
                : `This will restore ${selectedReseller?.user.username}'s reseller privileges.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogType(null)}>
              Cancel
            </Button>
            <Button
              variant={selectedReseller?.isActive ? "destructive" : "default"}
              onClick={handleAction}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : selectedReseller?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
