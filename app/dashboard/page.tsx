import { requireAuth } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { ResellerDashboard } from "@/components/dashboard/reseller-dashboard"
import { UserDashboard } from "@/components/dashboard/user-dashboard"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  try {
    const session = await requireAuth()
    console.log("📊 Dashboard loaded for user:", session.email, "Role:", session.role)

  if (session.role === "OWNER" || session.role === "ADMIN") {
    return <AdminDashboard userId={session.id} role={session.role} />
  }

  if (session.role === "RESELLER") {
    return <ResellerDashboard userId={session.id} />
  }

  return <UserDashboard userId={session.id} />
  } catch (error) {
    console.error("❌ Dashboard error:", error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Dashboard Error</h1>
          <p className="text-muted-foreground mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
          <a href="/login" className="text-primary hover:underline">Return to Login</a>
        </div>
      </div>
    )
  }
}
