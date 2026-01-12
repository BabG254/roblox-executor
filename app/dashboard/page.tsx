import { requireAuth } from "@/lib/auth"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { ResellerDashboard } from "@/components/dashboard/reseller-dashboard"
import { UserDashboard } from "@/components/dashboard/user-dashboard"

export default async function DashboardPage() {
  const session = await requireAuth()

  if (session.role === "OWNER" || session.role === "ADMIN") {
    return <AdminDashboard userId={session.id} role={session.role} />
  }

  if (session.role === "RESELLER") {
    return <ResellerDashboard userId={session.id} />
  }

  return <UserDashboard userId={session.id} />
}
