import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AuditLogViewer } from "@/components/admin/audit-log-viewer"

export default async function AuditPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      performedBy: true,
      user: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">System activity and security events</p>
      </div>
      <AuditLogViewer logs={logs} />
    </div>
  )
}
