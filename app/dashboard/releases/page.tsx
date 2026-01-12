import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { ReleasesManager } from "@/components/admin/releases-manager"

export default async function ReleasesPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const releases = await prisma.softwareRelease.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { downloads: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Software Releases</h1>
        <p className="text-muted-foreground mt-1">Manage executor versions and downloads</p>
      </div>
      <ReleasesManager releases={releases} />
    </div>
  )
}
