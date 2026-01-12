import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { AppealsManager } from "@/components/admin/appeals-manager"

export default async function AppealsPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const appeals = await prisma.appeal.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      targetUser: true,
      submitter: true,
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Appeals</h1>
        <p className="text-muted-foreground mt-1">Review and resolve user termination requests</p>
      </div>
      <AppealsManager appeals={appeals} />
    </div>
  )
}
