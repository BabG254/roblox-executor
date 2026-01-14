"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EmailVerificationForm } from "@/components/auth/email-verification-form"
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get userId from sessionStorage
    const storedUserId = sessionStorage.getItem("pendingVerificationUserId")
    
    if (!storedUserId) {
      // If no userId in sessionStorage, redirect to register
      router.push("/register")
      return
    }

    setUserId(storedUserId)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary/50 via-secondary/30 to-secondary/50 backdrop-blur-sm">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!userId) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-secondary/50 via-secondary/30 to-secondary/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-secondary/60 to-secondary/40 backdrop-blur-xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Verify Email</h1>
            <p className="text-muted-foreground">We sent a verification code to your email</p>
          </div>

          <EmailVerificationForm userId={userId} />
        </div>
      </div>
    </div>
  )
}
