import { LoginForm } from "@/components/auth/login-form"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function LoginPage() {
  const session = await getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Modal Container */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-secondary/60 to-secondary/40 backdrop-blur-xl shadow-2xl p-8 space-y-8">
          {/* Header with Logo */}
          <div className="text-center space-y-4">
            <Link href="/" className="inline-flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="vision Logo"
                  width={48}
                  height={48}
                  className="object-contain p-1"
                />
              </div>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Sign in</h1>
              <p className="text-muted-foreground mt-1">Welcome back to vision</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b border-border/30">
            <button className="pb-4 text-foreground font-medium border-b-2 border-primary">
              Sign in
            </button>
            <Link href="/register" className="pb-4 text-muted-foreground hover:text-foreground transition-colors">
              Sign up
            </Link>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8 text-xs text-muted-foreground space-y-2">
          <p>
            By signing in, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
