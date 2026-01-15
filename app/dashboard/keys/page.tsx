import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { LicenseKeysManager } from "@/components/admin/license-keys-manager"

export default async function LicenseKeysPage() {
  const session = await requireAuth(["OWNER", "ADMIN"])

  if (session.role !== "OWNER" && session.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const licenseKeys = await prisma.licenseKey.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      license: {
        include: { user: true },
      },
      reseller: {
        include: { user: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">License Keys</h1>
        <p className="text-muted-foreground mt-1">Generate and manage license keys</p>
      </div>
      <LicenseKeysManager licenseKeys={licenseKeys} role={session.role} />
    </div>
  )
}
