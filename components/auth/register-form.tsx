"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { registerAction } from "@/app/(auth)/actions"
import Link from "next/link"

export function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await registerAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Account created! Please verify your email.")
        // Store the userId temporarily for verification page
        if (result.userId) {
          sessionStorage.setItem("pendingVerificationUserId", result.userId)
          router.push("/verify-email")
        }
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6 w-full">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-foreground">
              First Name
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="John"
              required
              disabled={isPending}
              className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastname" className="text-sm font-medium text-foreground">
              Last Name
            </label>
            <Input
              id="lastname"
              name="lastname"
              type="text"
              placeholder="Doe"
              disabled={isPending}
              className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            disabled={isPending}
            className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              minLength={8}
              disabled={isPending}
              className="w-full px-4 py-3 bg-secondary/50 border border-border/50 rounded-lg focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">At least 8 characters</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="terms" name="terms" required className="rounded" />
        <label htmlFor="terms" className="text-sm text-muted-foreground">
          I agree to the{" "}
          <Link href="#" className="text-primary hover:underline">
            Terms of Service
          </Link>
        </label>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create an account"
        )}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/30" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-background text-muted-foreground">OR SIGN UP WITH</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="bg-secondary/50 border border-border/50 hover:bg-secondary/70 text-foreground"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          className="bg-secondary/50 border border-border/50 hover:bg-secondary/70 text-foreground"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.38-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.38C2.79 15.25 3.51 7.59 9.05 7.31c1.35.08 2.29.74 3.08.8.905-.12 1.96-.74 3.08-.8 5.42-.29 6.14 7.86 2.84 13.17z"/>
            <path d="M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        </Button>
      </div>

      <p className="text-sm text-center text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in here
        </Link>
      </p>
    </form>
  )
}
