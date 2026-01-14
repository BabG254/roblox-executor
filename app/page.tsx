import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowRight, Shield, Zap, Lock, Users, TrendingUp, CheckCircle2 } from "lucide-react"

export default async function Home() {
  const session = await getSession()
  
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <img src="/logo.png" alt="vision" className="w-full h-full object-contain p-1" />
            </div>
            <span className="text-xl font-bold">vision</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-primary/10">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium">
                ✨ All in One Platform
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Meet <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">vision</span>
              <br /> The Ultimate Executor
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Seamlessly manage projects, automate tasks, and collaborate in real-time across all apps and devices—all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-base">
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-base">
                View Demo
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 rounded-xl border border-border/50 bg-primary/5 backdrop-blur hover:border-primary/30 transition-colors">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">Bank-level encryption and security protocols to protect your data</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-primary/5 backdrop-blur hover:border-primary/30 transition-colors">
              <Zap className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Optimized performance for instant execution and real-time updates</p>
            </div>
            <div className="p-6 rounded-xl border border-border/50 bg-primary/5 backdrop-blur hover:border-primary/30 transition-colors">
              <Lock className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Premium Features</h3>
              <p className="text-muted-foreground">Unlock exclusive tools and capabilities for power users</p>
            </div>
          </div>

          {/* Features Section */}
          <section className="mt-32">
            <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground">Track your progress with detailed insights and real-time metrics</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
                    <p className="text-muted-foreground">Work together seamlessly with built-in collaboration tools</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">API Integration</h3>
                    <p className="text-muted-foreground">Connect with your favorite apps and services effortlessly</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="aspect-video bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-center">
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-32 text-center">
            <div className="inline-block p-px bg-gradient-to-r from-primary/50 to-primary/20 rounded-2xl">
              <div className="bg-background rounded-2xl px-8 sm:px-12 py-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
                <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are already using vision to manage their projects and collaborate with their teams.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-base">
                      Create Free Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground mt-6">No credit card required • Free tier available</p>
              </div>
            </div>
          </section>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 backdrop-blur-sm mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 sm:mb-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <img src="/logo.png" alt="vision" className="w-full h-full object-contain p-1" />
              </div>
              <span className="font-semibold">vision</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 vision. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
