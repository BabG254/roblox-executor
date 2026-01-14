"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Key, ShoppingCart, Copy, Check, Search, Monitor, Apple, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { purchaseKeysAction } from "@/app/dashboard/my-keys/actions"

interface LicenseKey {
  id: string
  key: string
  duration: number
  price: number
  productType: string
  status: string
  createdAt: Date
  license: {
    user: { username: string; email: string }
    expiresAt: Date
  } | null
}

interface Reseller {
  id: string
  balance: number
  issuedKeys: LicenseKey[]
}

interface KeyStats {
  duration: number
  price: number
  productType: string
  _count: number
}

interface ResellerKeysManagerProps {
  reseller: Reseller
  availableKeyStats: KeyStats[]
}

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-500/10 text-green-400",
  ASSIGNED: "bg-blue-500/10 text-blue-400",
  REDEEMED: "bg-purple-500/10 text-purple-400",
}

const productIcons: Record<string, React.ReactNode> = {
  WINDOWS: <Monitor className="w-4 h-4" />,
  MACOS: <Apple className="w-4 h-4" />,
  ANDROID: <Smartphone className="w-4 h-4" />,
}

export function ResellerKeysManager({ reseller, availableKeyStats }: ResellerKeysManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedKeyType, setSelectedKeyType] = useState<KeyStats | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const filteredKeys = reseller.issuedKeys.filter((key) => {
    const matchesSearch =
      key.key.toLowerCase().includes(search.toLowerCase()) ||
      key.license?.user.username.toLowerCase().includes(search.toLowerCase())
    const matchesProduct = !selectedProduct || key.productType === selectedProduct
    return matchesSearch && matchesProduct
  })

  const keysByProduct = availableKeyStats.reduce(
    (acc, stat) => {
      const key = `${stat.productType}`
      if (!acc[key]) acc[key] = []
      acc[key].push(stat)
      return acc
    },
    {} as Record<string, KeyStats[]>,
  )

  async function handleCopyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success("Key copied to clipboard")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  async function handlePurchase() {
    if (!selectedKeyType) return

    setIsPurchasing(true)
    try {
      const result = await purchaseKeysAction(selectedKeyType.duration, selectedKeyType.price, quantity, selectedKeyType.productType)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully purchased ${quantity} ${selectedKeyType.productType} key(s)`)
        setPurchaseDialogOpen(false)
        setSelectedKeyType(null)
        setQuantity(1)
      }
    } catch {
      toast.error("Failed to purchase keys")
    } finally {
      setIsPurchasing(false)
    }
  }

  const totalCost = selectedKeyType ? selectedKeyType.price * quantity : 0

  return (
    <>
      {/* Purchase Section */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Purchase License Keys
          </CardTitle>
          <CardDescription>Available balance: ${reseller.balance.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(keysByProduct).length > 0 ? (
            Object.entries(keysByProduct).map(([product, stats]) => (
              <div key={product}>
                <div className="flex items-center gap-2 mb-4">
                  {productIcons[product as keyof typeof productIcons]}
                  <h3 className="font-semibold text-foreground">{product}</h3>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={`${stat.productType}-${stat.duration}-${stat.price}`}
                      className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {stat.duration}d
                        </Badge>
                        <span className="text-xs text-muted-foreground">{stat._count} left</span>
                      </div>
                      <p className="text-2xl font-bold text-foreground mb-3">${stat.price.toFixed(2)}</p>
                      <Dialog
                        open={purchaseDialogOpen && selectedKeyType?.productType === product && selectedKeyType?.duration === stat.duration}
                        onOpenChange={(open) => {
                          setPurchaseDialogOpen(open)
                          if (open) setSelectedKeyType(stat)
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button size="sm" className="w-full">
                            Buy
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-border/50">
                          <DialogHeader>
                            <DialogTitle>Purchase {product} License Keys</DialogTitle>
                            <DialogDescription>
                              {stat.duration} day keys at ${stat.price.toFixed(2)} each
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                              <span className="text-muted-foreground">Your Balance</span>
                              <span className="font-semibold text-green-400">${reseller.balance.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm text-muted-foreground">Quantity</label>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                >
                                  -
                                </Button>
                                <Input
                                  type="number"
                                  min={1}
                                  max={stat._count}
                                  value={quantity}
                                  onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                                  className="w-20 text-center bg-secondary/50 border-border/50"
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => setQuantity(Math.min(stat._count, quantity + 1))}
                                >
                                  +
                                </Button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                              <span className="text-muted-foreground">Total Cost</span>
                              <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
                            </div>
                            {totalCost > reseller.balance && (
                              <p className="text-sm text-destructive">Insufficient balance. Add funds to continue.</p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handlePurchase}
                              disabled={isPurchasing || totalCost > reseller.balance || quantity < 1}
                            >
                              {isPurchasing ? "Processing..." : "Confirm Purchase"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No keys available for purchase</div>
          )}
        </CardContent>
      </Card>

      {/* My Keys */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-col md:flex-row gap-4">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              My Purchased Keys ({reseller.issuedKeys.length})
            </CardTitle>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search keys..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
              <select
                value={selectedProduct || ""}
                onChange={(e) => setSelectedProduct(e.target.value || null)}
                className="px-3 rounded-md border border-border/50 bg-secondary/50 text-foreground text-sm"
              >
                <option value="">All Products</option>
                {Object.keys(productIcons).map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border/50 overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Key</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assigned To</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <code className="text-sm font-mono text-primary">{key.key}</code>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {productIcons[key.productType as keyof typeof productIcons]}
                        <span className="text-sm">{key.productType}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">{key.duration}d</td>
                    <td className="p-4">
                      <Badge variant="secondary" className={statusColors[key.status]}>
                        {key.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {key.license?.user ? (
                        <div>
                          <p className="text-foreground">{key.license.user.username}</p>
                          <p className="text-xs text-muted-foreground">{key.license.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyKey(key.key)}>
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No keys found
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

  return (
    <>
      {/* Purchase Section */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Purchase License Keys
          </CardTitle>
          <CardDescription>Available balance: ${reseller.balance.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent>
          {availableKeyStats.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {availableKeyStats.map((stat) => (
                <div
                  key={`${stat.duration}-${stat.price}`}
                  className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {stat.duration} Days
                    </Badge>
                    <span className="text-xs text-muted-foreground">{stat._count} available</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground mb-3">${stat.price.toFixed(2)}</p>
                  <Dialog
                    open={purchaseDialogOpen && selectedKeyType?.duration === stat.duration}
                    onOpenChange={(open) => {
                      setPurchaseDialogOpen(open)
                      if (open) setSelectedKeyType(stat)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full">
                        Purchase
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-border/50">
                      <DialogHeader>
                        <DialogTitle>Purchase License Keys</DialogTitle>
                        <DialogDescription>
                          {stat.duration} day keys at ${stat.price.toFixed(2)} each
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                          <span className="text-muted-foreground">Your Balance</span>
                          <span className="font-semibold text-green-400">${reseller.balance.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">Quantity</label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              max={stat._count}
                              value={quantity}
                              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                              className="w-20 text-center bg-secondary/50 border-border/50"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setQuantity(Math.min(stat._count, quantity + 1))}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="text-xl font-bold text-primary">${totalCost.toFixed(2)}</span>
                        </div>
                        {totalCost > reseller.balance && (
                          <p className="text-sm text-destructive">Insufficient balance</p>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handlePurchase}
                          disabled={isPurchasing || totalCost > reseller.balance || quantity < 1}
                        >
                          {isPurchasing ? "Processing..." : "Confirm Purchase"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No keys available for purchase</div>
          )}
        </CardContent>
      </Card>

      {/* My Keys */}
      <Card className="glass border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              My Purchased Keys ({reseller.issuedKeys.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search keys..."
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
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Key</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Assigned To</th>
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
                    <td className="p-4">
                      <Badge variant="secondary" className={statusColors[key.status]}>
                        {key.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm">
                      {key.license?.user ? (
                        <span className="text-foreground">{key.license.user.username}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyKey(key.key)}>
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No keys found
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
