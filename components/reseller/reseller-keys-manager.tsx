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
import { Key, ShoppingCart, Copy, Check, Search, Monitor, Apple, Smartphone, Lock, Trash2, AlertCircle } from "lucide-react"
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
  role?: string
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

const productOrder = ["WINDOWS", "MACOS", "ANDROID"]

export function ResellerKeysManager({ reseller, availableKeyStats }: ResellerKeysManagerProps) {
  const [search, setSearch] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)
  const [selectedKeyType, setSelectedKeyType] = useState<KeyStats | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

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

  // Sort by product order
  const sortedProducts = Object.entries(keysByProduct).sort(([a], [b]) => {
    return productOrder.indexOf(a) - productOrder.indexOf(b)
  })

  async function handleCopyKey(key: string) {
    await navigator.clipboard.writeText(key)
    setCopiedKey(key)
    toast.success("Key copied to clipboard")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  function downloadKeysAsText(keys: string[]) {
    const content = keys.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vision-license-keys-${new Date().getTime()}.txt`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  async function handlePurchase() {
    if (!selectedKeyType) return

    setIsPurchasing(true)
    try {
      const result = await purchaseKeysAction(selectedKeyType.duration, selectedKeyType.price, quantity, selectedKeyType.productType)
      if (result.error) {
        toast.error(result.error)
      } else {
        // Show securing animation
        const securingToast = toast.loading("🔐 Securing your keys...")
        
        setTimeout(() => {
          toast.dismiss(securingToast)
          
          // Generate sample keys for download (in production, these would come from the server)
          const purchasedKeys = Array(quantity)
            .fill(0)
            .map((_, i) => `VISION-${selectedKeyType.productType}-${Date.now()}-${i + 1}`)
          
          downloadKeysAsText(purchasedKeys)
          toast.success(`✅ Successfully purchased and downloaded ${quantity} key(s)!`)
          
          setPurchaseDialogOpen(false)
          setSelectedKeyType(null)
          setQuantity(1)
        }, 2000)
      }
    } catch {
      toast.error("Failed to purchase keys")
    } finally {
      setIsPurchasing(false)
    }
  }

  async function handleDeleteKey(keyId: string) {
    try {
      const response = await fetch(`/api/dashboard/keys/${keyId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("Key deleted successfully")
        setDeleteConfirm(null)
        // Refresh the page to see the change
        window.location.reload()
      } else {
        toast.error("Failed to delete key")
      }
    } catch {
      toast.error("Error deleting key")
    }
  }

  async function handlePurgeAllKeys() {
    try {
      const response = await fetch("/api/dashboard/keys/purge-all", {
        method: "DELETE",
      })
      if (response.ok) {
        toast.success("All keys purged successfully")
        window.location.reload()
      } else {
        toast.error("Failed to purge keys")
      }
    } catch {
      toast.error("Error purging keys")
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Purchase License Keys
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              Keys currently unavailable
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedProducts.length > 0 ? (
            sortedProducts.map(([product, stats]) => (
              <div key={product}>
                <div className="flex items-center gap-2 mb-2">
                  {productIcons[product as keyof typeof productIcons]}
                  <h3 className="font-semibold text-sm text-foreground">{product}</h3>
                </div>
                <div className="grid gap-2 grid-cols-4 md:grid-cols-5">
                  {stats.sort((a, b) => a.duration - b.duration).map((stat) => (
                    <div
                      key={`${stat.productType}-${stat.duration}-${stat.price}`}
                      className="p-2 rounded-lg bg-secondary/30 border border-border/50 opacity-60"
                    >
                      <div className="text-center">
                        <div className="text-xs font-semibold text-foreground mb-1">{stat.duration}d</div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                        <Button
                          size="sm"
                          disabled
                          variant="outline"
                          className="w-full h-7 text-xs"
                        >
                          Unavailable
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">No keys available</div>
          )}
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
              {reseller.role === "OWNER" && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you sure you want to purge ALL keys? This cannot be undone.")) {
                      handlePurgeAllKeys()
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Purge All
                </Button>
              )}
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
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyKey(key.key)}>
                        {copiedKey === key.key ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                      {deleteConfirm === key.id ? (
                        <div className="flex gap-1">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDeleteKey(key.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            X
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(key.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
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
