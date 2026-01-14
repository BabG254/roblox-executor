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
        {/* Header with Logo and Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center justify-center mb-6">
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Sign in to vision</h1>
          <p className="text-muted-foreground">Welcome back to your executor platform</p>
        </div>

        {/* Form Card */}
        <div className="bg-gradient-to-b from-secondary/50 to-secondary/30 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-xl">
          <LoginForm />
        </div>

        {/* Footer Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>
            {" "}and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
