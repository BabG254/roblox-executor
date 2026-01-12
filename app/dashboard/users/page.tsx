import { requireAuth, canManageUsers } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { UsersTable } from "@/components/admin/users-table"

export default async function UsersPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (!canManageUsers(session.role)) {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      licenses: {
        where: { isActive: true, expiresAt: { gt: new Date() } },
      },
      reseller: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">Manage all registered users</p>
        </div>
      </div>
      <UsersTable users={users} currentUserRole={session.role} />
    </div>
  )
}
