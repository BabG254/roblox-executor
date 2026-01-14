"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Wallet, TrendingUp, TrendingDown, Plus, ArrowUpRight, ArrowDownRight, DollarSign, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { depositAction } from "@/app/dashboard/wallet/actions"

interface Transaction {
  id: string
  amount: number
  type: string
  description: string | null
  createdAt: Date
}

interface Reseller {
  id: string
  balance: number
  totalDeposits: number
  totalPurchases: number
  transactions: Transaction[]
}

interface WalletManagerProps {
  reseller: Reseller
}

type PaymentMethod = "USDT" | "USDC" | "BNB" | "ZEC" | "LTC" | "SOL"

const PAYMENT_METHODS: Record<PaymentMethod, { chain: string; address: string; icon: string }> = {
  USDT: {
    chain: "ERC-20",
    address: "0x0c3b0513618fbd20fadb8f9d5d3894615e8660d7",
    icon: "T",
  },
  USDC: {
    chain: "ERC-20",
    address: "0x0c3b0513618fbd20fadb8f9d5d3894615e8660d7",
    icon: "$",
  },
  BNB: {
    chain: "BSC",
    address: "0x0c3b0513618fbd20fadb8f9d5d3894615e8660d7",
    icon: "B",
  },
  ZEC: {
    chain: "Native",
    address: "tex18vtn89pe6mvhvs4hl8cl4sh0urmum2e0mawn7c",
    icon: "Z",
  },
  LTC: {
    chain: "Native",
    address: "LXa84VHCSjAhjG8LNrmDCGkZ7N8QL4RVBx",
    icon: "L",
  },
  SOL: {
    chain: "Native",
    address: "DVcsSWtYUCnqETQ7kbfhD4BQGwMeqdLcaxYpdVKBUHtm",
    icon: "S",
  },
}

export function WalletManager({ reseller }: WalletManagerProps) {
  const [depositAmount, setDepositAmount] = useState("")
  const [isDepositing, setIsDepositing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)

  async function handleDeposit() {
    const amount = Number.parseFloat(depositAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsDepositing(true)
    try {
      const result = await depositAction(amount)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully deposited $${amount.toFixed(2)}`)
        setDialogOpen(false)
        setDepositAmount("")
        setSelectedMethod(null)
      }
    } catch {
      toast.error("Failed to process deposit")
    } finally {
      setIsDepositing(false)
    }
  }

  async function copyAddress(address: string) {
    await navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    toast.success("Address copied to clipboard")
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  return (
    <>
      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold text-green-400">${reseller.balance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-3xl font-bold text-blue-400">${reseller.totalDeposits.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-purple-400">${reseller.totalPurchases.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Balance Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
            <DollarSign className="w-5 h-5 mr-2" />
            Add Balance
          </Button>
        </DialogTrigger>
        <DialogContent className="glass border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Add Balance</DialogTitle>
            <DialogDescription>Add funds to your account balance. You can use these funds to purchase licenses directly.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Amount Section */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Amount USD</Label>
              <div className="relative mb-4">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  step={0.01}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 bg-secondary/50 border-border/50 text-lg h-11"
                />
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="bg-secondary/50 border-border/50 hover:bg-secondary/70"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Payment Method Section */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(PAYMENT_METHODS).map(([method, details]) => (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method as PaymentMethod)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedMethod === method
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border/50 bg-secondary/30 hover:bg-secondary/50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 font-bold text-white bg-gradient-to-br from-purple-600 to-purple-700">
                      {details.icon}
                    </div>
                    <p className="font-semibold text-sm">{method}</p>
                    <p className="text-xs text-muted-foreground mt-1">{details.chain}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Wallet Address Section */}
            {selectedMethod && (
              <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Send {selectedMethod} to this address:</p>
                  <div className="bg-secondary/50 border border-border/50 rounded p-3 flex items-center justify-between group">
                    <code className="text-xs font-mono break-all flex-1">{PAYMENT_METHODS[selectedMethod].address}</code>
                    <button
                      onClick={() => copyAddress(PAYMENT_METHODS[selectedMethod].address)}
                      className="ml-2 p-2 hover:bg-secondary/70 rounded transition-colors"
                    >
                      {copiedAddress === PAYMENT_METHODS[selectedMethod].address ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">⚠️ Double-check the address. Do not send to incorrect addresses.</p>
              </div>
            )}

            {/* Current Balance */}
            <div className="bg-secondary/30 border border-border/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Current balance</p>
              <p className="text-2xl font-bold text-green-400">${reseller.balance.toFixed(2)}</p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false)
                setSelectedMethod(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount || !selectedMethod}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {isDepositing ? "Processing..." : `Add $${depositAmount || "0.00"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reseller.transactions.length > 0 ? (
              reseller.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === "DEPOSIT" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? (
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "DEPOSIT" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass border-border/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold text-green-400">${reseller.balance.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deposits</p>
                <p className="text-3xl font-bold text-blue-400">${reseller.totalDeposits.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-3xl font-bold text-purple-400">${reseller.totalPurchases.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="w-full md:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Add Funds
          </Button>
        </DialogTrigger>
        <DialogContent className="glass border-border/50">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you want to deposit. Funds will be available immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min={1}
                  step={0.01}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-9 bg-secondary/50 border-border/50"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setDepositAmount(amount.toString())}
                  className="bg-secondary/50"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} disabled={isDepositing || !depositAmount}>
              {isDepositing ? "Processing..." : "Deposit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reseller.transactions.length > 0 ? (
              reseller.transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        tx.type === "DEPOSIT" ? "bg-green-500/10" : "bg-red-500/10"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? (
                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === "DEPOSIT" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "DEPOSIT" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  )
}
