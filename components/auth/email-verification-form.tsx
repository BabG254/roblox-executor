"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { verifyEmailAction, resendVerificationCodeAction } from "@/app/(auth)/actions"
import { Loader2 } from "lucide-react"

interface EmailVerificationFormProps {
  userId: string
}

export function EmailVerificationForm({ userId }: EmailVerificationFormProps) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  async function handleVerify() {
    if (!code) {
      toast.error("Please enter the verification code")
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyEmailAction(userId, code)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Email verified successfully!")
        router.push("/dashboard")
      }
    } catch {
      toast.error("Failed to verify email")
    } finally {
      setIsVerifying(false)
    }
  }

  async function handleResend() {
    setIsResending(true)
    try {
      const result = await resendVerificationCodeAction(userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Verification code sent to your email")
        setCode("")
        setResendCountdown(60)
        const interval = setInterval(() => {
          setResendCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      toast.error("Failed to resend verification code")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleVerify()
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          maxLength={6}
          className="bg-secondary/50 border-border/50 text-center text-lg tracking-widest font-mono"
          disabled={isVerifying}
        />
        <p className="text-xs text-muted-foreground">
          Check your email for the 6-digit code
        </p>
      </div>

      <Button
        type="submit"
        disabled={isVerifying || code.length !== 6}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
      >
        {isVerifying ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Email"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-secondary/40 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isResending || resendCountdown > 0}
        onClick={handleResend}
        className="w-full"
      >
        {isResending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : resendCountdown > 0 ? (
          `Resend in ${resendCountdown}s`
        ) : (
          "Didn't receive code? Resend"
        )}
      </Button>
    </form>
  )
}
